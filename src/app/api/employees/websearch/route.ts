import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { EmployeeSearchService } from "@/lib/openai";

// Type guard function to check if object is an employee
function isEmployeeObject(obj: any): obj is { full_name: string; [key: string]: any } {
  return (
    obj &&
    typeof obj === "object" &&
    "full_name" in obj &&
    typeof obj.full_name === "string" &&
    obj.full_name.length > 0
  );
}

// Create server-side Supabase client
async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Auth error:", authError);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Authenticated user:", user.id);

    const body = await req.json();

    // Validate required fields
    if (!body.companyName || !body.jobTitle) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          message: "Company name and job title are required",
          received: { companyName: body.companyName, jobTitle: body.jobTitle },
        },
        { status: 400 }
      );
    }

    console.log("🔍 Searching employees for:", {
      companyName: body.companyName,
      jobTitle: body.jobTitle,
      location: body.location,
    });

    // 2. Search employees using OpenAI
    let employees: any[] = [];
    let citations: Array<{ url: string; title?: string }> = [];
    let usedWebSearch = false;
    let linkedinPeopleSearchUrl: string | undefined;

    try {
      console.log("🚀 Calling EmployeeSearchService...");
      const searchResult = await EmployeeSearchService.searchEmployees({
        companyName: body.companyName,
        jobTitle: body.jobTitle,
        location: body.location,
      });

      console.log("🔍 OpenAI Search Result type:", typeof searchResult);
      console.log("🔍 OpenAI Search Result:", JSON.stringify(searchResult, null, 2));

      // Handle different response formats
      if (searchResult && typeof searchResult === "object") {
        // New SearchResult format
        if ("data" in searchResult) {
          employees = Array.isArray(searchResult.data) ? searchResult.data : [];
          citations = Array.isArray(searchResult.citations) ? searchResult.citations : [];
          usedWebSearch = Boolean(searchResult.usedWebSearch);
          linkedinPeopleSearchUrl = searchResult.linkedinPeopleSearchUrl;
        }
        // Legacy array format (fallback)
        else if (Array.isArray(searchResult)) {
          employees = searchResult;
          citations = [];
          usedWebSearch = false;
        }
        // Single object format
        else if (isEmployeeObject(searchResult)) {
          employees = [searchResult];
          citations = [];
          usedWebSearch = false;
        }
        // Unknown object format
        else {
          console.warn("⚠️ Unknown object format from OpenAI:", searchResult);
          employees = [];
        }
      }
      // Direct array response
      else if (Array.isArray(searchResult)) {
        employees = searchResult;
        citations = [];
        usedWebSearch = false;
      }
      // Unexpected format
      else {
        console.warn("⚠️ Unexpected response format from OpenAI:", typeof searchResult);
        employees = [];
      }

      console.log("✅ Extracted employees count:", employees.length);
      console.log("✅ Citations count:", citations.length);
      console.log("✅ Used web search:", usedWebSearch);

      // Validate employees data
      if (!Array.isArray(employees) || employees.length === 0) {
        console.warn("⚠️ No valid employees returned from OpenAI");
        throw new Error("No employees found at this company");
      }

      // Validate each employee has required fields
      employees = employees.filter(
        (employee) =>
          employee &&
          typeof employee === "object" &&
          (employee.full_name || employee.fullName || employee.name) &&
          (employee.job_title || employee.jobTitle || employee.title)
      );

      if (employees.length === 0) {
        throw new Error("No valid employees found with complete information");
      }
    } catch (openaiError) {
      console.error("OpenAI search error:", openaiError);

      // Return proper error (same pattern as company search)
      return NextResponse.json(
        {
          error: "Unable to find employees at this company",
          message:
            "Our AI search service is temporarily unavailable. Please try again in a few minutes or try a different company.",
          details: process.env.NODE_ENV === "development" ? String(openaiError) : undefined,
        },
        { status: 503 }
      ); // 503 Service Unavailable
    }

    console.log("📊 Final employees to process:", employees.length);

    // 3. Get company_id from company_suggestions table (REQUIRED)
    const { data: companyData, error: companyError } = await supabase
      .from("company_suggestions")
      .select("id")
      .eq("name", body.companyName)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (companyError || !companyData) {
      console.error("❌ Company not found in database:", companyError);
      return NextResponse.json(
        {
          error: "Company not found",
          message: "Please search for companies first before looking for employees.",
        },
        { status: 400 }
      );
    }

    console.log("✅ Found company in database:", companyData.id);

    // 4. Transform employees to match frontend expectations AND database constraints
    const transformedEmployees = employees.map((emp: any, index: number) => {
      // ✅ Map relevance scores to match database constraint EXACTLY
      let relevanceScore = emp.relevance_score || emp.relevanceScore || "Average Contact";

      // Map any variation to the 3 allowed values
      if (relevanceScore.toLowerCase().includes("perfect")) {
        relevanceScore = "Perfect Contact";
      } else if (relevanceScore.toLowerCase().includes("good")) {
        relevanceScore = "Good Contact";
      } else {
        // Default fallback for anything else (Potential Match, Worth Reaching Out, etc.)
        relevanceScore = "Average Contact";
      }

      return {
        id: `employee-${index}`,
        fullName: emp.fullName || emp.full_name || emp.name || "Unknown",
        jobTitle: emp.jobTitle || emp.job_title || emp.title || "Unknown",
        location: emp.location || "Unknown",
        linkedinUrl: emp.linkedinUrl || emp.linkedin_url || "",
        relevanceScore: relevanceScore,
        source: emp.source || "OpenAI Web Search",
      };
    });

    console.log("🔄 Transformed employees:", transformedEmployees);

    const employeesToInsert = transformedEmployees.map((emp: any) => ({
      id: crypto.randomUUID(),
      user_id: user.id,
      company_id: companyData.id,
      name: emp.fullName,
      title: emp.jobTitle,
      location: emp.location,
      linkedinUrl: emp.linkedinUrl,
      relevanceScore: emp.relevanceScore,
      source: emp.source,
      created_at: new Date().toISOString(),
    }));

    console.log("💾 Inserting employees to database:", employeesToInsert.length);

    // 5. Save to database (SAME AS COMPANIES - FAIL IF ERROR)
    const { error: employeesError } = await supabase
      .from("employee_contacts")
      .insert(employeesToInsert);

    if (employeesError) {
      console.error("❌ Employees save error:", employeesError);
      return NextResponse.json({ error: "Failed to save employees" }, { status: 500 });
    }

    console.log("✅ Employees saved to database successfully");

    // 6. Return response with database IDs (SAME AS COMPANIES)
    const responseData = {
      success: true,
      employees: transformedEmployees.map((emp: any, index: number) => ({
        ...emp,
        id: employeesToInsert[index].id, // ✅ INCLUDE DATABASE ID
      })),
      citations: citations || [],
      usedWebSearch: usedWebSearch || false,
      total: transformedEmployees.length,
      message: `Found ${transformedEmployees.length} employees at ${body.companyName}`,
      linkedinPeopleSearchUrl: linkedinPeopleSearchUrl || null,
    };

    console.log("✅ Returning response with", transformedEmployees.length, "employees");
    return NextResponse.json(responseData);
  } catch (error) {
    console.error("❌ Unexpected API Error:", error);
    console.error("❌ Error stack:", error instanceof Error ? error.stack : "No stack trace");

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred while processing your request.",
        details:
          process.env.NODE_ENV === "development"
            ? {
                error: String(error),
                stack: error instanceof Error ? error.stack : undefined,
                timestamp: new Date().toISOString(),
              }
            : undefined,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Employees WebSearch API",
    status: "active",
    timestamp: new Date().toISOString(),
  });
}
