import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

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

    const body = await req.json();
    const { companyName, location } = body;

    if (!companyName || typeof companyName !== "string" || !companyName.trim()) {
      return NextResponse.json(
        {
          error: "Company name is required",
        },
        { status: 400 }
      );
    }

    console.log("Adding manual company:", { companyName, location, userId: user.id });

    // Check if user exists in users table, if not create it
    const { data: existingUser, error: userCheckError } = await supabase
      .from("users")
      .select("id")
      .eq("id", user.id)
      .single();

    if (userCheckError && userCheckError.code === "PGRST116") {
      // User doesn't exist in users table, create it
      console.log("Creating user in users table...");
      const { error: userCreateError } = await supabase.from("users").insert({
        id: user.id,
        email: user.email,
        plan: "freemium",
        email_credits: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (userCreateError) {
        console.error("User creation error:", userCreateError);
        return NextResponse.json({ error: "Failed to create user profile" }, { status: 500 });
      }
    } else if (userCheckError) {
      console.error("User check error:", userCheckError);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    // Create company record
    const companyId = crypto.randomUUID();
    const companyData = {
      id: companyId,
      user_id: user.id,
      search_criteria_id: null, // No search criteria for manual entry
      name: companyName.trim(),
      logoUrl: null,
      description: "Manually added company",
      estimatedEmployees: "Unknown",
      relevanceScore: "Good Match",
      location: location || "Not specified",
      linkedinUrl: null,
      websiteUrl: null,
      source: "Manual Entry",
      created_at: new Date().toISOString(),
    };

    console.log("Inserting manual company:", companyData);

    const { error: companyError } = await supabase.from("company_suggestions").insert(companyData);

    if (companyError) {
      console.error("❌ Error creating manual company:", companyError);
      return NextResponse.json(
        {
          error: "Failed to add company",
          details: companyError.message,
        },
        { status: 500 }
      );
    }

    console.log("✅ Manual company added successfully:", companyId);

    // Return the company data in the same format as other endpoints
    const responseCompany = {
      id: companyData.id,
      name: companyData.name,
      logoUrl: companyData.logoUrl,
      description: companyData.description,
      estimatedEmployees: companyData.estimatedEmployees,
      relevanceScore: companyData.relevanceScore,
      location: companyData.location,
      url: companyData.websiteUrl,
      linkedinUrl: companyData.linkedinUrl,
      source: companyData.source,
    };

    return NextResponse.json({
      success: true,
      company: responseCompany,
      message: `Company "${companyName}" added successfully`,
    });
  } catch (error) {
    console.error("Unexpected error in manual company addition:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred. Please try again.",
      },
      { status: 500 }
    );
  }
}
