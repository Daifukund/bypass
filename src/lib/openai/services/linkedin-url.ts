/**
 * LinkedIn URL Generation Service
 * Handles AI-powered LinkedIn People Search URL generation
 */

import {
  openai,
  supportsWebSearch,
  createWebSearchTools,
  logOpenAIRequest,
  logOpenAIResponse,
  handleOpenAIError,
  DEFAULT_CONFIGS,
} from "../client";
import { OPENAI_PROMPTS, SYSTEM_PROMPTS } from "@/constants/prompts";
import {
  extractAndParseJSON,
  extractMessageContent,
  extractCitations,
  checkWebSearchUsage,
  generateRequestId,
  withRetry,
} from "../utils";
import { WebSearchResponse, OpenAIRequestConfig } from "../types";
import { getLinkedInRegionCode } from "@/constants/linkedin-regions";

interface LinkedInUrlCriteria {
  companyName: string;
  jobTitle: string;
  location?: string;
}

interface LinkedInUrlResult {
  linkedinUrl: string;
  fallbackUrl: string;
  usedWebSearch: boolean;
  requestId?: string;
  timestamp?: Date;
}

/**
 * LinkedIn URL Generation Service Class
 * Provides methods for generating LinkedIn People Search URLs
 */
export class LinkedInUrlService {
  /**
   * Generate LinkedIn People Search URL for a company and job title
   * Uses OpenAI web search when available, falls back to standard completion
   */
  static async generateLinkedInUrl(
    criteria: LinkedInUrlCriteria,
  ): Promise<LinkedInUrlResult> {
    const requestId = generateRequestId();
    const prompt = OPENAI_PROMPTS.LINKEDIN_URL_GENERATION(
      criteria.companyName,
      criteria.jobTitle,
      criteria.location,
    );

    // Generate fallback URL with location support
    const fallbackUrl = this.generateFallbackUrl(criteria);

    // Log the request
    logOpenAIRequest("generateLinkedInUrl", prompt, {
      criteria,
      requestId,
    });

    try {
      // Try web search first if available
      if (supportsWebSearch()) {
        return await this.generateWithWebSearch(
          criteria,
          prompt,
          requestId,
          fallbackUrl,
        );
      } else {
        console.log("⚠️ Web search not available, using standard completion");
        return await this.generateWithStandardCompletion(
          criteria,
          prompt,
          requestId,
          fallbackUrl,
        );
      }
    } catch (error) {
      console.error("❌ LinkedIn URL generation failed, using fallback");

      return {
        linkedinUrl: fallbackUrl,
        fallbackUrl,
        usedWebSearch: false,
        requestId,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Generate LinkedIn URL using OpenAI web search API
   */
  private static async generateWithWebSearch(
    criteria: LinkedInUrlCriteria,
    prompt: string,
    requestId: string,
    fallbackUrl: string,
  ): Promise<LinkedInUrlResult> {
    // Check if OpenAI client is available
    if (!openai) {
      throw new Error(
        "OpenAI client not initialized. Please check your OPENAI_API_KEY environment variable.",
      );
    }

    const tools = createWebSearchTools(undefined, "low"); // Low context for simple URL generation

    const requestPayload = {
      model: DEFAULT_CONFIGS.WEB_SEARCH.model,
      tools,
      input: prompt,
    };

    console.log(
      "📤 LinkedIn URL Web Search Request:",
      JSON.stringify(requestPayload, null, 2),
    );

    // Use retry wrapper for reliability
    const response = await withRetry(
      async () => {
        return (await openai!.responses.create(
          requestPayload,
        )) as WebSearchResponse;
      },
      2,
      1000,
    );

    // Log the full response
    logOpenAIResponse("generateLinkedInUrl (Web Search)", response);

    // Check if web search was actually used
    const usedWebSearch = checkWebSearchUsage(response);
    console.log("🔍 Web Search Used:", usedWebSearch);

    // Extract message content
    const { text } = extractMessageContent(response);

    if (!text) {
      throw new Error("No response text from OpenAI web search");
    }

    console.log("📄 Extracted Text:", text);

    // Extract LinkedIn URL
    const rawData = extractAndParseJSON(text);
    let linkedinUrl = fallbackUrl;

    if (
      rawData &&
      typeof rawData === "object" &&
      "linkedin_people_search_url" in rawData
    ) {
      const generatedUrl = (rawData as any).linkedin_people_search_url;
      if (
        generatedUrl &&
        typeof generatedUrl === "string" &&
        generatedUrl.includes("linkedin.com")
      ) {
        linkedinUrl = generatedUrl;
      }
    }

    console.log("🔗 Generated LinkedIn URL:", linkedinUrl);

    return {
      linkedinUrl,
      fallbackUrl,
      usedWebSearch,
      requestId,
      timestamp: new Date(),
    };
  }

  /**
   * Generate LinkedIn URL using standard OpenAI completion
   */
  private static async generateWithStandardCompletion(
    criteria: LinkedInUrlCriteria,
    prompt: string,
    requestId: string,
    fallbackUrl: string,
  ): Promise<LinkedInUrlResult> {
    // Check if OpenAI client is available
    if (!openai) {
      throw new Error(
        "OpenAI client not initialized. Please check your OPENAI_API_KEY environment variable.",
      );
    }

    const config: OpenAIRequestConfig = {
      model: DEFAULT_CONFIGS.STANDARD.model,
      temperature: 0.3, // Low temperature for consistent URL generation
      maxTokens: 200, // Short response needed
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPTS.JSON_OBJECT_ONLY,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    };

    console.log(
      "📤 LinkedIn URL Standard Completion Config:",
      JSON.stringify(config, null, 2),
    );

    // Use retry wrapper for reliability
    const response = await withRetry(
      async () => {
        return await openai!.chat.completions.create({
          model: config.model,
          messages: config.messages!,
          temperature: config.temperature,
          max_tokens: config.maxTokens,
        });
      },
      2,
      1000,
    );

    // Log the full response
    logOpenAIResponse("generateLinkedInUrl (Standard)", response);

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response content from OpenAI standard completion");
    }

    console.log("📄 Response Content:", content);

    // Extract LinkedIn URL
    const rawData = extractAndParseJSON(content);
    let linkedinUrl = fallbackUrl;

    if (
      rawData &&
      typeof rawData === "object" &&
      "linkedin_people_search_url" in rawData
    ) {
      const generatedUrl = (rawData as any).linkedin_people_search_url;
      if (
        generatedUrl &&
        typeof generatedUrl === "string" &&
        generatedUrl.includes("linkedin.com")
      ) {
        linkedinUrl = generatedUrl;
      }
    }

    console.log("🔗 Generated LinkedIn URL:", linkedinUrl);

    return {
      linkedinUrl,
      fallbackUrl,
      usedWebSearch: false,
      requestId,
      timestamp: new Date(),
    };
  }

  /**
   * Generate fallback LinkedIn URL using simple string manipulation
   * Now includes facetGeoRegion support for major cities
   */
  private static generateFallbackUrl(criteria: LinkedInUrlCriteria): string {
    const companySlug = criteria.companyName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single
      .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens

    const keywords = encodeURIComponent(criteria.jobTitle);

    // Build base URL
    let url = `https://www.linkedin.com/company/${companySlug}/people/?keywords=${keywords}`;

    // Add facetGeoRegion if location matches a major city
    const regionCode = getLinkedInRegionCode(criteria.location);
    if (regionCode) {
      url += `&facetGeoRegion=${regionCode}`;
    }

    return url;
  }
}
