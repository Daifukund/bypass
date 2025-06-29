import { NextRequest, NextResponse } from "next/server";
import { OPENAI_PROMPTS } from "@/constants/prompts";
import { getLinkedInRegionCode } from "@/constants/linkedin-regions";

// Simple fallback function
function generateFallbackLinkedInUrl(
  companyName: string,
  jobTitle: string,
  location?: string
): string {
  const companySlug = companyName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens

  const keywords = encodeURIComponent(jobTitle);

  // Build base URL
  let url = `https://www.linkedin.com/company/${companySlug}/people/?keywords=${keywords}`;

  // Add facetGeoRegion if location matches a major city
  const regionCode = getLinkedInRegionCode(location);
  if (regionCode) {
    url += `&facetGeoRegion=${regionCode}`;
  }

  return url;
}

// Simple OpenAI LinkedIn URL generation
async function generateAILinkedInUrl(
  companyName: string,
  jobTitle: string,
  location?: string
): Promise<string | null> {
  try {
    // Check if OpenAI is available
    if (!process.env.OPENAI_API_KEY) {
      console.log("⚠️ OpenAI API key not available");
      return null;
    }

    // Dynamic import to avoid issues
    const OpenAI = (await import("openai")).default;
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Simplified prompt - let AI generate base URL, we'll add region code
    const prompt = `Generate a LinkedIn People search URL for finding employees at a specific company.

Company: ${companyName}
Job Title/Keywords: ${jobTitle}

Return a direct LinkedIn URL in this format:
https://www.linkedin.com/company/[company-identifier]/people/?keywords=[relevant-keywords]

Where:
- [company-identifier] is the LinkedIn company identifier (usually lowercase company name with hyphens)
- [relevant-keywords] are job-related keywords from the job title

Return ONLY the URL, nothing else.`;

    console.log("🌐 Calling OpenAI WebSearch for LinkedIn URL generation...");

    const response = await openai.responses.create({
      model: "gpt-4.1",
      tools: [
        {
          type: "web_search_preview",
          search_context_size: "medium",
          user_location: {
            type: "approximate",
            country: "US",
            city: "New York",
            region: "New York",
          },
        },
      ],
      input: prompt,
    });

    console.log("📥 WebSearch Response:", JSON.stringify(response, null, 2));

    // Check if web search was actually used
    const usedWebSearch = response.output.some((x) => x.type === "web_search_call");
    console.log("🔍 Web Search Used:", usedWebSearch);

    // Extract the message content
    const message = (response as any).output.find((item: any) => item.type === "message");
    if (!message || !message.content || !Array.isArray(message.content)) {
      console.log("⚠️ Invalid message structure from WebSearch");
      console.log("⚠️ Full response structure:", JSON.stringify(response, null, 2));
      return null;
    }

    const content = message.content[0] as any;
    let text = "";

    if (content?.type === "output_text" && content?.text) {
      text = content.text;
    } else if (content?.text) {
      text = content.text;
    } else {
      console.log("⚠️ No text found in WebSearch response content");
      console.log("⚠️ Content structure:", JSON.stringify(content, null, 2));
      return null;
    }

    const annotations = (content?.annotations || []) as any[];

    if (!text) {
      console.log("⚠️ No text content from OpenAI WebSearch");
      return null;
    }

    console.log("📄 WebSearch Response Text:", text);
    console.log("🔗 Citations:", annotations);

    // Since OpenAI is returning a plain URL (not JSON), handle it directly
    if (text && text.includes("linkedin.com")) {
      let finalUrl = text.trim();

      // Add facetGeoRegion programmatically if location matches
      const regionCode = getLinkedInRegionCode(location);
      if (regionCode && !finalUrl.includes("facetGeoRegion")) {
        // Add the region code to the URL
        const separator = finalUrl.includes("?") ? "&" : "?";
        finalUrl += `${separator}facetGeoRegion=${regionCode}`;
      }

      console.log("✅ WebSearch-generated LinkedIn URL:", finalUrl);
      return finalUrl;
    } else {
      console.log("⚠️ Invalid URL format from WebSearch");
      return null;
    }
  } catch (error) {
    console.error("❌ OpenAI WebSearch LinkedIn URL generation failed:", error);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate required fields
    if (!body.companyName || !body.jobTitle) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          message: "Company name and job title are required",
          received: {
            companyName: body.companyName,
            jobTitle: body.jobTitle,
            location: body.location,
          },
        },
        { status: 400 }
      );
    }

    console.log("🔗 Generating LinkedIn URL for:", {
      companyName: body.companyName,
      jobTitle: body.jobTitle,
      location: body.location,
    });

    // Generate fallback URL with location support
    const fallbackUrl = generateFallbackLinkedInUrl(body.companyName, body.jobTitle, body.location);

    // Try to generate AI URL with location
    const aiUrl = await generateAILinkedInUrl(body.companyName, body.jobTitle, body.location);

    if (!aiUrl) {
      console.log("⚠️ AI failed, using fallback URL");
      const finalUrl = fallbackUrl;
      const usedAI = false;

      return NextResponse.json({
        success: true,
        linkedinUrl: finalUrl,
        fallbackUrl: fallbackUrl,
        usedWebSearch: false,
        usedAI: false,
        message: `Fallback LinkedIn People Search URL for ${body.companyName}`,
      });
    }

    const finalUrl = aiUrl;
    const usedAI = true; // Should always be true now
    console.log("✅ Final LinkedIn URL:", finalUrl);
    console.log("🤖 Used AI:", usedAI);

    // Return response
    const responseData = {
      success: true,
      linkedinUrl: finalUrl,
      fallbackUrl: fallbackUrl,
      usedWebSearch: usedAI,
      usedAI: usedAI,
      message: usedAI
        ? `AI-generated LinkedIn People Search URL for ${body.companyName}`
        : `Fallback LinkedIn People Search URL for ${body.companyName}`,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("❌ LinkedIn URL generation error:", error);

    // Generate fallback URL even on error
    try {
      const body = await req.json();
      const fallbackUrl = generateFallbackLinkedInUrl(
        body.companyName,
        body.jobTitle,
        body.location
      );

      return NextResponse.json({
        success: false,
        linkedinUrl: fallbackUrl,
        fallbackUrl: fallbackUrl,
        usedWebSearch: false,
        usedAI: false,
        error: error instanceof Error ? error.message : "Unknown error",
        message: "Using fallback URL generation due to error",
      });
    } catch (fallbackError) {
      return NextResponse.json(
        {
          error: "Failed to generate LinkedIn URL",
          message: "Unable to generate LinkedIn People Search URL",
        },
        { status: 500 }
      );
    }
  }
}

export async function GET() {
  return NextResponse.json({
    message: "LinkedIn URL Generation API",
    status: "active",
    timestamp: new Date().toISOString(),
  });
}
