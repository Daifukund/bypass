/**
 * OpenAI Types and Interfaces
 * Centralized type definitions for all OpenAI-related functionality
 */

// Move all type unions to the TOP of the file, before interfaces
export type RelevanceScore = "Perfect Match" | "Good Match" | "Potential Match";

export type CompanySize =
  | "Startup (1-50)"
  | "Scale-up (51-200)"
  | "Mid-size (201-1000)"
  | "Enterprise (1000+)"
  | "Unknown";

export type SeniorityLevel =
  | "Entry-level"
  | "Mid-level"
  | "Senior"
  | "Executive"
  | "C-Level"
  | "Unknown";

export type EmailType =
  | "Networking"
  | "Cold Application"
  | "Referral Request"
  | "Coffee Chat"
  | "Follow-up"
  | "Thank You";

export type EmailFormat =
  | "first.last"
  | "firstlast"
  | "first_last"
  | "f.last"
  | "first.l"
  | "flast"
  | "unknown";

export type EmailTone = "Professional" | "Casual" | "Formal" | "Friendly" | "Direct";

/**
 * OpenAI Web Search Response Structure
 * Represents the response from OpenAI's web search API
 */
export interface WebSearchResponse {
  output: Array<{
    type: "web_search_call" | "message";
    id?: string;
    status?: string;
    role?: string;
    content?: Array<{
      type: "output_text";
      text: string;
      annotations?: Array<{
        type: "url_citation";
        url: string;
        title?: string;
      }>;
    }>;
  }>;
}

/**
 * Generic Search Result Structure
 * Used for both company and employee search results
 */
export interface SearchResult<T = any> {
  data: T[];
  citations: Citation[];
  usedWebSearch: boolean;
  requestId?: string;
  timestamp?: Date;
}

/**
 * Citation Structure
 * Represents a web source citation from search results
 */
export interface Citation {
  url: string;
  title?: string;
}

/**
 * Search Criteria Interface
 * Represents user job search preferences
 */
export interface SearchCriteria {
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
 * Company Data Structure
 * Represents a company found through AI search
 */
export interface Company {
  id?: string; // Added for frontend state management
  name: string;
  logo?: string;
  description: string;
  estimatedEmployees: string; // ✅ Changed from estimated_employees
  relevanceScore: RelevanceScore; // ✅ Changed from relevance_score
  location: string;
  url?: string;
  linkedinUrl?: string; // ✅ Changed from linkedin_url
  websiteUrl?: string; // ✅ Changed from website_url
  source: string; // ✅ Add this missing property
  industry?: string;
  founded?: string;
  sizeCategory?: CompanySize; // ✅ Changed from size_category
}

/**
 * Employee/Contact Data Structure
 * Represents an employee found through AI search
 */
export interface Employee {
  id?: string; // Added for frontend state management
  fullName: string; // ✅ Changed from full_name
  jobTitle: string; // ✅ Changed from job_title
  location: string;
  relevanceScore: RelevanceScore; // ✅ Changed from relevance_score
  linkedinUrl?: string; // ✅ Changed from linkedin_url
  source: string;
  department?: string;
  seniorityLevel?: SeniorityLevel; // ✅ Changed from seniority_level
  yearsAtCompany?: string; // ✅ Changed from years_at_company
  profileImage?: string; // ✅ Changed from profile_image
}

/**
 * Email Data Structure
 * Represents generated email address information
 */
export interface EmailData {
  email: string;
  confidenceScore: number; // ✅ Changed from confidence_score (0-1 decimal)
  domain?: string;
  formatType?: EmailFormat; // ✅ Changed from format_type
  alternativeEmails?: string[]; // ✅ Changed from alternative_emails
}

/**
 * Email Content Structure
 * Represents generated email content
 */
export interface EmailContent {
  subject: string;
  body: string;
  emailType: EmailType; // ✅ Changed from email_type
  language: string;
  wordCount?: number; // ✅ Changed from word_count
  tone?: EmailTone;
}

/**
 * OpenAI Request Configuration
 * Configuration options for OpenAI API calls
 */
export interface OpenAIRequestConfig {
  model: OpenAIModel;
  temperature?: number;
  maxTokens?: number; // ✅ Changed from max_tokens
  timeout?: number;
  tools?: OpenAITool[];
  messages?: OpenAIMessage[];
  systemPrompt?: string; // ✅ Changed from system_prompt
}

/**
 * OpenAI Message Structure
 * Represents a message in the conversation
 */
export interface OpenAIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * OpenAI Tool Configuration
 * Configuration for tools like web search
 */
export interface OpenAITool {
  type: "web_search_preview";
  searchContextSize: SearchContextSize; // ✅ Changed from search_context_size
  userLocation?: UserLocation; // ✅ Changed from user_location
}

/**
 * User Location for Web Search
 * Location context for web search queries
 */
export interface UserLocation {
  type: "approximate";
  country: string;
  city: string;
  region: string;
}

/**
 * LinkedIn Paste Analysis Result
 * Result from analyzing pasted LinkedIn content
 */
export interface LinkedInPasteResult {
  employees: Employee[];
  totalFound: number; // ✅ Changed from total_found
  parsingSuccess: boolean; // ✅ Changed from parsing_success
  errors?: string[];
}

/**
 * API Error Response
 * Standardized error response structure
 */
export interface APIError {
  error: string;
  message: string;
  code?: string;
  details?: any;
  timestamp: Date;
}

/**
 * Processing Status Interface
 * Tracks the status of long-running operations
 */
export interface ProcessingStatus {
  status: "pending" | "processing" | "completed" | "failed";
  progress?: number; // 0-100
  message?: string;
  startedAt: Date; // ✅ Changed from started_at
  completedAt?: Date; // ✅ Changed from completed_at
  error?: string;
}

/**
 * Batch Processing Result
 * Result from processing multiple items
 */
export interface BatchProcessingResult<T> {
  successful: T[];
  failed: Array<{
    item: any;
    error: string;
  }>;
  totalProcessed: number; // ✅ Changed from total_processed
  successRate: number; // ✅ Changed from success_rate
}

// Type Unions and Enums
export type OpenAIModel =
  | "gpt-4.1" // For web search
  | "gpt-4o" // For standard completions
  | "gpt-3.5-turbo" // For simple tasks
  | "gpt-4-turbo"; // For complex tasks

/**
 * Search Context Size for Web Search
 */
export type SearchContextSize = "low" | "medium" | "high";

/**
 * Job Types
 */
export type JobType =
  | "Full-time"
  | "Part-time"
  | "Internship"
  | "Contract"
  | "Freelance"
  | "Remote"
  | "Hybrid";

/**
 * Experience Levels
 */
export type ExperienceLevel =
  | "Entry-level"
  | "Mid-level"
  | "Senior"
  | "Executive"
  | "Student"
  | "Recent Graduate";

/**
 * Industry Types
 */
export type Industry =
  | "Technology"
  | "Finance"
  | "Healthcare"
  | "Education"
  | "Retail"
  | "Manufacturing"
  | "Consulting"
  | "Marketing"
  | "Sales"
  | "HR"
  | "Legal"
  | "Real Estate"
  | "Media"
  | "Non-profit"
  | "Government"
  | "Other";

/**
 * Language Types
 */
export type Language =
  | "English"
  | "French"
  | "German"
  | "Spanish"
  | "Italian"
  | "Portuguese"
  | "Dutch"
  | "Other";

// Utility Types
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;
export type ArrayElement<T> = T extends (infer U)[] ? U : never;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type OmitMultiple<T, K extends keyof T> = Omit<T, K>;
export type PickMultiple<T, K extends keyof T> = Pick<T, K>;

// Validation Types
export interface ValidationResult<T> {
  isValid: boolean;
  data?: T;
  errors?: string[];
}

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}

export type ValidationSchema<T> = {
  [K in keyof T]?: ValidationRule;
};

// API Namespace Types
export namespace CompanySearch {
  export interface Request extends SearchCriteria {}
  export interface Response extends SearchResult<Company> {}
}

export namespace EmployeeSearch {
  export interface Request {
    companyName: string;
    jobTitle: string;
    location?: string;
  }
  export interface Response extends SearchResult<Employee> {}
}

export namespace EmailGeneration {
  export interface Request {
    contactName: string;
    jobTitle: string;
    companyName: string;
    location?: string;
    emailType: EmailType;
    language?: string;
  }
  export interface Response {
    subject: string;
    body: string;
    emailType: EmailType;
    language: string;
  }
}

// Default Values and Constants
export const DEFAULT_VALUES = {
  RELEVANCE_SCORE: "Good Match" as RelevanceScore,
  COMPANY_SIZE: "Unknown" as CompanySize,
  EMAIL_TYPE: "Networking" as EmailType,
  EMAIL_TONE: "Professional" as EmailTone,
  LANGUAGE: "English" as Language,
  OPENAI_MODEL: "gpt-4o" as OpenAIModel,
  SEARCH_CONTEXT_SIZE: "medium" as SearchContextSize,
  TEMPERATURE: 0.7,
  MAX_TOKENS: 2000,
  TIMEOUT: 30000, // 30 seconds
} as const;

/**
 * Validation constraints
 */
export const CONSTRAINTS = {
  MAX_COMPANIES: 15,
  MAX_EMPLOYEES: 6,
  MIN_JOB_TITLE_LENGTH: 2,
  MAX_JOB_TITLE_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
  MIN_CONFIDENCE_SCORE: 0,
  MAX_CONFIDENCE_SCORE: 1,
  MAX_EMAIL_BODY_LENGTH: 2000,
  MAX_SUBJECT_LENGTH: 100,
} as const;

export interface UserProfile {
  firstName?: string;
  lastName?: string;
  university?: string;
  studyLevel?: string;
  fieldOfStudy?: string;
  phone?: string;
  linkedin?: string;
  bioText?: string;
  personalWebsite?: string;
}
