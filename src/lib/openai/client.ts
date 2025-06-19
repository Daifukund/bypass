import OpenAI from "openai";

/**
 * OpenAI Client Configuration
 * Centralized client initialization for all OpenAI services
 */

// Validate API key at startup (but allow development without it)
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey && process.env.NODE_ENV === "production") {
  throw new Error(
    "OPENAI_API_KEY environment variable is required in production",
  );
}

if (!apiKey && process.env.NODE_ENV !== "production") {
  console.warn(
    "⚠️ OPENAI_API_KEY not found. OpenAI features will be disabled in development.",
  );
}

/**
 * Initialize OpenAI client with configuration
 */
export const openai = apiKey
  ? new OpenAI({
      apiKey: apiKey,
      // Optional: Add additional configuration
      timeout: 60000, // 60 seconds timeout
      maxRetries: 3, // Retry failed requests up to 3 times
    })
  : null;

/**
 * Check if OpenAI client supports the new responses API with web search
 * This is used to determine whether to use web search or fallback to standard completions
 */
export const supportsWebSearch = (): boolean => {
  return !!(openai?.responses && typeof openai.responses.create === "function");
};

/**
 * Default request configurations for different types of AI calls
 */
export const DEFAULT_CONFIGS = {
  /**
   * Configuration for web search enabled requests
   */
  WEB_SEARCH: {
    model: "gpt-4.1" as const,
    search_context_size: "medium" as const,
    timeout: 60000, // Web search can take longer
  },

  /**
   * Configuration for standard chat completions
   */
  STANDARD: {
    model: "gpt-4o" as const,
    timeout: 30000,
  },

  /**
   * Configuration for factual/data extraction tasks
   */
  FACTUAL: {
    model: "gpt-4o" as const,
    temperature: 0.3,
    max_tokens: 200,
    timeout: 20000,
  },

  /**
   * Configuration for creative content generation
   */
  CREATIVE: {
    model: "gpt-4o" as const,
    temperature: 0.8,
    max_tokens: 500,
    timeout: 30000,
  },

  /**
   * Configuration for search and discovery tasks
   */
  SEARCH: {
    model: "gpt-4o" as const,
    temperature: 0.7,
    max_tokens: 2000,
    timeout: 45000,
  },
} as const;

/**
 * Helper function to create user location object for web search
 * Parses location string and returns formatted location object
 */
export const createUserLocation = (location?: string) => {
  if (!location) {
    return {
      type: "approximate" as const,
      country: "US",
      city: "New York",
      region: "New York",
    };
  }

  // Parse location string (e.g., "Paris, France" or "San Francisco, CA, US")
  const parts = location.split(",").map((part) => part.trim());

  if (parts.length >= 2) {
    const city = parts[0];
    const country = parts[parts.length - 1];
    const region = parts.length > 2 ? parts[1] : city;

    return {
      type: "approximate" as const,
      country: country,
      city: city,
      region: region,
    };
  }

  // Fallback if location format is unexpected
  return {
    type: "approximate" as const,
    country: "US",
    city: location,
    region: location,
  };
};

/**
 * Helper function to create web search tools configuration
 */
export const createWebSearchTools = (
  location?: string,
  contextSize: "low" | "medium" | "high" = "medium",
) => {
  return [
    {
      type: "web_search_preview" as const,
      search_context_size: contextSize,
      user_location: createUserLocation(location),
    },
  ];
};

/**
 * Error handling helper for OpenAI API calls
 */
export const handleOpenAIError = (error: any, context: string): Error => {
  console.error(`❌ OpenAI API Error in ${context}:`, error);
  console.error("❌ Error Details:", JSON.stringify(error, null, 2));

  // Extract meaningful error message
  let errorMessage = `Failed to ${context.toLowerCase()}`;

  if (error?.error?.message) {
    errorMessage = error.error.message;
  } else if (error?.message) {
    errorMessage = error.message;
  } else if (typeof error === "string") {
    errorMessage = error;
  }

  // Add context to error message
  return new Error(`${context}: ${errorMessage}`);
};

/**
 * Logging helper for OpenAI requests
 */
export const logOpenAIRequest = (
  operation: string,
  prompt: string,
  additionalData?: Record<string, any>,
) => {
  console.log(`🚀 OpenAI Request - ${operation}`);
  console.log(
    "📝 Prompt:",
    prompt.substring(0, 200) + (prompt.length > 200 ? "..." : ""),
  );

  if (additionalData) {
    Object.entries(additionalData).forEach(([key, value]) => {
      console.log(`${getLogIcon(key)} ${key}:`, value);
    });
  }
};

/**
 * Logging helper for OpenAI responses
 */
export const logOpenAIResponse = (
  operation: string,
  response: any,
  extractedData?: any,
) => {
  console.log(`📥 OpenAI Response - ${operation}`);
  console.log("📄 Full Response:", JSON.stringify(response, null, 2));

  if (extractedData) {
    console.log("✅ Extracted Data:", JSON.stringify(extractedData, null, 2));
  }
};

/**
 * Helper to get appropriate emoji for log entries
 */
const getLogIcon = (key: string): string => {
  const iconMap: Record<string, string> = {
    criteria: "🎯",
    company: "🏢",
    companyName: "🏢",
    jobTitle: "💼",
    location: "📍",
    contactName: "👤",
    fullName: "👤",
    emailType: "📧",
    language: "🌐",
    employees: "👥",
    citations: "🔗",
    usedWebSearch: "🔍",
  };

  return iconMap[key] || "📋";
};

/**
 * Rate limiting helper (basic implementation)
 * You might want to implement more sophisticated rate limiting
 */
export class RateLimiter {
  private requests: number[] = [];
  private readonly maxRequests: number;
  private readonly timeWindow: number;

  constructor(maxRequests: number = 60, timeWindowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindowMs;
  }

  async checkLimit(): Promise<void> {
    const now = Date.now();

    // Remove old requests outside the time window
    this.requests = this.requests.filter(
      (time) => now - time < this.timeWindow,
    );

    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = Math.min(...this.requests);
      const waitTime = this.timeWindow - (now - oldestRequest);

      console.warn(`⚠️ Rate limit reached. Waiting ${waitTime}ms...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    this.requests.push(now);
  }
}

// Export a default rate limiter instance
export const defaultRateLimiter = new RateLimiter();

/**
 * Health check function to verify OpenAI API connectivity
 */
export const checkOpenAIHealth = async (): Promise<boolean> => {
  if (!openai) {
    console.warn("⚠️ OpenAI client not initialized (missing API key)");
    return false;
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Hello" }],
      max_tokens: 5,
    });

    return !!response.choices[0]?.message?.content;
  } catch (error) {
    console.error("❌ OpenAI Health Check Failed:", error);
    return false;
  }
};

/**
 * Helper function to ensure OpenAI client is available
 * Throws an error if client is not initialized
 */
export const ensureOpenAIClient = (): OpenAI => {
  if (!openai) {
    throw new Error(
      "OpenAI client not initialized. Please check your OPENAI_API_KEY environment variable.",
    );
  }
  return openai;
};

/**
 * Safe wrapper for OpenAI operations
 * Returns null if client is not available instead of throwing
 */
export const safeOpenAIOperation = async <T>(
  operation: (client: OpenAI) => Promise<T>,
): Promise<T | null> => {
  if (!openai) {
    console.warn("⚠️ OpenAI operation skipped - client not initialized");
    return null;
  }

  try {
    return await operation(openai);
  } catch (error) {
    console.error("❌ OpenAI operation failed:", error);
    throw error;
  }
};

export default openai;
