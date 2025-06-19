/**
 * Employee Search Service
 * Handles AI-powered employee discovery at target companies
 */

import { openai, supportsWebSearch, createWebSearchTools, logOpenAIRequest, logOpenAIResponse, handleOpenAIError, DEFAULT_CONFIGS } from '../client';
import { OPENAI_PROMPTS, SYSTEM_PROMPTS } from '@/constants/prompts';
import { 
  extractAndParseJSON, 
  extractMessageContent, 
  extractCitations, 
  checkWebSearchUsage,
  validateEmployeeData,
  generateRequestId,
  withRetry
} from '../utils';
import { 
  SearchResult, 
  Employee, 
  WebSearchResponse,
  OpenAIRequestConfig
} from '../types';

interface EmployeeSearchCriteria {
  companyName: string;
  jobTitle: string;
  location?: string;
}

// Define a specific result type for employee search
interface EmployeeSearchResult extends SearchResult<Employee> {
  linkedinPeopleSearchUrl?: string;
}

/**
 * Employee Search Service Class
 * Provides methods for finding employees at target companies
 */
export class EmployeeSearchService {
  /**
   * Search for employees at a specific company
   * Uses OpenAI web search when available, falls back to standard completion
   */
  static async searchEmployees(criteria: EmployeeSearchCriteria): Promise<EmployeeSearchResult> {
    const requestId = generateRequestId();
    const prompt = OPENAI_PROMPTS.EMPLOYEE_DISCOVERY(criteria);

    // Log the request
    logOpenAIRequest('searchEmployees', prompt, { 
      criteria,
      requestId 
    });

    try {
      // Try web search first if available
      if (supportsWebSearch()) {
        return await this.searchWithWebSearch(criteria, prompt, requestId);
      } else {
        console.log('⚠️ Web search not available, using standard completion');
        return await this.searchWithStandardCompletion(criteria, prompt, requestId);
      }
    } catch (error) {
      console.error('❌ Employee search failed, attempting fallback');
      
      // Fallback to standard completion if web search fails
      try {
        return await this.searchWithStandardCompletion(criteria, prompt, requestId);
      } catch (fallbackError) {
        throw handleOpenAIError(fallbackError, 'Employee Search');
      }
    }
  }

  /**
   * Search employees using OpenAI web search API
   * Provides more up-to-date and relevant results
   */
  private static async searchWithWebSearch(
    criteria: EmployeeSearchCriteria, 
    prompt: string, 
    requestId: string
  ): Promise<EmployeeSearchResult> {
    // Check if OpenAI client is available
    if (!openai) {
      throw new Error('OpenAI client not initialized. Please check your OPENAI_API_KEY environment variable.');
    }
    
    const tools = createWebSearchTools(criteria.location, 'medium');
    
    const requestPayload = {
      model: DEFAULT_CONFIGS.WEB_SEARCH.model,
      tools,
      input: prompt
    };

    console.log('📤 Web Search Request Payload:', JSON.stringify(requestPayload, null, 2));

    // Use retry wrapper for reliability
    const response = await withRetry(async () => {
      return await openai!.responses.create(requestPayload) as WebSearchResponse;
    }, 2, 2000);

    // Log the full response
    logOpenAIResponse('searchEmployees (Web Search)', response);

    // Check if web search was actually used
    const usedWebSearch = checkWebSearchUsage(response);
    console.log('🔍 Web Search Used:', usedWebSearch);

    // Extract message content and citations
    const { text, annotations } = extractMessageContent(response);

    if (!text) {
      throw new Error('No response text from OpenAI web search');
    }

    console.log('📄 Extracted Text:', text);
    console.log('🔗 Annotations/Citations:', JSON.stringify(annotations, null, 2));

    // Extract and validate employee data
    const rawData = extractAndParseJSON(text);
    
    // Handle new response format with LinkedIn People Search URL
    let employees: Employee[] = [];
    let linkedinPeopleSearchUrl: string | undefined;
    
    if (rawData && typeof rawData === 'object' && 'employees' in rawData) {
      // New format with LinkedIn People Search URL
      employees = validateEmployeeData((rawData as any).employees || []);
      linkedinPeopleSearchUrl = (rawData as any).linkedin_people_search_url || undefined;
    } else if (Array.isArray(rawData)) {
      // Legacy format - just employees array
      employees = validateEmployeeData(rawData);
    } else {
      employees = [];
    }
    
    // Extract citations
    const citations = extractCitations(annotations);

    console.log('👥 Parsed Employees:', JSON.stringify(employees, null, 2));
    console.log('🔗 LinkedIn People Search URL:', linkedinPeopleSearchUrl);
    console.log('📚 Citations:', JSON.stringify(citations, null, 2));

    return {
      data: employees,
      citations,
      usedWebSearch,
      requestId,
      timestamp: new Date(),
      linkedinPeopleSearchUrl
    };
  }

  /**
   * Search employees using standard OpenAI completion
   * Fallback method when web search is not available
   */
  private static async searchWithStandardCompletion(
    criteria: EmployeeSearchCriteria, 
    prompt: string, 
    requestId: string
  ): Promise<EmployeeSearchResult> {
    // Check if OpenAI client is available
    if (!openai) {
      throw new Error('OpenAI client not initialized. Please check your OPENAI_API_KEY environment variable.');
    }
    
    const config: OpenAIRequestConfig = {
      model: DEFAULT_CONFIGS.SEARCH.model,
      temperature: DEFAULT_CONFIGS.SEARCH.temperature || 0.7,
      max_tokens: DEFAULT_CONFIGS.SEARCH.max_tokens || 2000,
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPTS.JSON_ONLY
        },
        {
          role: 'user',
          content: prompt
        }
      ]
    };

    console.log('📤 Standard Completion Config:', JSON.stringify(config, null, 2));

    // Use retry wrapper for reliability
    const response = await withRetry(async () => {
      return await openai!.chat.completions.create({
        model: config.model,
        messages: config.messages!,
        temperature: config.temperature,
        max_tokens: config.max_tokens,
      });
    }, 2, 1000);

    // Log the full response
    logOpenAIResponse('searchEmployees (Standard)', response);

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response content from OpenAI standard completion');
    }

    console.log('📄 Response Content:', content);

    // Extract and validate employee data
    const rawData = extractAndParseJSON(content);
    
    // Handle new response format with LinkedIn People Search URL
    let employees: Employee[] = [];
    let linkedinPeopleSearchUrl: string | undefined;
    
    if (rawData && typeof rawData === 'object' && 'employees' in rawData) {
      // New format with LinkedIn People Search URL
      employees = validateEmployeeData((rawData as any).employees || []);
      linkedinPeopleSearchUrl = (rawData as any).linkedin_people_search_url || undefined;
    } else if (Array.isArray(rawData)) {
      // Legacy format - just employees array
      employees = validateEmployeeData(rawData);
    } else {
      employees = [];
    }

    console.log('👥 Parsed Employees:', JSON.stringify(employees, null, 2));
    console.log('🔗 LinkedIn People Search URL:', linkedinPeopleSearchUrl);

    return {
      data: employees,
      citations: [],
      usedWebSearch: false,
      requestId,
      timestamp: new Date(),
      linkedinPeopleSearchUrl
    };
  }
}