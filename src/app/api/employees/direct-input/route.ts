import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { companyName, fullName, jobTitle, location } = body;
    
    if (!companyName || !fullName) {
      return NextResponse.json({ 
        error: 'Company name and full name are required' 
      }, { status: 400 });
    }

    // Create company record
    const companyId = crypto.randomUUID();
    const { error: companyError } = await supabase
      .from('company_suggestions')
      .insert({
        id: companyId,
        user_id: user.id,
        search_criteria_id: null,
        name: companyName,
        description: 'Company added via direct input',
        location: location || 'Unknown',
        relevanceScore: 'Good Match',
        source: 'Direct Input',
        created_at: new Date().toISOString(),
      });

    if (companyError) {
      console.error('❌ Error creating company:', companyError);
      return NextResponse.json({ error: 'Failed to create company' }, { status: 500 });
    }

    // Create employee record
    const employeeId = crypto.randomUUID();
    const { error: employeeError } = await supabase
      .from('employee_contacts')
      .insert({
        id: employeeId,
        user_id: user.id,
        company_id: companyId,
        name: fullName,
        title: jobTitle || 'Professional',
        location: location || 'Unknown',
        linkedinUrl: '',
        relevanceScore: 'Perfect Contact',
        source: 'Direct Input',
        created_at: new Date().toISOString(),
      });

    if (employeeError) {
      console.error('❌ Error creating employee:', employeeError);
      return NextResponse.json({ error: 'Failed to create employee' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      company: {
        id: companyId,
        name: companyName,
        description: 'Company added via direct input',
        location: location || 'Unknown',
        relevanceScore: 'Good Match',
        estimatedEmployees: '',
        logoUrl: '',
        url: '',
        source: 'Direct Input'
      },
      employee: {
        id: employeeId,
        name: fullName,
        title: jobTitle || 'Professional',
        location: location || 'Unknown',
        relevanceScore: 'Perfect Contact',
        linkedinUrl: '',
        source: 'Direct Input'
      }
    });

  } catch (error) {
    console.error('❌ Direct input error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}