/**
 * Company Search Service
 * Handles AI-powered company discovery based on job search criteria
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
  validateCompanyData,
  sanitizeSearchCriteria,
  generateRequestId,
  withRetry,
} from "../utils";
import {
  SearchResult,
  Company,
  SearchCriteria,
  WebSearchResponse,
  CompanySearch,
  OpenAIRequestConfig,
} from "../types";

/**
 * Company Search Service Class
 * Provides methods for discovering companies using AI and web search
 */
export class CompanySearchService {
  /**
   * Search for companies based on job search criteria
   * 🆕 Added searchMode parameter to force specific search type
   */
  static async searchCompanies(
    criteria: SearchCriteria,
    searchMode: "standard" | "websearch" = "standard", // 🆕 Add parameter
  ): Promise<SearchResult<Company>> {
    const requestId = generateRequestId();
    const sanitizedCriteria = sanitizeSearchCriteria(criteria);
    const prompt = OPENAI_PROMPTS.COMPANY_DISCOVERY(sanitizedCriteria);

    // Log the request
    logOpenAIRequest("searchCompanies", prompt, {
      criteria: sanitizedCriteria,
      searchMode, // 🆕 Log search mode
      requestId,
    });

    try {
      // 🆕 Use search mode to determine which method to call
      if (searchMode === "websearch" && supportsWebSearch()) {
        console.log("🌐 Using WebSearch mode (user selected)");
        return await this.searchWithWebSearch(
          sanitizedCriteria,
          prompt,
          requestId,
        );
      } else if (searchMode === "standard") {
        console.log("⚡ Using Standard mode (user selected)");
        return await this.searchWithStandardCompletion(
          sanitizedCriteria,
          prompt,
          requestId,
        );
      } else {
        // Fallback: try web search first if available (original behavior)
        if (supportsWebSearch()) {
          return await this.searchWithWebSearch(
            sanitizedCriteria,
            prompt,
            requestId,
          );
        } else {
          console.log("⚠️ Web search not available, using standard completion");
          return await this.searchWithStandardCompletion(
            sanitizedCriteria,
            prompt,
            requestId,
          );
        }
      }
    } catch (error) {
      console.error("❌ Company search failed, attempting fallback");

      // Fallback to standard completion if web search fails
      try {
        return await this.searchWithStandardCompletion(
          sanitizedCriteria,
          prompt,
          requestId,
        );
      } catch (fallbackError) {
        throw handleOpenAIError(fallbackError, "Company Search");
      }
    }
  }

  /**
   * Search companies using OpenAI web search API
   * Provides more up-to-date and relevant results
   */
  private static async searchWithWebSearch(
    criteria: SearchCriteria,
    prompt: string,
    requestId: string,
  ): Promise<SearchResult<Company>> {
    // Check if OpenAI client is available
    if (!openai) {
      throw new Error(
        "OpenAI client not initialized. Please check your OPENAI_API_KEY environment variable.",
      );
    }

    const tools = createWebSearchTools(criteria.location, "medium");

    const requestPayload = {
      model: DEFAULT_CONFIGS.WEB_SEARCH.model,
      tools,
      input: prompt,
    };

    console.log(
      "📤 Web Search Request Payload:",
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
      2000,
    );

    // Log the full response
    logOpenAIResponse("searchCompanies (Web Search)", response);

    // Check if web search was actually used
    const usedWebSearch = checkWebSearchUsage(response);
    console.log("🔍 Web Search Used:", usedWebSearch);

    // Extract message content and citations
    const { text, annotations } = extractMessageContent(response);

    if (!text) {
      throw new Error("No response text from OpenAI web search");
    }

    console.log("📄 Extracted Text:", text);
    console.log(
      "🔗 Annotations/Citations:",
      JSON.stringify(annotations, null, 2),
    );

    // Extract and validate company data
    const rawCompanies = extractAndParseJSON(text);
    const companies = validateCompanyData(rawCompanies);

    // Extract citations
    const citations = extractCitations(annotations);

    console.log("🏢 Parsed Companies:", JSON.stringify(companies, null, 2));
    console.log("📚 Citations:", JSON.stringify(citations, null, 2));

    return {
      data: companies,
      citations,
      usedWebSearch,
      requestId,
      timestamp: new Date(),
    };
  }

  /**
   * Search companies using standard OpenAI completion
   * Fallback method when web search is not available
   */
  private static async searchWithStandardCompletion(
    criteria: SearchCriteria,
    prompt: string,
    requestId: string,
  ): Promise<SearchResult<Company>> {
    // Check if OpenAI client is available
    if (!openai) {
      throw new Error(
        "OpenAI client not initialized. Please check your OPENAI_API_KEY environment variable.",
      );
    }

    const config: OpenAIRequestConfig = {
      model: DEFAULT_CONFIGS.SEARCH.model,
      temperature: DEFAULT_CONFIGS.SEARCH.temperature || 0.7,
      maxTokens: DEFAULT_CONFIGS.SEARCH.max_tokens || 2000,
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPTS.JSON_ONLY,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    };

    console.log(
      "📤 Standard Completion Config:",
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
    logOpenAIResponse("searchCompanies (Standard)", response);

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response content from OpenAI standard completion");
    }

    console.log("📄 Response Content:", content);

    // Extract and validate company data
    const rawCompanies = extractAndParseJSON(content);
    const companies = validateCompanyData(rawCompanies);

    console.log("🏢 Parsed Companies:", JSON.stringify(companies, null, 2));

    return {
      data: companies,
      citations: [],
      usedWebSearch: false,
      requestId,
      timestamp: new Date(),
    };
  }

  /**
   * Search companies with custom prompt
   * Allows for specialized company search scenarios
   */
  static async searchWithCustomPrompt(
    customPrompt: string,
    location?: string,
    useWebSearch: boolean = true,
  ): Promise<SearchResult<Company>> {
    const requestId = generateRequestId();

    logOpenAIRequest("searchCompanies (Custom)", customPrompt, {
      location,
      useWebSearch,
      requestId,
    });

    try {
      if (useWebSearch && supportsWebSearch()) {
        // Check if OpenAI client is available
        if (!openai) {
          throw new Error(
            "OpenAI client not initialized. Please check your OPENAI_API_KEY environment variable.",
          );
        }

        const tools = createWebSearchTools(location, "medium");

        const requestPayload = {
          model: DEFAULT_CONFIGS.WEB_SEARCH.model,
          tools,
          input: customPrompt,
        };

        const response = await withRetry(async () => {
          return (await openai!.responses.create(
            requestPayload,
          )) as WebSearchResponse;
        });

        const { text, annotations } = extractMessageContent(response);

        if (!text) {
          throw new Error("No response text from custom web search");
        }

        const rawCompanies = extractAndParseJSON(text);
        const companies = validateCompanyData(rawCompanies);
        const citations = extractCitations(annotations);

        return {
          data: companies,
          citations,
          usedWebSearch: true,
          requestId,
          timestamp: new Date(),
        };
      } else {
        // Check if OpenAI client is available
        if (!openai) {
          throw new Error(
            "OpenAI client not initialized. Please check your OPENAI_API_KEY environment variable.",
          );
        }

        const response = await withRetry(async () => {
          return await openai!.chat.completions.create({
            model: DEFAULT_CONFIGS.STANDARD.model,
            messages: [
              {
                role: "system",
                content: SYSTEM_PROMPTS.JSON_ONLY,
              },
              {
                role: "user",
                content: customPrompt,
              },
            ],
            temperature: 0.7,
            max_tokens: 2000,
          });
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
          throw new Error(
            "No response content from custom standard completion",
          );
        }

        const rawCompanies = extractAndParseJSON(content);
        const companies = validateCompanyData(rawCompanies);

        return {
          data: companies,
          citations: [],
          usedWebSearch: false,
          requestId,
          timestamp: new Date(),
        };
      }
    } catch (error) {
      throw handleOpenAIError(error, "Custom Company Search");
    }
  }

  /**
   * Get companies by industry
   * Specialized search for companies in specific industries
   */
  static async searchByIndustry(
    industry: string,
    location?: string,
    companySize?: string,
  ): Promise<SearchResult<Company>> {
    const prompt = `Find companies in the ${industry} industry${location ? ` located in ${location}` : ""}${companySize ? ` with company size: ${companySize}` : ""}. Return companies that are actively hiring or growing.`;

    return this.searchWithCustomPrompt(prompt, location);
  }

  /**
   * Get trending/fast-growing companies
   * Finds companies that are currently expanding
   */
  static async searchTrendingCompanies(
    location?: string,
    industry?: string,
  ): Promise<SearchResult<Company>> {
    const prompt = `Find trending, fast-growing, or recently funded companies${industry ? ` in the ${industry} industry` : ""}${location ? ` located in ${location}` : ""}. Focus on companies that are actively hiring and expanding their teams.`;

    return this.searchWithCustomPrompt(prompt, location);
  }

  /**
   * Search companies by keywords
   * Finds companies based on specific keywords or technologies
   */
  static async searchByKeywords(
    keywords: string[],
    location?: string,
    jobTitle?: string,
  ): Promise<SearchResult<Company>> {
    const keywordString = keywords.join(", ");
    const prompt = `Find companies that work with or specialize in: ${keywordString}${jobTitle ? ` and are likely hiring for ${jobTitle} roles` : ""}${location ? ` located in ${location}` : ""}. Focus on companies actively using these technologies or services.`;

    return this.searchWithCustomPrompt(prompt, location);
  }

  /**
   * Validate search criteria
   * Ensures the search criteria has required fields
   */
  static validateCriteria(criteria: SearchCriteria): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!criteria) {
      errors.push("Search criteria is required");
      return { isValid: false, errors };
    }

    // Check for at least one search parameter
    const hasJobTitle = criteria.jobTitle || criteria.jobTitle;
    const hasLocation = criteria.location;
    const hasIndustry = criteria.industry;
    const hasKeywords =
      criteria.keywords &&
      ((Array.isArray(criteria.keywords) && criteria.keywords.length > 0) ||
        (typeof criteria.keywords === "string" &&
          criteria.keywords.trim().length > 0));

    if (!hasJobTitle && !hasLocation && !hasIndustry && !hasKeywords) {
      errors.push(
        "At least one search parameter is required (job title, location, industry, or keywords)",
      );
    }

    // Validate job title length if provided
    if (hasJobTitle) {
      const jobTitle = criteria.jobTitle || criteria.jobTitle || "";
      if (jobTitle.length < 2) {
        errors.push("Job title must be at least 2 characters long");
      }
      if (jobTitle.length > 100) {
        errors.push("Job title must be less than 100 characters");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get search statistics and capabilities
   */
  static getSearchStats(): {
    webSearchSupported: boolean;
    defaultModel: string;
    maxCompanies: number;
  } {
    return {
      webSearchSupported: supportsWebSearch(),
      defaultModel: DEFAULT_CONFIGS.WEB_SEARCH.model,
      maxCompanies: 15,
    };
  }
}
