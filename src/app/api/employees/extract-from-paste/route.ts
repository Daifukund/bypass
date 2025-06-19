import { NextRequest, NextResponse } from 'next/server';
import { OPENAI_PROMPTS } from '@/constants/prompts';
import { createClient } from '@/lib/supabase';
import crypto from 'crypto';

// Simple function to extract and parse JSON from text
function extractAndParseJSON(text: string): any {
  try {
    // Try to parse as direct JSON first
    return JSON.parse(text);
  } catch {
    // If that fails, try to extract JSON from markdown or other formatting
    const jsonMatch = text.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/) || 
                     text.match(/(\[[\s\S]*?\])/) ||
                     text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) ||
                     text.match(/(\{[\s\S]*?\})/);
    
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch {
        return null;
      }
    }
    return null;
  }
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

    const body = await req.json();
    
    // Validate required fields
    if (!body.content || !body.companyName) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        message: 'Content and company name are required',
        received: { 
          content: !!body.content, 
          companyName: body.companyName,
          location: body.location
        }
      }, { status: 400 });
    }

    console.log('🔍 Extracting employees from LinkedIn paste for:', {
      companyName: body.companyName,
      location: body.location,
      contentLength: body.content.length
    });

    // ✅ FIRST: Find or create company record
    let companyId: string;
    
    // Try to find existing company
    const { data: existingCompany } = await supabase
      .from('company_suggestions')
      .select('id')
      .eq('name', body.companyName)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (existingCompany) {
      companyId = existingCompany.id;
      console.log('✅ Found existing company:', companyId);
    } else {
      // Create new company record
      companyId = crypto.randomUUID();
      const { error: companyError } = await supabase
        .from('company_suggestions')
        .insert({
          id: companyId,
          user_id: user.id,
          search_criteria_id: null, // No search criteria for manual paste
          name: body.companyName,
          description: `Company added via LinkedIn paste`,
          location: body.location || 'Unknown',
          relevanceScore: 'Manual Entry',
          source: 'LinkedIn Paste',
          created_at: new Date().toISOString(),
        });

      if (companyError) {
        console.error('❌ Error creating company:', companyError);
        return NextResponse.json({ error: 'Failed to create company record' }, { status: 500 });
      }
      
      console.log('✅ Created new company:', companyId);
    }

    // Check if OpenAI is available
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ 
        error: 'OpenAI not available',
        message: 'AI service is temporarily unavailable. Please try again later.',
      }, { status: 503 });
    }

    try {
      // Dynamic import to avoid issues
      const OpenAI = (await import('openai')).default;
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      // Use OpenAI to analyze the LinkedIn content
      const prompt = OPENAI_PROMPTS.LINKEDIN_PASTE_ANALYSIS(body.content, body.companyName);
      
      console.log('📤 Sending LinkedIn paste analysis request to OpenAI');
      console.log('📝 Prompt preview:', prompt.substring(0, 300) + '...');
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a LinkedIn content analyzer. Return only valid JSON arrays with employee data. Extract real people with names, job titles, and locations from the provided LinkedIn content.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response content from OpenAI');
      }

      console.log('📄 OpenAI Response:', content);

      // Extract and validate employee data
      const rawEmployees = extractAndParseJSON(content);
      
      console.log('🔍 Raw employees extracted:', rawEmployees);

      if (!Array.isArray(rawEmployees) || rawEmployees.length === 0) {
        return NextResponse.json({ 
          success: true,
          employees: [],
          total: 0,
          message: 'No employees found in the provided content. Please make sure you copied the LinkedIn people search results correctly.'
        });
      }

      // ✅ Transform and SAVE employees to database
      const employeesToInsert = rawEmployees
        .filter(emp => emp && typeof emp === 'object' && (
          emp.full_name || emp.fullName || emp.name
        ))
        .map((emp: any) => ({
          id: crypto.randomUUID(),
          user_id: user.id,
          company_id: companyId, // ✅ Real company ID
          name: emp.full_name || emp.fullName || emp.name || 'Unknown',
          title: emp.job_title || emp.jobTitle || emp.title || 'Unknown',
          location: emp.location && emp.location !== 'Unknown' && emp.location.trim() 
            ? emp.location 
            : body.location || 'Unknown',
          linkedinUrl: emp.linkedin_url || emp.linkedinUrl || '',
          relevanceScore: emp.relevance_score || emp.relevanceScore || 'Average Contact',
          source: 'LinkedIn Paste',
          created_at: new Date().toISOString(),
        }));

      console.log('💾 Inserting employees to database:', employeesToInsert.length);

      // ✅ Save employees to database
      const { error: employeesError } = await supabase
        .from('employee_contacts')
        .insert(employeesToInsert);

      if (employeesError) {
        console.error('❌ Employees save error:', employeesError);
        return NextResponse.json({ error: 'Failed to save employees' }, { status: 500 });
      }

      console.log('✅ Employees saved to database successfully');

      // ✅ Return employees with real database IDs
      const transformedEmployees = employeesToInsert.map((emp) => ({
        id: emp.id, // ✅ Real UUID from database
        name: emp.name,
        title: emp.title,
        location: emp.location,
        linkedinUrl: emp.linkedinUrl,
        relevanceScore: emp.relevanceScore,
        source: emp.source
      }));

      const responseData = {
        success: true,
        employees: transformedEmployees,
        total: transformedEmployees.length,
        message: `Extracted ${transformedEmployees.length} employees from LinkedIn content${body.location ? ` in ${body.location}` : ''}`
      };

      console.log('✅ Returning response:', responseData);
      return NextResponse.json(responseData);

    } catch (openaiError) {
      console.error('OpenAI analysis error:', openaiError);
      
      return NextResponse.json({ 
        error: 'Unable to analyze LinkedIn content',
        message: 'Our AI service encountered an error while analyzing the content. Please try again or check that you copied valid LinkedIn search results.',
        details: process.env.NODE_ENV === 'development' ? String(openaiError) : undefined
      }, { status: 503 });
    }

  } catch (error) {
    console.error('❌ Extract from paste error:', error);
    
    return NextResponse.json({ 
      error: 'Internal server error',
      message: 'An unexpected error occurred while processing your request.',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    }, { status: 500 });
  }
}