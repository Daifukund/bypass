// Explicitly import and re-export database types
export type {
  Database,
  User,
  UserInsert,
  UserUpdate,
  SearchCriteria,
  SearchCriteriaInsert,
  Company,        // ✅ Explicitly export Company
  CompanyInsert,
  Employee,       // ✅ Explicitly export Employee
  EmployeeInsert,
  EmailGeneration,
  EmailGenerationInsert,
  Subscription,
  SubscriptionInsert,
} from './database';

// Import validation types (don't re-export to avoid circular dependencies)
import type {
  UserProfileInput,
  SearchCriteriaInput,
  EmailGenerationInput,
  EmailAddressInput,
  EmployeeSearchInput,
} from '../lib/validations';

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
  companies: Company[];
  selectedCompany: Company | null;
  employees: Employee[];
  selectedEmployee: Employee | null;
  generatedEmail: string;
  searchSessionId: string | null;
}

// API request/response types
export interface CompanySearchResponse extends ApiResponse {
  companies: Company[];
  criteriaId: string;
  citations?: Array<{ url: string; title?: string }>;
}

export interface EmployeeSearchResponse extends ApiResponse {
  employees: Employee[];
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