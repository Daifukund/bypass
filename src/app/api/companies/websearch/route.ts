import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { CompanySearchService } from '@/lib/openai';

// Type guard function to check if object is a company
function isCompanyObject(obj: any): obj is { name: string; [key: string]: any } {
  return obj && 
         typeof obj === 'object' && 
         'name' in obj && 
         typeof obj.name === 'string' && 
         obj.name.length > 0;
}

// Create server-side Supabase client
async function createClient() {
  const cookieStore = await cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Authenticated user:', user.id);

    const body = await req.json();
    
    // Extract search mode from request
    const searchMode = body.searchMode || 'standard'; // Default to standard
    
    // Validate required fields
    if (!body.jobTitle) {
      return NextResponse.json({ error: 'Job title is required' }, { status: 400 });
    }

    // Check if user exists in users table, if not create it
    const { data: existingUser, error: userCheckError } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single();

    if (userCheckError && userCheckError.code === 'PGRST116') {
      // User doesn't exist in users table, create it
      console.log('Creating user in users table...');
      const { error: userCreateError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email,
          plan: 'freemium',
          email_credits: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (userCreateError) {
        console.error('User creation error:', userCreateError);
        return NextResponse.json({ error: 'Failed to create user profile' }, { status: 500 });
      }
    } else if (userCheckError) {
      console.error('User check error:', userCheckError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
    
    // Generate IDs
    const criteriaId = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    // 1. Save criteria to Supabase with camelCase field names
    const criteriaData = {
      id: criteriaId,
      user_id: user.id,
      jobTitle: body.jobTitle,           // ✅ Changed from job_title
      location: body.location || null,
      jobType: body.jobType || null,     // ✅ Changed from job_type
      industry: body.industry || null,
      platforms: body.platforms || null,
      companySize: body.companySize || null,           // ✅ Changed from company_size
      experienceLevel: body.experienceLevel || null,   // ✅ Changed from experience_level
      keywords: Array.isArray(body.keywords) ? body.keywords.join(',') : body.keywords || null,
      language: body.language || null,
      expectedSalary: body.expectedSalary || null,     // ✅ Changed from expected_salary
      excludeCompanies: body.excludeCompanies || null, // ✅ Changed from exclude_companies
      created_at: createdAt,
    };

    console.log('Inserting criteria:', criteriaData);

    const { error: criteriaError } = await supabase
      .from('search_criteria')
      .insert(criteriaData);

    if (criteriaError) {
      console.error('Criteria save error:', criteriaError);
      return NextResponse.json({ error: 'Failed to save criteria' }, { status: 500 });
    }

    // 2. Search companies using OpenAI with specified mode
    let companies: any[] = [];
    let citations: Array<{ url: string; title?: string }> = [];
    let usedWebSearch = false;

    try {
      console.log('🚀 Calling OpenAI service with mode:', searchMode);
      
      // Pass search mode to service
      const searchResult = await CompanySearchService.searchCompanies(body, searchMode);
      
      console.log('🔍 OpenAI Search Result type:', typeof searchResult);
      console.log('🔍 OpenAI Search Result:', JSON.stringify(searchResult, null, 2));
      
      // Handle different response formats
      if (searchResult && typeof searchResult === 'object') {
        // New SearchResult format
        if ('data' in searchResult) {
          companies = Array.isArray(searchResult.data) ? searchResult.data : [];
          citations = Array.isArray(searchResult.citations) ? searchResult.citations : [];
          usedWebSearch = Boolean(searchResult.usedWebSearch);
        }
        // Legacy array format (fallback)
        else if (Array.isArray(searchResult)) {
          companies = searchResult;
          citations = [];
          usedWebSearch = false;
        }
        // Single object format - Use type guard function
        else if (isCompanyObject(searchResult)) {
          companies = [searchResult];
          citations = [];
          usedWebSearch = false;
        }
        // Unknown object format
        else {
          console.warn('⚠️ Unknown object format from OpenAI:', searchResult);
          companies = [];
        }
      }
      // Direct array response
      else if (Array.isArray(searchResult)) {
        companies = searchResult;
        citations = [];
        usedWebSearch = false;
      }
      // Unexpected format
      else {
        console.warn('⚠️ Unexpected response format from OpenAI:', typeof searchResult);
        companies = [];
      }
      
      console.log('✅ Extracted companies count:', companies.length);
      console.log('✅ Citations count:', citations.length);
      console.log('✅ Used web search:', usedWebSearch);
      
      // Validate companies data
      if (!Array.isArray(companies) || companies.length === 0) {
        console.warn('⚠️ No valid companies returned from OpenAI');
        throw new Error('No companies found matching your criteria');
      }

      // Validate each company has required fields
      companies = companies.filter(company => 
        company && 
        typeof company === 'object' && 
        company.name && 
        company.description
      );

      if (companies.length === 0) {
        throw new Error('No valid companies found with complete information');
      }
      
    } catch (openaiError) {
      console.error('OpenAI search error:', openaiError);
      
      // Return proper error instead of fake fallback companies
      return NextResponse.json({ 
        error: 'Unable to find companies matching your criteria',
        message: 'Our AI search service is temporarily unavailable. Please try again in a few minutes or adjust your search criteria.',
        details: openaiError instanceof Error ? openaiError.message : 'Unknown error'
      }, { status: 503 });
    }

    // 3. Save companies to Supabase with camelCase field names
    let companyInserts: any[] = [];

    if (companies.length > 0) {
      companyInserts = companies.map((company, index) => ({
        id: crypto.randomUUID(),
        user_id: user.id,
        search_criteria_id: criteriaId,
        name: company.name || '',
        logoUrl: company.logo || company.logoUrl || null,
        description: company.description || '',
        estimatedEmployees: company.estimatedEmployees || company.estimated_employees || null,
        relevanceScore: company.relevanceScore || company.relevance_score || 'Good Match',
        location: company.location || null,
        linkedinUrl: company.linkedinUrl || company.linkedin_url || null,
        websiteUrl: company.websiteUrl || company.website_url || company.url || null,
        source: company.source || 'OpenAI Web Search',
        created_at: createdAt,
      }));

      console.log('Inserting companies:', companyInserts);

      const { error: companiesError } = await supabase
        .from('company_suggestions')
        .insert(companyInserts);

      if (companiesError) {
        console.error('Companies save error:', companiesError);
        // Don't fail the request if we can't save to DB, just log the error
        console.warn('⚠️ Failed to save companies to database, but returning results anyway');
      }
    }

    // Add this debug log before the return statement
    console.log('🔍 DEBUG: About to return companies:', {
      companyInsertsLength: companyInserts.length,
      firstCompanyId: companyInserts[0]?.id,
      originalCompaniesLength: companies.length,
      firstOriginalCompanyId: companies[0]?.id
    });

    // 4. Return response
    return NextResponse.json({
      companies: companyInserts.map((companyInsert, index) => ({
        id: companyInsert.id,
        name: companyInsert.name,
        logoUrl: companyInsert.logoUrl,
        description: companyInsert.description,
        estimatedEmployees: companyInsert.estimatedEmployees,
        relevanceScore: companyInsert.relevanceScore,
        location: companyInsert.location,
        url: companyInsert.websiteUrl,
        linkedinUrl: companyInsert.linkedinUrl,
        source: companyInsert.source,
      })),
      citations: citations,
      usedWebSearch: usedWebSearch,
      criteriaId: criteriaId,
      message: `Found ${companyInserts.length} companies matching your criteria`
    });

  } catch (error) {
    console.error('Unexpected error in companies/websearch:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: 'An unexpected error occurred. Please try again.'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Company search endpoint. Use POST method.' });
}