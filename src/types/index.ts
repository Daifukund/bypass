// Explicitly import and re-export database types
export type {
  Database,
  User,
  UserInsert,
  UserUpdate,
  SearchCriteria as DatabaseSearchCriteria, // ✅ Renamed to avoid conflict
  SearchCriteriaInsert,
  CompanyRow, // ✅ Database company type
  CompanyInsert,
  EmployeeRow, // ✅ Database employee type
  EmployeeInsert,
  EmailGeneration,
  EmailGenerationInsert,
  Subscription,
  SubscriptionInsert,
} from "./database";

// DON'T re-export OpenAI types - just import them when needed
// Remove these lines that are causing the error:
// export type {
//   Company,
//   Employee,
//   SearchCriteria as OpenAISearchCriteria,
//   EmailData,
//   EmailContent,
//   RelevanceScore,
//   CompanySize,
//   SeniorityLevel,
//   EmailType
// } from '@/lib/openai/types';

// Import OpenAI types for use in this file only
import type { Company, Employee } from "@/lib/openai/types";

// Import validation types (don't re-export to avoid circular dependencies)
import type {
  UserProfileInput,
  SearchCriteriaInput,
  EmailGenerationInput,
  EmailAddressInput,
  EmployeeSearchInput,
} from "@/lib/validations"; // ✅ Use @/ alias

// Application-specific types that don't map directly to database
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreditInfo {
  creditsUsed: number;
  creditsRemaining: number;
  maxCredits: number;
  plan: string;
  isAtLimit: boolean;
}

// Search state management types
export interface SearchState {
  criteria: SearchCriteriaInput | null;
  companies: Company[]; // ✅ Uses OpenAI Company type
  selectedCompany: Company | null;
  employees: Employee[]; // ✅ Uses OpenAI Employee type
  selectedEmployee: Employee | null;
  generatedEmail: string;
  searchSessionId: string | null;
}

// API request/response types
export interface CompanySearchResponse extends ApiResponse {
  companies: Company[]; // ✅ Uses OpenAI Company type
  criteriaId: string;
  citations?: Array<{ url: string; title?: string }>;
}

export interface EmployeeSearchResponse extends ApiResponse {
  employees: Employee[]; // ✅ Uses OpenAI Employee type
  linkedinPeopleSearchUrl?: string;
}

export interface EmailGenerationResponse extends ApiResponse {
  email: string;
  subject: string;
  emailAddress: string;
  confidenceScore: number;
}

export interface EmailAddressResponse extends ApiResponse {
  emailAddress: string;
  confidenceScore: number;
}

// Validation input types (re-exported for convenience)
export type {
  UserProfileInput,
  SearchCriteriaInput,
  EmailGenerationInput,
  EmailAddressInput,
  EmployeeSearchInput,
};
