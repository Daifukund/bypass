import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { OPENAI_PROMPTS } from "@/constants/prompts";
import crypto from "crypto";

// Enhanced interface for type safety
interface LinkedInEmployee {
  full_name?: string;
  fullName?: string;
  name?: string;
  job_title?: string;
  jobTitle?: string;
  title?: string;
  location?: string;
  linkedin_url?: string;
  linkedinUrl?: string;
  relevance_score?: string;
  relevanceScore?: string;
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

// 🚀 IMPROVEMENT 6: Enhanced content pre-processing
function preprocessLinkedInContent(content: string): string {
  console.log("🧹 Pre-processing LinkedIn content...");

  // Remove common LinkedIn noise
  let cleaned = content
    // Remove "Connect" buttons and similar UI elements
    .replace(/\b(Connect|Follow|Message|View profile)\b/gi, "")
    // Remove degree indicators (1st, 2nd, 3rd connections)
    .replace(/\b\d+(st|nd|rd|th)\s*\+?\s*(connection|degree)\b/gi, "")
    // Remove "See more" and "Show less" text
    .replace(/\b(See more|Show less|View full profile)\b/gi, "")
    // Remove LinkedIn premium indicators
    .replace(/\b(LinkedIn Premium|Premium)\b/gi, "")
    // Remove activity indicators
    .replace(/\b(Active \d+ hours? ago|Recently active)\b/gi, "")
    // Remove mutual connections text
    .replace(/\b\d+ mutual connections?\b/gi, "")
    // Clean up extra whitespace and newlines
    .replace(/\s+/g, " ")
    .replace(/\n\s*\n/g, "\n")
    .trim();

  console.log("✅ Content pre-processing completed");
  return cleaned;
}

// 🚀 IMPROVEMENT 1: Enhanced name validation
function isValidEmployeeName(name: string): boolean {
  if (!name || typeof name !== "string") return false;

  const trimmedName = name.trim();

  // Check minimum length
  if (trimmedName.length < 3) return false;

  // Check for initials only (e.g., "J. D.", "John D.", "J.D.")
  if (/^[A-Z]\.\s*[A-Z]\.?$/.test(trimmedName)) return false;
  if (/^[A-Z][a-z]*\s+[A-Z]\.?$/.test(trimmedName)) return false;

  // Check for incomplete names with numbers or special chars
  if (/\d/.test(trimmedName)) return false;
  if (/[^\w\s\-\.']/g.test(trimmedName)) return false;

  // Check for minimum word count (should have at least first + last name)
  const words = trimmedName.split(/\s+/).filter((word) => word.length > 0);
  if (words.length < 2) return false;

  // Check for common non-name patterns
  const invalidPatterns = [
    /^(see more|show less|view profile|connect|follow|message)$/i,
    /^(linkedin|premium|member|user)$/i,
    /^(and \d+ others?)$/i,
    /^(\d+\+? others?)$/i,
  ];

  if (invalidPatterns.some((pattern) => pattern.test(trimmedName))) return false;

  return true;
}

// 🚀 IMPROVEMENT 2: Enhanced job title normalization
function normalizeJobTitle(title: string): string {
  if (!title || typeof title !== "string") return "";

  let normalized = title.trim();

  // Remove common separators and everything after them
  normalized = normalized.split("|")[0].split("•")[0].split("at ")[0].trim();

  // Remove university/education info
  normalized = normalized.replace(/\b(at|@)\s+[A-Z][a-zA-Z\s&]+University\b/gi, "");
  normalized = normalized.replace(/\b(MBA|PhD|MS|BS|BA|Master|Bachelor).*$/gi, "");

  // Remove credentials
  normalized = normalized.replace(/\b(CPA|CFA|PMP|PhD|MD|JD|MBA|MS|BS|BA)\b/gi, "");

  // Remove company mentions if they appear at the end
  normalized = normalized.replace(/\s+(at|@|chez)\s+.+$/gi, "");

  // Clean up extra whitespace
  normalized = normalized.replace(/\s+/g, " ").trim();

  // Remove common prefixes/suffixes that aren't part of job title
  normalized = normalized.replace(/^(Former|Ex-|Previous)\s+/gi, "");
  normalized = normalized.replace(/\s+(Intern|Internship)$/gi, " Intern");

  return normalized;
}

// 🚀 IMPROVEMENT 3: Enhanced location parsing
function parseLocation(location: string): string {
  if (!location || typeof location !== "string") return "";

  let parsed = location.trim();

  // Remove common LinkedIn location noise
  parsed = parsed.replace(/\b(Greater|Metro|Area|Region)\s+/gi, "");
  parsed = parsed.replace(/\s+(Area|Region|Metropolitan)$/gi, "");

  // Standardize common location formats
  parsed = parsed.replace(/\bUSA?\b/gi, "United States");
  parsed = parsed.replace(/\bUK\b/gi, "United Kingdom");
  parsed = parsed.replace(/\bFR\b/gi, "France");

  // Clean up extra whitespace
  parsed = parsed.replace(/\s+/g, " ").trim();

  return parsed;
}

// 🚀 IMPROVEMENT 4: Enhanced LinkedIn URL extraction
function extractLinkedInUrl(text: string, employeeName: string): string {
  if (!text || !employeeName) return "";

  // Look for LinkedIn profile URLs
  const urlPatterns = [
    /https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9\-]+\/?/gi,
    /linkedin\.com\/in\/[a-zA-Z0-9\-]+/gi,
  ];

  for (const pattern of urlPatterns) {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      // Return the first valid LinkedIn URL
      return matches[0].startsWith("http") ? matches[0] : `https://${matches[0]}`;
    }
  }

  return "";
}

// 🚀 IMPROVEMENT 5: Smart relevance scoring based on job title matching
function calculateRelevanceScore(employeeTitle: string, searchJobTitle: string): string {
  if (!employeeTitle || !searchJobTitle) return "Good Contact";

  const empTitle = employeeTitle.toLowerCase();
  const searchTitle = searchJobTitle.toLowerCase();

  // Perfect match keywords
  const perfectKeywords = ["manager", "director", "lead", "head", "chief", "senior"];
  const goodKeywords = ["analyst", "specialist", "coordinator", "associate", "consultant"];

  // Check for exact or near-exact matches
  if (empTitle.includes(searchTitle) || searchTitle.includes(empTitle)) {
    return "Perfect Contact";
  }

  // Check for keyword matches
  const empWords = empTitle.split(/\s+/);
  const searchWords = searchTitle.split(/\s+/);

  const commonWords = empWords.filter((word) =>
    searchWords.some((searchWord) => word.includes(searchWord) || searchWord.includes(word))
  );

  if (commonWords.length >= 2) return "Perfect Contact";
  if (commonWords.length === 1) return "Good Contact";

  // Check for seniority level matches
  const hasPerfectKeyword = perfectKeywords.some((keyword) => empTitle.includes(keyword));
  const hasGoodKeyword = goodKeywords.some((keyword) => empTitle.includes(keyword));

  if (hasPerfectKeyword) return "Perfect Contact";
  if (hasGoodKeyword) return "Good Contact";

  return "Average Contact";
}

// Enhanced JSON extraction with better error handling
function extractAndParseJSON(text: string): LinkedInEmployee[] | null {
  console.log("🔍 Extracting JSON from AI response...");

  try {
    // Try direct JSON parse first
    const directParse = JSON.parse(text);
    if (Array.isArray(directParse)) {
      console.log("✅ Direct JSON parse successful");
      return directParse;
    }
  } catch {
    // Continue to pattern matching
  }

  // Enhanced pattern matching
  const patterns = [
    /```(?:json)?\s*(\[[\s\S]*?\])\s*```/gi,
    /(\[[\s\S]*?\])/g,
    /```(?:json)?\s*(\{[\s\S]*?\})\s*```/gi,
    /(\{[\s\S]*?\})/g,
  ];

  for (const pattern of patterns) {
    const matches = text.match(pattern);
    if (matches) {
      for (const match of matches) {
        try {
          const cleanMatch = match.replace(/```(?:json)?/gi, "").trim();
          const parsed = JSON.parse(cleanMatch);

          if (Array.isArray(parsed)) {
            console.log("✅ Pattern-based JSON parse successful");
            return parsed;
          } else if (parsed && typeof parsed === "object") {
            console.log("✅ Single object parsed, converting to array");
            return [parsed];
          }
        } catch (e) {
          console.warn("⚠️ Failed to parse JSON match:", match.substring(0, 100));
          continue;
        }
      }
    }
  }

  console.error("❌ All JSON parsing attempts failed");
  return null;
}

// 🚀 IMPROVEMENT 5: Enhanced validation with duplicate detection
function validateAndCleanEmployee(
  emp: LinkedInEmployee,
  index: number,
  allEmployees: LinkedInEmployee[],
  searchJobTitle: string = "",
  originalContent: string = ""
): LinkedInEmployee | null {
  console.log(`🔍 Validating employee ${index + 1}:`, emp);

  // Extract and validate name
  const name = emp.full_name || emp.fullName || emp.name || "";
  if (!isValidEmployeeName(name)) {
    console.log(`❌ Invalid name: "${name}"`);
    return null;
  }

  // Clean and validate job title
  const rawTitle = emp.job_title || emp.jobTitle || emp.title || "";
  const cleanTitle = normalizeJobTitle(rawTitle);
  if (!cleanTitle || cleanTitle.length < 2) {
    console.log(`❌ Invalid job title: "${rawTitle}" -> "${cleanTitle}"`);
    return null;
  }

  // Parse and validate location
  const rawLocation = emp.location || "";
  const cleanLocation = parseLocation(rawLocation);

  // Extract LinkedIn URL
  const linkedinUrl =
    emp.linkedin_url || emp.linkedinUrl || extractLinkedInUrl(originalContent, name);

  // Calculate relevance score
  const relevanceScore = calculateRelevanceScore(cleanTitle, searchJobTitle);

  // 🚀 IMPROVEMENT 5: Check for duplicates
  const isDuplicate = allEmployees.slice(0, index).some((otherEmp) => {
    const otherName = otherEmp.full_name || otherEmp.fullName || otherEmp.name || "";
    const otherTitle = normalizeJobTitle(
      otherEmp.job_title || otherEmp.jobTitle || otherEmp.title || ""
    );

    // Consider duplicate if same name or very similar name + title
    return (
      name.toLowerCase() === otherName.toLowerCase() ||
      (name.toLowerCase().includes(otherName.toLowerCase()) &&
        cleanTitle.toLowerCase() === otherTitle.toLowerCase())
    );
  });

  if (isDuplicate) {
    console.log(`❌ Duplicate employee detected: "${name}"`);
    return null;
  }

  const cleanedEmployee = {
    ...emp,
    full_name: name.trim(),
    job_title: cleanTitle,
    location: cleanLocation || "Not specified",
    linkedin_url: linkedinUrl,
    relevance_score: relevanceScore,
  };

  console.log(`✅ Employee validated:`, cleanedEmployee);
  return cleanedEmployee;
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

    // Validate required fields
    if (!body.content || !body.companyName) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          message: "Content and company name are required",
          received: {
            content: !!body.content,
            companyName: body.companyName,
            location: body.location,
          },
        },
        { status: 400 }
      );
    }

    console.log("🔍 Extracting employees from LinkedIn paste for:", {
      companyName: body.companyName,
      location: body.location,
      contentLength: body.content.length,
    });

    // 🚀 IMPROVEMENT 6: Pre-process content
    const cleanedContent = preprocessLinkedInContent(body.content);
    console.log("📝 Content length after cleaning:", cleanedContent.length);

    // Get job title from search criteria for relevance scoring
    const searchJobTitle = body.jobTitle || "";

    // ✅ Find or create company record
    let companyId: string;

    // Try to find existing company
    const { data: existingCompany } = await supabase
      .from("company_suggestions")
      .select("id")
      .eq("name", body.companyName)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (existingCompany) {
      companyId = existingCompany.id;
      console.log("✅ Found existing company:", companyId);
    } else {
      // Create new company record
      companyId = crypto.randomUUID();
      const { error: companyError } = await supabase.from("company_suggestions").insert({
        id: companyId,
        user_id: user.id,
        search_criteria_id: null,
        name: body.companyName,
        description: `Company added via LinkedIn paste`,
        location: body.location || "Unknown",
        relevanceScore: "Manual Entry",
        source: "LinkedIn Paste",
        created_at: new Date().toISOString(),
      });

      if (companyError) {
        console.error("❌ Error creating company:", companyError);
        return NextResponse.json({ error: "Failed to create company record" }, { status: 500 });
      }

      console.log("✅ Created new company:", companyId);
    }

    // Check for existing employees to avoid duplicates across sessions
    const { data: existingEmployees } = await supabase
      .from("employee_contacts")
      .select("name, title")
      .eq("company_id", companyId)
      .eq("user_id", user.id);

    console.log("📊 Found existing employees:", existingEmployees?.length || 0);

    // Check if OpenAI is available
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          error: "OpenAI not available",
          message: "AI service is temporarily unavailable. Please try again later.",
        },
        { status: 503 }
      );
    }

    try {
      // Dynamic import to avoid issues
      const OpenAI = (await import("openai")).default;
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      // Use the enhanced prompt with cleaned content
      const prompt = OPENAI_PROMPTS.LINKEDIN_PASTE_ANALYSIS(cleanedContent, body.companyName);

      console.log("📤 Sending enhanced LinkedIn paste analysis request to OpenAI");
      console.log("📝 Prompt preview:", prompt.substring(0, 300) + "...");

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are an expert LinkedIn content analyzer. Extract only real, complete employee profiles. Focus on quality over quantity. Return only valid JSON arrays with employee data.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.2, // Lower temperature for more consistent results
        max_tokens: 2000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No response content from OpenAI");
      }

      console.log("📄 OpenAI Response:", content);

      // Extract and validate employee data with enhanced processing
      const rawEmployees = extractAndParseJSON(content);

      console.log("🔍 Raw employees extracted:", rawEmployees?.length || 0);

      if (!Array.isArray(rawEmployees) || rawEmployees.length === 0) {
        return NextResponse.json({
          success: true,
          employees: [],
          total: 0,
          message:
            "No valid employees found in the provided content. Please make sure you copied complete LinkedIn people search results.",
        });
      }

      // Enhanced validation with duplicate detection and relevance scoring
      const validatedEmployees = rawEmployees
        .map((emp, index) =>
          validateAndCleanEmployee(emp, index, rawEmployees, searchJobTitle, cleanedContent)
        )
        .filter((emp): emp is LinkedInEmployee => emp !== null);

      console.log("✅ Validated employees:", validatedEmployees.length);

      // Check against existing employees in database
      const newEmployees = validatedEmployees.filter((emp) => {
        const empName = emp.full_name || "";
        const empTitle = normalizeJobTitle(emp.job_title || "");

        return !existingEmployees?.some(
          (existing) =>
            existing.name.toLowerCase() === empName.toLowerCase() ||
            (existing.name.toLowerCase().includes(empName.toLowerCase()) &&
              normalizeJobTitle(existing.title).toLowerCase() === empTitle.toLowerCase())
        );
      });

      console.log("🆕 New employees (not in database):", newEmployees.length);

      if (newEmployees.length === 0) {
        return NextResponse.json({
          success: true,
          employees: [],
          total: 0,
          message: "All employees from this content have already been added previously.",
          duplicatesFound: validatedEmployees.length,
        });
      }

      // Transform for database insertion
      const employeesToInsert = newEmployees.map((emp: LinkedInEmployee) => ({
        id: crypto.randomUUID(),
        user_id: user.id,
        company_id: companyId,
        name: emp.full_name || "Unknown",
        title: emp.job_title || "Unknown",
        location: emp.location || body.location || "Not specified",
        linkedinUrl: emp.linkedin_url || "",
        relevanceScore: emp.relevance_score || "Good Contact",
        source: "LinkedIn Paste",
        created_at: new Date().toISOString(),
      }));

      console.log("💾 Inserting employees to database:", employeesToInsert.length);

      // Save to database
      const { error: employeesError } = await supabase
        .from("employee_contacts")
        .insert(employeesToInsert);

      if (employeesError) {
        console.error("❌ Employees save error:", employeesError);
        return NextResponse.json({ error: "Failed to save employees" }, { status: 500 });
      }

      console.log("✅ Employees saved to database successfully");

      // Return enhanced response with quality metrics
      const transformedEmployees = employeesToInsert.map((emp) => ({
        id: emp.id,
        name: emp.name,
        title: emp.title,
        location: emp.location,
        linkedinUrl: emp.linkedinUrl,
        relevanceScore: emp.relevanceScore,
        source: emp.source,
      }));

      const responseData = {
        success: true,
        employees: transformedEmployees,
        total: transformedEmployees.length,
        quality: {
          withCompleteNames: transformedEmployees.filter((e) => !e.name.includes(".")).length,
          withLocations: transformedEmployees.filter((e) => e.location !== "Not specified").length,
          withLinkedIn: transformedEmployees.filter((e) => e.linkedinUrl).length,
          perfectContacts: transformedEmployees.filter(
            (e) => e.relevanceScore === "Perfect Contact"
          ).length,
          goodContacts: transformedEmployees.filter((e) => e.relevanceScore === "Good Contact")
            .length,
        },
        processing: {
          rawExtracted: rawEmployees.length,
          validatedCount: validatedEmployees.length,
          duplicatesSkipped: validatedEmployees.length - newEmployees.length,
          finalCount: transformedEmployees.length,
        },
        message: `Successfully extracted ${transformedEmployees.length} new employees${body.location ? ` in ${body.location}` : ""}. ${validatedEmployees.length - newEmployees.length > 0 ? `Skipped ${validatedEmployees.length - newEmployees.length} duplicates.` : ""}`,
      };

      console.log("✅ Returning enhanced response:", responseData);
      return NextResponse.json(responseData);
    } catch (openaiError) {
      console.error("OpenAI analysis error:", openaiError);

      return NextResponse.json(
        {
          error: "Unable to analyze LinkedIn content",
          message:
            "Our AI service encountered an error while analyzing the content. Please try again or check that you copied valid LinkedIn search results.",
          details: process.env.NODE_ENV === "development" ? String(openaiError) : undefined,
        },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error("❌ Extract from paste error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred while processing your request.",
        details: process.env.NODE_ENV === "development" ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}
