/**
 * Email Address Guessing Service
 * Uses OpenAI WebSearch to find real email patterns for companies
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
  validateEmailData,
  generateRequestId,
  withRetry,
} from "../utils";
import {
  SearchResult,
  EmailData,
  WebSearchResponse,
  OpenAIRequestConfig,
} from "../types";

interface EmailGenerationCriteria {
  fullName: string;
  companyName: string;
}

/**
 * Email Generation Service Class
 * Provides methods for generating email addresses using AI and web search
 */
export class EmailGenerationService {
  /**
   * Generate email address using OpenAI WebSearch
   * Uses web search when available, falls back to standard completion
   */
  static async generateEmailAddress(
    fullName: string,
    companyName: string,
  ): Promise<EmailData> {
    const requestId = generateRequestId();
    const criteria: EmailGenerationCriteria = { fullName, companyName };

    // Enhanced debugging
    // console.log('🔍 === EMAIL GENERATION DEBUG ===');
    // console.log('🔍 OpenAI client exists:', !!openai);
    // console.log('🔍 OpenAI responses API exists:', !!(openai && openai.responses));
    // console.log('🔍 supportsWebSearch():', supportsWebSearch());
    // console.log('🔍 Full name:', fullName);
    // console.log('🔍 Company name:', companyName);

    // Debug the OPENAI_PROMPTS object
    console.log("🔍 OPENAI_PROMPTS keys:", Object.keys(OPENAI_PROMPTS));
    console.log(
      "🔍 EMAIL_ADDRESS_GENERATION type:",
      typeof OPENAI_PROMPTS.EMAIL_ADDRESS_GENERATION,
    );
    console.log(
      "🔍 EMAIL_ADDRESS_GENERATION value:",
      OPENAI_PROMPTS.EMAIL_ADDRESS_GENERATION,
    );

    // Check if the function exists before calling it
    // Direct function definition to bypass import issue

    const prompt = OPENAI_PROMPTS.EMAIL_ADDRESS_GENERATION(
      fullName,
      companyName,
    );
    console.log("🔍 Generated prompt:", prompt.substring(0, 200) + "...");
    console.log("🔍 Generated prompt:", prompt.substring(0, 200) + "...");

    // Log the request
    logOpenAIRequest("generateEmailAddress", prompt, {
      criteria,
      requestId,
    });

    try {
      // FORCE WebSearch to be used (for debugging)
      console.log("🔍 Attempting WebSearch...");
      return await this.generateWithWebSearch(criteria, prompt, requestId);
    } catch (error) {
      console.error("❌ WebSearch failed:", error);
      console.log("🔍 Falling back to standard completion...");

      try {
        return await this.generateWithStandardCompletion(
          criteria,
          prompt,
          requestId,
        );
      } catch (fallbackError) {
        console.error("❌ Standard completion also failed:", fallbackError);
        console.log("🔍 Using basic email guess...");
        return this.generateBasicEmailGuess(fullName, companyName);
      }
    }
  }

  /**
   * Generate basic email guess as fallback
   * Used when AI methods fail
   */
  private static generateBasicEmailGuess(
    fullName: string,
    companyName: string,
  ): EmailData {
    const nameParts = fullName.toLowerCase().split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts[nameParts.length - 1] || "";

    // Extract domain from company name with better logic
    let domain = companyName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .replace(/inc|ltd|llc|corp|company|co|france|group|sa|sas/g, "");

    // Special handling for known companies
    const companyLower = companyName.toLowerCase();
    if (companyLower.includes("pwc")) {
      domain = "pwc.com";
    } else if (companyLower.includes("deloitte")) {
      domain = "deloitte.com";
    } else if (companyLower.includes("kpmg")) {
      domain = "kpmg.com";
    } else if (companyLower.includes("ey") || companyLower.includes("ernst")) {
      domain = "ey.com";
    } else if (companyLower.includes("accenture")) {
      domain = "accenture.com";
    } else if (companyLower.includes("mckinsey")) {
      domain = "mckinsey.com";
    } else if (companyLower.includes("bcg")) {
      domain = "bcg.com";
    } else if (companyLower.includes("bain")) {
      domain = "bain.com";
    } else {
      domain = domain + ".com";
    }

    // Generate email with most common format
    const email = `${firstName}.${lastName}@${domain}`;

    return {
      email: email,
      confidenceScore: 0.75, // Reasonable confidence for common format
    };
  }

  // Include the other private methods here...
  private static async generateWithWebSearch(
    criteria: EmailGenerationCriteria,
    prompt: string,
    requestId: string,
  ): Promise<EmailData> {
    // ... existing implementation
    if (!openai) {
      throw new Error(
        "OpenAI client not initialized. Please check your OPENAI_API_KEY environment variable.",
      );
    }

    const tools = createWebSearchTools(undefined, "low");

    const requestPayload = {
      model: DEFAULT_CONFIGS.WEB_SEARCH.model,
      tools,
      input: prompt,
    };

    const response = await withRetry(
      async () => {
        return (await openai!.responses.create(
          requestPayload,
        )) as WebSearchResponse;
      },
      2,
      2000,
    );

    logOpenAIResponse("generateEmailAddress (Web Search)", response);

    const usedWebSearch = checkWebSearchUsage(response);
    const { text, annotations } = extractMessageContent(response);

    if (!text) {
      throw new Error("No response text from OpenAI web search");
    }

    let emailData;
    try {
      const jsonMatch = text.match(/\{[^}]*"email"[^}]*\}/);
      if (jsonMatch) {
        emailData = JSON.parse(jsonMatch[0]);
      } else {
        emailData = JSON.parse(text);
      }
    } catch (parseError) {
      return this.generateBasicEmailGuess(
        criteria.fullName,
        criteria.companyName,
      );
    }

    const validatedData = validateEmailData(emailData);
    return validatedData;
  }

  private static async generateWithStandardCompletion(
    criteria: EmailGenerationCriteria,
    prompt: string,
    requestId: string,
  ): Promise<EmailData> {
    if (!openai) {
      throw new Error(
        "OpenAI client not initialized. Please check your OPENAI_API_KEY environment variable.",
      );
    }

    const response = await withRetry(
      async () => {
        return await openai!.chat.completions.create({
          model: DEFAULT_CONFIGS.SEARCH.model,
          messages: [
            {
              role: "system",
              content:
                "You are a helpful assistant that returns only valid JSON.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.1,
          max_tokens: 200,
        });
      },
      2,
      1000,
    );

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response content from OpenAI standard completion");
    }

    let emailData;
    try {
      emailData = JSON.parse(content);
    } catch (parseError) {
      throw new Error("Invalid JSON response from OpenAI");
    }

    const validatedData = validateEmailData(emailData);
    return validatedData;
  }
}
