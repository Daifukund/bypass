/**
 * OpenAI Library - Main Export File
 * Centralized exports for all OpenAI services, utilities, and types
 */

// ============================================================================
// CLIENT AND CONFIGURATION
// ============================================================================

export { 
    openai,
    supportsWebSearch,
    createUserLocation,
    createWebSearchTools,
    handleOpenAIError,
    logOpenAIRequest,
    logOpenAIResponse,
    checkOpenAIHealth,
    defaultRateLimiter,
    RateLimiter,
    DEFAULT_CONFIGS,
    ensureOpenAIClient,
    safeOpenAIOperation
} from './client';

// ============================================================================
// UTILITIES
// ============================================================================

export {
    extractAndParseJSON,
    extractObjectsManually,
    extractAndParseSingleJSON,
    extractCitations,
    checkWebSearchUsage,
    extractMessageContent,
    sanitizeSearchCriteria,
    validateCompanyData,
    validateEmployeeData,
    validateEmailData,
    cleanTextContent,
    parseEmailContent,
    generateRequestId,
    withRetry,
    truncateText,
    deepClone
} from './utils';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export type {
    // Core Types
    WebSearchResponse,
    SearchResult,
    Citation,
    SearchCriteria,
    Company,
    Employee,
    EmailData,
    EmailContent,
    
    // Configuration Types
    OpenAIRequestConfig,
    OpenAIMessage,
    OpenAITool,
    UserLocation,
    
    // Analysis Types
    LinkedInPasteResult,
    APIError,
    ProcessingStatus,
    BatchProcessingResult,
    
    // Union Types
    RelevanceScore,
    CompanySize,
    SeniorityLevel,
    EmailType,
    EmailFormat,
    EmailTone,
    OpenAIModel,
    SearchContextSize,
    JobType,
    ExperienceLevel,
    Industry,
    Language,
    
    // Utility Types
    PartialExcept,
    ArrayElement,
    RequiredFields,
    OmitMultiple,
    PickMultiple,
    ValidationResult,
    ValidationRule,
    ValidationSchema,
    
    // Service Namespaces (types only)
    CompanySearch,
} from './types';

export {
    DEFAULT_VALUES,
    CONSTRAINTS
} from './types';

// ============================================================================
// SERVICES (Only export what exists)
// ============================================================================

export { 
    CompanySearchService
} from './services/company-search';

export { EmployeeSearchService } from './services/employee-search';

export { EmailGenerationService } from './services/email-guess';

export { 
    generateEmailContent,
    checkUserCredits,
    incrementUserCredits,
    saveEmailGeneration
} from './services/email-generation';

export type {
    EmailGenerationParams,
    CreditCheckResult
} from './services/email-generation';


