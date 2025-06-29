/**
 * OpenAI Prompts for Bypass Job Search Application
 * Centralized prompt management for all AI interactions
 */

import type { EmailGenerationParams } from "@/lib/openai/services/email-generation";
import { LINKEDIN_GEO_REGIONS, getLinkedInRegionCode } from "./linkedin-regions";

// Types for better type safety
interface SearchCriteria {
  jobTitle?: string;
  location?: string;
  jobType?: string;
  industry?: string;
  companySize?: string;
  experienceLevel?: string;
  keywords?: string[] | string;
  language?: string;
  expectedSalary?: string;
  excludeCompanies?: string[];
}

/**
 * Helper function to safely format keywords
 */
const formatKeywords = (keywords: any): string => {
  if (!keywords) return "Not specified";
  if (Array.isArray(keywords)) return keywords.join(", ");
  if (typeof keywords === "string") return keywords;
  return "Not specified";
};

/**
 * All OpenAI prompts used in the application
 */
export const OPENAI_PROMPTS = {
  /**
   * Company Discovery Prompt
   * Used for finding companies that match job search criteria
   */
  COMPANY_DISCOVERY: (
    criteria: SearchCriteria
  ): string => `You are an AI assistant helping job seekers discover companies that best match their search criteria. The user has filled in the following preferences (some fields may be empty):
• Job Title: ${criteria.jobTitle || "Not specified"}
• Location: ${criteria.location || "Not specified"}
• Job Type: ${criteria.jobType || "Not specified"}
• Industry: ${criteria.industry || "Not specified"}
• Company Size: ${criteria.companySize || "Not specified"}
• Experience Level: ${criteria.experienceLevel || "Not specified"}
• Keywords: ${formatKeywords(criteria.keywords)}
• Preferred Language: ${criteria.language || "Not specified"}
• Expected Salary: ${criteria.expectedSalary || "Not specified"}
• Exclude Companies: ${criteria.excludeCompanies || "Not specified"}

Based on the above inputs, return a list of 10 companies that are actively hiring or growing, and match the job seeker's criteria. Use reliable and up-to-date information.

RELEVANCE SCORING CRITERIA:
• "Perfect Match" = Company actively hiring for the EXACT job title + matches location + matches industry + matches company size preferences (use sparingly, max 3-5 companies)
• "Good Match" = Company hiring for similar/related roles + matches 2-3 key criteria (location OR industry OR company size) + known to hire for this experience level
• "Potential Match" = Company in relevant industry + might hire for this role + matches 1-2 criteria + worth exploring but not obvious fit

DISTRIBUTION REQUIREMENT: Return approximately 3-5 "Perfect Match", 2-3 "Good Match", and 2-3 "Potential Match" companies to provide variety. (Show varierty!)

VERY IMPORTANT: Find real companies that match the following criteria. Do not invent or make up company names — only return existing businesses!! (DO NOT INVENT COMPANIES!!)

IMPORTANT: Return ONLY a valid JSON array. No explanations, no markdown, no additional text.

For each company, return a JSON object with the following fields:
{
"name": "",                          // Company Name
"logo": "",                          // Company's first letter initial (e.g., "A" for Apple, "G" for Google)
"description": "",                   // 1-sentence description of the company
"relevanceScore": "",               // One of: "Perfect Match", "Good Match", "Potential Match"
"estimatedEmployees": "",            // Estimated number of employees
"location": "",                      // City + Country (e.g., "San Francisco, USA")
"url": ""                            // Website or LinkedIn URL
}

Sort companies by relevanceScore first (Perfect Match → Good Match → Potential Match), then by how well they match the specific job title and criteria.
Return ONLY the JSON array, nothing else.

REMEMBER THAT I ONLY WANT EXISTING COMPANIES, NOT INVENTED COMPANIES.`,

  /**
   * Employee Discovery Prompt
   * Used for finding employees at target companies
   */
  EMPLOYEE_DISCOVERY: (criteria: {
    companyName: string;
    jobTitle: string;
    location?: string;
  }): string => `You are an expert talent sourcing assistant. Find real employees currently working at "${criteria.companyName}" who would be relevant contacts for someone applying for a "${criteria.jobTitle}" position${criteria.location ? ` in ${criteria.location}` : ""}.

🎯 SEARCH OBJECTIVES:
Find 4-8 current employees who are:
• Working in the same department/function as "${criteria.jobTitle}"
• In similar or related roles (same level, one level up, or team leads)
• Based in ${criteria.location || "the main office location"}
• Likely to be helpful for networking, referrals, or insights

🔍 SEARCH STRATEGY:
1. Search LinkedIn for current employees at "${criteria.companyName}"
2. Look for people with job titles containing keywords from "${criteria.jobTitle}"
3. Include related roles in the same department/function
4. Prioritize people who are active and have public profiles
5. If LinkedIn results are limited, check company website team pages

✅ INCLUDE THESE TYPES OF CONTACTS:
• Same role: "${criteria.jobTitle}" or very similar titles
• Team members: Related roles in same department
• Team leads: Senior analysts, managers, team leads (not C-level)
• Recent hires: People who joined in similar roles recently
• Department colleagues: Anyone in the relevant business unit

🚫 AVOID:
• C-level executives (CEO, CTO, etc.)
• Generic HR/Recruiting roles (unless specifically relevant)
• Completely unrelated departments
• Outdated profiles (people who left the company)

📊 RELEVANCE SCORING:
• "Perfect Contact" = Same exact role or very similar title + same location
• "Good Contact" = Same department/function, related role, or team lead
• "Average Contact" = Relevant department but different level/function

🎯 CRITICAL OUTPUT REQUIREMENTS:
1. ALWAYS return ONLY valid JSON in this EXACT format
2. NO explanatory text, NO markdown, NO additional content
3. If you cannot find real employees, return {"employees": []}
4. NEVER return placeholder names or fake data

REQUIRED JSON FORMAT:
{
  "employees": [
    {
      "fullName": "Real Person Name",
      "jobTitle": "Their Current Job Title", 
      "location": "City, Country",
      "relevanceScore": "Perfect Contact|Good Contact|Average Contact",
      "linkedinUrl": "https://linkedin.com/in/profile-url",
      "source": "OpenAI Web Search"
    }
  ]
}

ABSOLUTE REQUIREMENTS: 
- Return ONLY the JSON object above, nothing else
- If no real employees found, return: {"employees": []}
- Do not include explanations, apologies, or additional text
- Do not return salary information or company descriptions
- Focus ONLY on finding real employee names and titles

Search now for current employees at "${criteria.companyName}" relevant to "${criteria.jobTitle}".`,

  /**
   * Email Address Generation Prompt
   * Used for guessing professional email addresses
   */
  EMAIL_ADDRESS_GENERATION: (
    fullName: string,
    companyName: string,
    jobTitle?: string,
    location?: string
  ): string => `You are an assistant that specializes in predicting professional email addresses based on standard corporate naming conventions.

Use the following input:
• Full Name: ${fullName}
• Company name: ${companyName}
${jobTitle ? `• Job Title: ${jobTitle}` : ""}
${location ? `• Location: ${location}` : ""}

Your task is to generate the most likely professional email address for this person at the given company.

Consider these factors:
- Company domain variations (e.g., .com, .fr, .co.uk based on location)
- Department-specific email formats (e.g., marketing.john@company.com)
- Regional office domains (e.g., john@company-uk.com)
- Role-based prefixes or suffixes

Only return one email. Do not include generic emails like info@, contact@, etc.

Output in the following JSON format:
{
  "email": "john.doe@airbnb.com",
  "confidenceScore": 0.92
}

The confidenceScore should be a decimal between 0 and 1, representing how likely the format is correct based on industry standards and company domain patterns.

Return ONLY the JSON object, nothing else.`,

  /**
   * Email Content Generation Prompt
   * Used for generating personalized outreach emails
   */
  EMAIL_CONTENT_GENERATION: (params: EmailGenerationParams): string => {
    const userInfo = params.userProfile;

    // ✅ Better fallback handling with actual user data
    const senderName =
      userInfo?.firstName && userInfo?.lastName
        ? `${userInfo.firstName} ${userInfo.lastName}`
        : "Student"; // Don't use placeholder brackets

    const university = userInfo?.university || "my university";
    const studyLevel = userInfo?.studyLevel || "student";
    const fieldOfStudy = userInfo?.fieldOfStudy || "my field of study";
    const phone = userInfo?.phone || "";
    const linkedin = userInfo?.linkedin || "";

    // Language-specific content
    const getLanguageSpecificContent = (language: string) => {
      switch (language.toLowerCase()) {
        case "french":
        case "français":
          return {
            closing: "Cordialement",
            instructions: "Use proper French accents (é, è, à, ç, etc.)",
            fallbackSubject: "Demande d'échange professionnel",
          };
        case "german":
        case "deutsch":
          return {
            closing: "Mit freundlichen Grüßen",
            instructions: "Use proper German formatting",
            fallbackSubject: "Anfrage für beruflichen Austausch",
          };
        case "spanish":
        case "español":
          return {
            closing: "Saludos cordiales",
            instructions: "Use proper Spanish formatting",
            fallbackSubject: "Solicitud de intercambio profesional",
          };
        case "italian":
        case "italiano":
          return {
            closing: "Cordiali saluti",
            instructions: "Use proper Italian formatting",
            fallbackSubject: "Richiesta di scambio professionale",
          };
        case "portuguese":
        case "português":
          return {
            closing: "Atenciosamente",
            instructions: "Use proper Portuguese formatting",
            fallbackSubject: "Solicitação de intercâmbio profissional",
          };
        default: // English
          return {
            closing: "Best regards",
            instructions: "Use professional English formatting",
            fallbackSubject: "Request for professional exchange",
          };
      }
    };

    const langContent = getLanguageSpecificContent(params.language);

    return `You are a professional job search coach. Write a short and personalized email for the following context:

- Sender: ${senderName}, a ${studyLevel} student in ${fieldOfStudy} at ${university}
- Receiver: ${params.contactName}, ${params.jobTitle} at ${params.companyName}${params.location ? ` in ${params.location}` : ""}
- Relationship: no prior contact
- Intent: ${params.emailType} (Networking / Cold Application / Referral Request / Coffee Chat)
- Language: ${params.language} (WRITE THE ENTIRE EMAIL IN ${params.language.toUpperCase()})

SENDER INFORMATION TO USE:
- Name: ${senderName}
- University: ${university}
- Study Level: ${studyLevel}
- Field of Study: ${fieldOfStudy}${phone ? `\n- Phone: ${phone}` : ""}${linkedin ? `\n- LinkedIn: ${linkedin}` : ""}

CRITICAL INSTRUCTIONS:
1. WRITE THE ENTIRE EMAIL IN ${params.language.toUpperCase()} LANGUAGE
2. Use the EXACT sender name "${senderName}" - do not use placeholders like [Your Name]
3. Use the EXACT university "${university}" - do not use placeholders like [your university]
4. Use the EXACT study level "${studyLevel}" - do not use placeholders
5. Use the EXACT field of study "${fieldOfStudy}" - do not use placeholders
6. Start with "Subject:" followed by the subject line IN ${params.language.toUpperCase()}
7. Add one blank line after the subject
8. Write the email body IN ${params.language.toUpperCase()}
9. ${langContent.instructions}
10. Keep it concise (100-150 words max for body)
11. Include sender's signature with the EXACT name "${senderName}"

EXACT FORMAT TO FOLLOW:
Subject: [Your subject line here in ${params.language}]

[Blank line]

[Email body content here in ${params.language}]

${langContent.closing},
${senderName}${phone ? `\nPhone: ${phone}` : ""}

CRITICAL: 
- Use REAL information, not placeholders
- The entire email must be in ${params.language.toUpperCase()}
- Use the exact sender name "${senderName}" everywhere
- Do NOT use brackets like [Your Name] or [your field of study]

Return ONLY the email in the exact format above.`;
  },

  /**
   * LinkedIn URL Generation Prompt
   * Used for generating LinkedIn search URLs
   */
  LINKEDIN_URL_GENERATION: (companyName: string, jobTitle: string, location?: string): string => {
    // Get the region code for the location
    const regionCode = location ? getLinkedInRegionCode(location) : null;

    let prompt = `Generate a LinkedIn People search URL for finding employees at a specific company.

Company: ${companyName}
Job Title/Keywords: ${jobTitle}${location ? `\nLocation: ${location}` : ""}

Return a direct LinkedIn URL in this EXACT format:
https://www.linkedin.com/company/[company-identifier]/people/?keywords=[relevant-keywords]`;

    // If we have a region code, add it to the prompt with the EXACT code
    if (regionCode) {
      prompt += `&facetGeoRegion=${regionCode}

IMPORTANT: The location "${location}" matches a major city. You MUST include the facetGeoRegion parameter with the EXACT value: ${regionCode}`;
    }

    prompt += `

Where:
- [company-identifier] is the LinkedIn company identifier (usually lowercase company name with hyphens)
- [relevant-keywords] are job-related keywords from the job title

Return ONLY the URL, nothing else. Do not modify or change the facetGeoRegion value if provided.`;

    return prompt;
  },

  /**
   * LinkedIn Paste Analysis Prompt
   * Used for extracting employee data from pasted LinkedIn content
   */
  LINKEDIN_PASTE_ANALYSIS: (content: string, companyName: string): string => `
You are a LinkedIn content analyzer. Extract ONLY real employees from pasted LinkedIn search results.

Company: ${companyName}

PASTED CONTENT:
${content}

🎯 EXTRACTION RULES:
1. Only extract profiles with COMPLETE first and last names
2. Skip profiles with incomplete names (e.g., "John D.", "Sarah K.")
3. Clean job titles - remove extra information after "|" or "•"
4. Extract city/country from location fields
5. Only include LinkedIn URLs if clearly visible

📝 COMMON LINKEDIN FORMATS TO RECOGNIZE:
- "John Smith\nMarketing Manager\nParis, France\nConnect"
- "Jane Doe • Senior Analyst at Company • London, UK"
- "Mike Johnson | Product Manager | New York, NY"

✅ RETURN FORMAT - ONLY this JSON:
[
  {
    "full_name": "Complete First Last Name Only",
    "job_title": "Clean Job Title Only", 
    "location": "City, Country",
    "linkedin_url": "URL if visible or empty string",
    "relevance_score": "Good Contact"
  }
]

🚫 STRICT RULES:
- Skip incomplete names (initials only)
- Return empty array [] if no valid employees found
- No explanations, only JSON array
- Clean job titles (remove university, credentials, multiple roles)
`,

  /**
   * Email Subject Generation Prompt
   */
  EMAIL_SUBJECT_GENERATION: (params: {
    senderName: string;
    contactName: string;
    jobTitle: string;
    companyName: string;
    emailType: string;
  }): string => `Generate a professional email subject line in French for:
- Sender: ${params.senderName}, student
- Receiver: ${params.contactName}, ${params.jobTitle} at ${params.companyName}
- Purpose: ${params.emailType}

Return only the subject line. Maximum 8 words. Use natural French.

Examples:
- Invitation à un échange informel
- Demande de conseil carrière
- Rencontre autour d'un café

Generate the subject:`,

  /**
   * Email Body Generation Prompt
   */
  EMAIL_BODY_GENERATION: (params: {
    senderName: string;
    contactName: string;
    jobTitle: string;
    companyName: string;
    emailType: string;
    userProfile?: {
      university?: string;
      studyLevel?: string;
      fieldOfStudy?: string;
      phone?: string;
      linkedin?: string;
    };
  }): string => {
    const userInfo = params.userProfile;
    const university = userInfo?.university || "mon université";
    const studyLevel = userInfo?.studyLevel || "étudiant";
    const fieldOfStudy = userInfo?.fieldOfStudy || "Finance";
    const phone = userInfo?.phone || "";
    const linkedin = userInfo?.linkedin || "";

    return `Write a professional email body in French for:

- Sender: ${params.senderName}, ${studyLevel} in ${fieldOfStudy} at ${university}
- Receiver: ${params.contactName}, ${params.jobTitle} at ${params.companyName}

Requirements:
- Start with "Bonjour M./Mme [LastName],"
- 2-3 short paragraphs
- Professional but warm tone
- End with "Cordialement, ${params.senderName}"
${phone ? `- Include phone: ${phone}` : ""}
${linkedin ? `- Include LinkedIn: ${linkedin}` : ""}

Write the email body:`;
  },
};

/**
 * System prompts for different AI interaction types
 */
export const SYSTEM_PROMPTS = {
  JSON_ONLY:
    "You are a helpful assistant that returns ONLY valid JSON arrays. No explanations, no markdown, no additional text.",
  JSON_OBJECT_ONLY: "You are a helpful assistant that returns only valid JSON.",
  PROFESSIONAL_COACH:
    "You are a professional job search coach helping students and early-career professionals.",
  TALENT_SOURCER:
    "You are an expert talent sourcing assistant with deep knowledge of professional networking.",
};

/**
 * Email types for email generation
 */
export const EMAIL_TYPES = {
  NETWORKING: "Networking",
  COLD_APPLICATION: "Cold Application",
  REFERRAL_REQUEST: "Referral Request",
  COFFEE_CHAT: "Coffee Chat",
} as const;

/**
 * Relevance score options
 */
export const RELEVANCE_SCORES = {
  PERFECT_MATCH: "Perfect Match",
  GOOD_MATCH: "Good Match",
  POTENTIAL_MATCH: "Potential Match",
} as const;

/**
 * Default OpenAI model configurations
 */
export const OPENAI_CONFIG = {
  MODELS: {
    WEB_SEARCH: "gpt-4.1",
    STANDARD: "gpt-4o",
  },
  TEMPERATURE: {
    FACTUAL: 0.3, // For email guessing, data extraction
    BALANCED: 0.7, // For company/employee search
    CREATIVE: 0.8, // For email content generation
  },
  MAX_TOKENS: {
    SHORT: 200, // Email address generation
    MEDIUM: 500, // Email content generation
    LONG: 1500, // Employee search
    EXTRA_LONG: 2000, // Company search
  },
  SEARCH_CONTEXT_SIZE: {
    LOW: "low" as const,
    MEDIUM: "medium" as const,
    HIGH: "high" as const,
  },
} as const;

export default OPENAI_PROMPTS;
