import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { OPENAI_PROMPTS, OPENAI_CONFIG } from "@/constants/prompts";
import type { EmailType } from "@/lib/openai/types";
import { generateEmailContent } from "@/lib/openai/services/email-generation";

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

// Map frontend email types to database values and return proper EmailType
function mapEmailType(frontendType: string): string {
  const typeMap: { [key: string]: string } = {
    networking: "networking",
    coffee_chat: "coffee_chat",
    cold_application: "cold_application",
    referral: "referral_request",
    follow_up: "follow_up",
    thank_you: "thank_you",
  };

  return typeMap[frontendType] || "networking";
}

// Language-specific fallbacks
function getLanguageSpecificFallback(
  language: string,
  type: "subject" | "body",
  params?: any
): string {
  const lang = language.toLowerCase();

  if (type === "subject") {
    switch (lang) {
      case "french":
      case "français":
        return "Demande d'échange professionnel";
      case "german":
      case "deutsch":
        return "Anfrage für beruflichen Austausch";
      case "spanish":
      case "español":
        return "Solicitud de intercambio profesional";
      case "italian":
      case "italiano":
        return "Richiesta di scambio professionale";
      case "portuguese":
      case "português":
        return "Solicitação de intercâmbio profissional";
      default:
        return "Request for professional exchange";
    }
  } else {
    // body
    if (!params) return "";

    switch (lang) {
      case "french":
      case "français":
        return `Bonjour ${params.contactName},

Je m'appelle ${params.senderName}, ${params.studyLevel} en ${params.fieldOfStudy} à ${params.university}. Je suis très intéressé par votre parcours chez ${params.companyName}.

Seriez-vous disponible pour un échange de 15 minutes ?

Cordialement,
${params.senderName}`;

      case "german":
      case "deutsch":
        return `Hallo ${params.contactName},

mein Name ist ${params.senderName}, ${params.studyLevel} in ${params.fieldOfStudy} an der ${params.university}. Ich bin sehr interessiert an Ihrem Werdegang bei ${params.companyName}.

Wären Sie für einen 15-minütigen Austausch verfügbar?

Mit freundlichen Grüßen,
${params.senderName}`;

      case "spanish":
      case "español":
        return `Hola ${params.contactName},

Mi nombre es ${params.senderName}, ${params.studyLevel} en ${params.fieldOfStudy} en ${params.university}. Estoy muy interesado en su trayectoria en ${params.companyName}.

¿Estaría disponible para un intercambio de 15 minutos?

Saludos cordiales,
${params.senderName}`;

      default: // English
        return `Hello ${params.contactName},

My name is ${params.senderName}, a ${params.studyLevel} in ${params.fieldOfStudy} at ${params.university}. I am very interested in your career path at ${params.companyName}.

Would you be available for a 15-minute exchange?

Best regards,
${params.senderName}`;
    }
  }
}

function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export async function POST(req: NextRequest) {
  let body: any = {};
  let requestId = `req_${Date.now()}`;

  try {
    console.log(`🚀 [${requestId}] Starting email generation request`);

    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error(`❌ [${requestId}] Auth error:`, authError);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(`🔐 [${requestId}] Authenticated user:`, user.id);

    // Parse request body
    try {
      body = await req.json();
      console.log(`📥 [${requestId}] Request body:`, {
        contactName: body.contactName,
        jobTitle: body.jobTitle,
        companyName: body.companyName,
        emailType: body.emailType,
        language: body.language,
        hasCompanyId: !!body.companyId,
        hasEmployeeId: !!body.employeeId,
      });
    } catch (parseError) {
      console.error(`❌ [${requestId}] Failed to parse request body:`, parseError);
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
    }

    const {
      contactName,
      jobTitle,
      companyName,
      location,
      emailType,
      language,
      companyId,
      employeeId,
    } = body;

    // Validate required fields
    if (!contactName || !jobTitle || !companyName || !emailType) {
      console.error(`❌ [${requestId}] Missing required fields:`, {
        contactName: !!contactName,
        jobTitle: !!jobTitle,
        companyName: !!companyName,
        emailType: !!emailType,
      });
      return NextResponse.json(
        {
          error: "Contact name, job title, company name, and email type are required",
        },
        { status: 400 }
      );
    }

    // Validate UUIDs before querying
    if (!isValidUUID(companyId)) {
      console.error(`❌ [${requestId}] Invalid company ID format:`, companyId);
      return NextResponse.json(
        {
          error: "Invalid company ID format",
          message: "Company ID must be a valid UUID. Please refresh and try again.",
        },
        { status: 400 }
      );
    }

    if (!isValidUUID(employeeId)) {
      console.error(`❌ [${requestId}] Invalid employee ID format:`, employeeId);
      return NextResponse.json(
        {
          error: "Invalid employee ID format",
          message: "Employee ID must be a valid UUID. Please refresh and try again.",
        },
        { status: 400 }
      );
    }

    // Map and validate emailType
    const mappedEmailType = mapEmailType(emailType);
    const validEmailTypes = [
      "networking",
      "cold_application",
      "referral_request",
      "coffee_chat",
      "follow_up",
      "thank_you",
    ];

    if (!validEmailTypes.includes(mappedEmailType)) {
      console.error(
        `❌ [${requestId}] Invalid email type:`,
        emailType,
        "mapped to:",
        mappedEmailType
      );
      return NextResponse.json({ error: "Invalid email type" }, { status: 400 });
    }

    console.log(`✅ [${requestId}] Validation passed, email type:`, mappedEmailType);

    // Fetch user profile for personalization
    console.log(`👤 [${requestId}] Fetching user profile...`);
    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select(
        "first_name, last_name, university, study_level, field_of_study, phone, linkedin, email_credits, plan"
      )
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error(`❌ [${requestId}] Error fetching user profile:`, profileError);
      return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 });
    }

    console.log(`👤 [${requestId}] User profile loaded:`, {
      hasFirstName: !!userProfile?.first_name,
      hasLastName: !!userProfile?.last_name,
      university: userProfile?.university,
      plan: userProfile?.plan,
      emailCredits: userProfile?.email_credits,
    });

    // Check if email record exists
    console.log(`📧 [${requestId}] Looking for existing email record...`);
    const { data: existingEmailRecord, error: findError } = await supabase
      .from("email_generation")
      .select("id, emailAddress, generatedEmail")
      .eq("user_id", user.id)
      .eq("company_id", companyId)
      .eq("employee_id", employeeId)
      .not("emailAddress", "is", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (findError) {
      console.error(`❌ [${requestId}] Error finding email record:`, findError);
      return NextResponse.json({ error: "Failed to find email record" }, { status: 500 });
    }

    if (!existingEmailRecord) {
      console.error(`❌ [${requestId}] No email address record found`);
      return NextResponse.json(
        {
          error: "Email address must be generated first",
        },
        { status: 400 }
      );
    }

    console.log(`📧 [${requestId}] Found email record:`, {
      id: existingEmailRecord.id,
      hasEmailAddress: !!existingEmailRecord.emailAddress,
      hasGeneratedContent: !!existingEmailRecord.generatedEmail,
    });

    // Map user profile for email generation service
    const mappedUserProfile = userProfile
      ? {
          firstName: userProfile.first_name,
          lastName: userProfile.last_name,
          university: userProfile.university,
          studyLevel: userProfile.study_level,
          fieldOfStudy: userProfile.field_of_study,
          phone: userProfile.phone,
          linkedin: userProfile.linkedin,
        }
      : undefined;

    // Convert database format back to display format for the email generation service
    const displayEmailType =
      {
        networking: "Networking",
        coffee_chat: "Coffee Chat",
        cold_application: "Cold Application",
        referral_request: "Referral Request",
        follow_up: "Follow-up",
        thank_you: "Thank You",
      }[mappedEmailType] || "Networking";

    // Generate the email content using the imported service function
    console.log(`✍️ [${requestId}] Generating email content...`);
    let emailContent;
    try {
      emailContent = await generateEmailContent({
        contactName,
        jobTitle,
        companyName,
        location,
        emailType: displayEmailType as EmailType,
        language: language || "English",
        userProfile: mappedUserProfile,
      });

      console.log(`✅ [${requestId}] Email content generated successfully:`, {
        hasSubject: !!emailContent.subject,
        hasBody: !!emailContent.body,
        subjectLength: emailContent.subject?.length || 0,
        bodyLength: emailContent.body?.length || 0,
      });
    } catch (generationError) {
      console.error(`❌ [${requestId}] Email generation failed:`, {
        error: generationError,
        message:
          generationError instanceof Error ? generationError.message : String(generationError),
        stack: generationError instanceof Error ? generationError.stack : undefined,
        name: generationError instanceof Error ? generationError.name : undefined,
      });

      // Fallback to language-specific template
      const senderName =
        mappedUserProfile?.firstName && mappedUserProfile?.lastName
          ? `${mappedUserProfile.firstName} ${mappedUserProfile.lastName}`
          : "Student";

      const fallbackSubject = getLanguageSpecificFallback(language || "English", "subject");
      const fallbackBody = getLanguageSpecificFallback(language || "English", "body", {
        senderName,
        contactName,
        companyName,
        studyLevel: mappedUserProfile?.studyLevel || "student",
        fieldOfStudy: mappedUserProfile?.fieldOfStudy || "Finance",
        university: mappedUserProfile?.university || "my university",
      });

      emailContent = {
        subject: fallbackSubject,
        body: fallbackBody,
        emailType: displayEmailType as EmailType,
        language: language || "English",
      };

      console.log(`🔄 [${requestId}] Using fallback email content`);
    }

    // Update the existing record with the database-compatible format
    console.log(`💾 [${requestId}] Updating email record with emailType:`, mappedEmailType);
    const { data: updatedRecord, error: updateError } = await supabase
      .from("email_generation")
      .update({
        emailType: mappedEmailType,
        generatedEmail: emailContent.body,
        generatedSubject: emailContent.subject,
        status: "pending",
      })
      .eq("id", existingEmailRecord.id)
      .select()
      .single();

    if (updateError) {
      console.error(`❌ [${requestId}] Error updating email record:`, updateError);
      return NextResponse.json({ error: "Failed to save email content" }, { status: 500 });
    }

    console.log(`✅ [${requestId}] Email generation completed successfully`);

    // Return the response with display format
    return NextResponse.json({
      success: true,
      subject: emailContent.subject,
      body: emailContent.body,
      email: updatedRecord,
      emailType: displayEmailType,
      language: language || "English",
    });
  } catch (error) {
    console.error(`❌ [${requestId}] Unexpected error in email generation:`, {
      error: error,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
      requestBody: body,
    });

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error occurred",
        requestId: requestId,
        details:
          process.env.NODE_ENV === "development"
            ? {
                error: String(error),
                stack: error instanceof Error ? error.stack : undefined,
                body: body,
              }
            : undefined,
      },
      { status: 500 }
    );
  }
}
