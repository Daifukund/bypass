/**
 * OpenAI Utility Functions
 * Shared utilities for parsing, processing, and handling OpenAI responses
 */

/**
 * Helper function to extract and parse JSON from AI response
 * Handles various JSON formats and common parsing issues
 */
export function extractAndParseJSON(text: string): any[] {
  console.log("🔍 Raw text to parse:", text);

  // Remove any markdown code blocks
  let cleanText = text.replace(/```(?:json)?\s*/g, "").replace(/```/g, "");

  // Try to find JSON array pattern
  const jsonPatterns = [
    // Standard JSON array
    /\[\s*\{[\s\S]*?\}\s*\]/,
    // JSON array with trailing content
    /(\[\s*\{[\s\S]*?\}\s*\])/,
    // Multiple objects in array format
    /\[\s*\{[\s\S]*?\}\s*(?:,\s*\{[\s\S]*?\}\s*)*\]/,
  ];

  let jsonString = "";

  // Try each pattern
  for (const pattern of jsonPatterns) {
    const match = cleanText.match(pattern);
    if (match) {
      jsonString = match[1] || match[0];
      break;
    }
  }

  // If no pattern matched, try to extract everything between first [ and last ]
  if (!jsonString) {
    const firstBracket = cleanText.indexOf("[");
    const lastBracket = cleanText.lastIndexOf("]");
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      jsonString = cleanText.substring(firstBracket, lastBracket + 1);
    }
  }

  console.log("🔍 Extracted JSON string:", jsonString);

  if (!jsonString) {
    console.error("❌ No JSON found in response");
    return [];
  }

  try {
    // Clean up common JSON issues
    let cleanedJson = jsonString
      .replace(/,\s*}/g, "}") // Remove trailing commas in objects
      .replace(/,\s*]/g, "]") // Remove trailing commas in arrays
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // Remove control characters
      .replace(/\n/g, " ") // Replace newlines with spaces
      .replace(/\r/g, "") // Remove carriage returns
      .replace(/\t/g, " ") // Replace tabs with spaces
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim();

    console.log("🔍 Cleaned JSON string:", cleanedJson);

    const parsed = JSON.parse(cleanedJson);
    console.log("✅ Successfully parsed JSON:", parsed);

    return Array.isArray(parsed) ? parsed : [parsed];
  } catch (error) {
    console.error("❌ JSON parsing failed:", error);
    console.error("❌ Attempted to parse:", jsonString);

    // Last resort: try to manually extract objects
    return extractObjectsManually(cleanText);
  }
}

/**
 * Fallback manual extraction for when JSON parsing fails
 * Attempts to extract individual JSON objects from text
 */
export function extractObjectsManually(text: string): any[] {
  console.log("🔧 Attempting manual object extraction...");

  const objects: any[] = [];
  const objectPattern = /\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g;
  const matches = text.match(objectPattern);

  if (matches) {
    for (const match of matches) {
      try {
        const cleaned = match
          .replace(/,\s*}/g, "}")
          .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
          .trim();

        const obj = JSON.parse(cleaned);
        if (obj && typeof obj === "object") {
          objects.push(obj);
        }
      } catch (e) {
        console.warn("⚠️ Failed to parse individual object:", match);
      }
    }
  }

  console.log("🔧 Manually extracted objects:", objects);
  return objects;
}

/**
 * Extract a single JSON object from AI response
 * Used for responses that should return a single object (like email generation)
 */
export function extractAndParseSingleJSON(text: string): any {
  console.log("🔍 Raw text to parse (single object):", text);

  // Remove markdown code blocks
  let cleanText = text.replace(/```(?:json)?\s*/g, "").replace(/```/g, "");

  // Try to find single JSON object pattern
  const objectPatterns = [
    // Standard JSON object
    /\{[\s\S]*?\}/,
    // JSON object with surrounding text
    /(\{[\s\S]*?\})/,
  ];

  let jsonString = "";

  // Try each pattern
  for (const pattern of objectPatterns) {
    const match = cleanText.match(pattern);
    if (match) {
      jsonString = match[1] || match[0];
      break;
    }
  }

  console.log("🔍 Extracted JSON string:", jsonString);

  if (!jsonString) {
    console.error("❌ No JSON object found in response");
    return null;
  }

  try {
    // Clean up common JSON issues
    let cleanedJson = jsonString
      .replace(/,\s*}/g, "}") // Remove trailing commas
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // Remove control characters
      .replace(/\n/g, " ") // Replace newlines with spaces
      .replace(/\r/g, "") // Remove carriage returns
      .replace(/\t/g, " ") // Replace tabs with spaces
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim();

    console.log("🔍 Cleaned JSON string:", cleanedJson);

    const parsed = JSON.parse(cleanedJson);
    console.log("✅ Successfully parsed JSON object:", parsed);

    return parsed;
  } catch (error) {
    console.error("❌ JSON parsing failed:", error);
    console.error("❌ Attempted to parse:", jsonString);
    return null;
  }
}

/**
 * Extract citations from OpenAI web search response
 * Processes annotations and returns formatted citation objects
 */
export function extractCitations(annotations: any[]): Array<{ url: string; title?: string }> {
  if (!annotations || !Array.isArray(annotations)) {
    return [];
  }

  return annotations
    .filter((annotation) => annotation.type === "url_citation" && annotation.url)
    .map((annotation) => ({
      url: annotation.url,
      title: annotation.title || annotation.url,
    }));
}

/**
 * Check if OpenAI response used web search
 * Analyzes response output to determine if web search was utilized
 */
export function checkWebSearchUsage(response: any): boolean {
  if (!response?.output || !Array.isArray(response.output)) {
    return false;
  }

  return response.output.some((item: any) => item.type === "web_search_call");
}

/**
 * Extract message content from OpenAI web search response
 * Handles the complex response structure from web search API
 */
export function extractMessageContent(response: any): {
  text: string | null;
  annotations: any[];
} {
  if (!response?.output || !Array.isArray(response.output)) {
    return { text: null, annotations: [] };
  }

  // Find the message in the response output
  const message = response.output.find((item: any) => item.type === "message");

  if (!message?.content || !Array.isArray(message.content)) {
    return { text: null, annotations: [] };
  }

  const content = message.content[0];

  return {
    text: content?.text || null,
    annotations: content?.annotations || [],
  };
}

/**
 * Validate and sanitize search criteria
 * Ensures search criteria is in the expected format
 */
export function sanitizeSearchCriteria(criteria: any): any {
  if (!criteria || typeof criteria !== "object") {
    return {};
  }

  // Helper function to safely handle keywords
  const formatKeywords = (keywords: any): string => {
    if (!keywords) return "Not specified";
    if (Array.isArray(keywords)) return keywords.join(", ");
    if (typeof keywords === "string") return keywords;
    return "Not specified";
  };

  return {
    jobTitle: criteria.jobTitle || "Not specified",
    location: criteria.location || "Not specified",
    jobType: criteria.jobType || "Not specified",
    industry: criteria.industry || "Not specified",
    companySize: criteria.companySize || "Not specified",
    experienceLevel: criteria.experienceLevel || "Not specified",
    keywords: formatKeywords(criteria.keywords),
    language: criteria.language || "Not specified",
    expectedSalary: criteria.expectedSalary || "Not specified",
  };
}

/**
 * Smart text truncation that preserves word boundaries
 * Used for displaying shortened content in UI cards
 */
export function smartTruncate(text: string, maxLength: number = 100): string {
  if (!text || typeof text !== "string") {
    return "";
  }

  if (text.length <= maxLength) {
    return text;
  }

  // Find the last space before maxLength to avoid cutting words
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");

  // If the last space is reasonably close to maxLength (within 80% of it)
  // use it as the cut point, otherwise just cut at maxLength
  if (lastSpace > maxLength * 0.8) {
    return text.substring(0, lastSpace).trim() + "...";
  }

  return truncated.trim() + "...";
}

/**
 * Validate and clean company descriptions
 * Ensures descriptions are appropriate length for UI display
 */
export function validateCompanyData(companies: any[]): any[] {
  if (!Array.isArray(companies)) {
    return [];
  }

  return companies
    .filter((company) => {
      return (
        company &&
        typeof company === "object" &&
        typeof company.name === "string" &&
        company.name.length > 0 &&
        typeof company.description === "string" &&
        company.description.length > 0
      );
    })
    .map((company) => ({
      ...company,
      // ✅ Clean and truncate description
      description: smartTruncate(company.description, 120),
      // Normalize field names to camelCase
      relevanceScore: company.relevanceScore || company.relevance_score || "Good Match",
      estimatedEmployees: company.estimatedEmployees || company.estimated_employees || "Unknown",
      linkedinUrl: company.linkedinUrl || company.linkedin_url || null,
      websiteUrl: company.websiteUrl || company.website_url || company.url || null,
      logoUrl: company.logoUrl || company.logo_url || company.logo || null,
    }));
}

/**
 * Validate employee data from AI response
 * Ensures employee objects have required fields and proper format
 */
export function validateEmployeeData(employees: any[]): any[] {
  if (!Array.isArray(employees)) {
    return [];
  }

  return employees
    .filter((employee) => {
      return (
        employee &&
        typeof employee === "object" &&
        (employee.fullName || employee.full_name) &&
        (employee.jobTitle || employee.job_title)
      );
    })
    .map((employee) => ({
      ...employee,
      // Normalize field names to camelCase
      fullName: employee.fullName || employee.full_name || "Unknown",
      jobTitle: employee.jobTitle || employee.job_title || "Unknown",
      relevanceScore: employee.relevanceScore || employee.relevance_score || "Good Match",
      linkedinUrl: employee.linkedinUrl || employee.linkedin_url || null,
      seniorityLevel: employee.seniorityLevel || employee.seniority_level || null,
      yearsAtCompany: employee.yearsAtCompany || employee.years_at_company || null,
      profileImage: employee.profileImage || employee.profile_image || null,
    }));
}

/**
 * Validate email data from AI response
 * Ensures email objects have required fields and proper format
 */
export function validateEmailData(emailData: any): any {
  if (!emailData || typeof emailData !== "object") {
    return null;
  }

  // Normalize field names to camelCase
  return {
    ...emailData,
    confidenceScore: emailData.confidenceScore || emailData.confidence_score || 0,
    formatType: emailData.formatType || emailData.format_type || "unknown",
    alternativeEmails: emailData.alternativeEmails || emailData.alternative_emails || [],
  };
}

/**
 * Clean text content by removing unwanted characters and formatting
 * Used for cleaning AI-generated content before processing
 */
export function cleanTextContent(text: string): string {
  if (!text || typeof text !== "string") {
    return "";
  }

  return text
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // Remove control characters
    .replace(/\r\n/g, "\n") // Normalize line endings
    .replace(/\r/g, "\n") // Convert remaining \r to \n
    .replace(/\n{3,}/g, "\n\n") // Limit consecutive newlines
    .replace(/\t/g, "  ") // Convert tabs to spaces
    .trim();
}

/**
 * Clean email content by preserving paragraph structure
 * Used specifically for email body content to maintain formatting
 */
export function cleanEmailContent(text: string): string {
  if (!text || typeof text !== "string") {
    return "";
  }

  return (
    text
      // Remove control characters EXCEPT newlines (\n = \u000A) and carriage returns (\r = \u000D)
      .replace(/[\u0000-\u0009\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, "")
      .replace(/\r\n/g, "\n") // Normalize line endings
      .replace(/\r/g, "\n") // Convert remaining \r to \n
      .replace(/\n{3,}/g, "\n\n") // Limit consecutive newlines to max 2
      .replace(/\t/g, "  ") // Convert tabs to spaces
      .replace(/[ \t]+$/gm, "") // Remove trailing spaces from each line
      .trim()
  );
}

/**
 * Parse email content from AI response
 * Extracts subject and body from formatted email content
 */
export function parseEmailContent(content: string): {
  subject: string;
  body: string;
} {
  if (!content || typeof content !== "string") {
    return { subject: "", body: "" };
  }

  const lines = content.split("\n");
  let subject = "";
  let body = "";
  let foundSubject = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.toLowerCase().startsWith("subject:")) {
      subject = line.substring(8).trim();
      foundSubject = true;
    } else if (foundSubject && line.toLowerCase().startsWith("body:")) {
      // Start collecting body content from next line
      body = lines
        .slice(i + 1)
        .join("\n")
        .trim();
      break;
    } else if (foundSubject && line.length > 0 && !subject) {
      // If we found "Subject:" but no content on same line
      subject = line;
    } else if (foundSubject && !line.toLowerCase().startsWith("body:") && body === "") {
      // Collect everything after subject as body if no "Body:" marker
      body = lines.slice(i).join("\n").trim();
      break;
    }
  }

  // If no structured format found, treat entire content as body
  if (!foundSubject) {
    body = content.trim();
  }

  return {
    subject: cleanTextContent(subject),
    body: cleanEmailContent(body), // Use specialized email content cleaner for body
  };
}

/**
 * Generate a unique request ID for tracking
 * Used for logging and debugging API requests
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Retry utility function for handling transient failures
 * Implements exponential backoff for API calls
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === maxRetries) {
        throw lastError;
      }

      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      console.log(`⏳ Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

/**
 * Truncate text to specified length with ellipsis
 * Used for displaying shortened content in UI
 */
export function truncateText(text: string, maxLength: number = 200): string {
  if (!text || typeof text !== "string") {
    return "";
  }

  if (text.length <= maxLength) {
    return text;
  }

  return text.substring(0, maxLength - 3).trim() + "...";
}

/**
 * Deep clone utility for objects
 * Used for safely copying complex data structures
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => deepClone(item)) as unknown as T;
  }

  const cloned = {} as T;
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }

  return cloned;
}
