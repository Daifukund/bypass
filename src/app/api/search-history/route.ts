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

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔍 Fetching email history for user:', user.id);

    // First, let's just get the email_generation records
    const { data: emailRecords, error: emailError } = await supabase
      .from('email_generation')
      .select('*')
      .eq('user_id', user.id)
      .not('emailAddress', 'is', null)
      .order('created_at', { ascending: false })
      .limit(20);

    console.log('📊 Email records:', { emailRecords, emailError });

    if (emailError) {
      console.error('Error fetching email records:', emailError);
      return NextResponse.json({ error: 'Failed to fetch email records' }, { status: 500 });
    }

    if (!emailRecords || emailRecords.length === 0) {
      console.log('ℹ️ No email records found');
      return NextResponse.json({ 
        searchHistory: [],
        total: 0 
      });
    }

    // Now get company and employee info separately
    const searchHistory = await Promise.all(
      emailRecords.map(async (record) => {
        let companyName = 'Unknown Company';
        let contactName = 'Unknown Contact';
        let contactTitle = '';

        // Get company info if company_id exists
        if (record.company_id) {
          const { data: company } = await supabase
            .from('company_suggestions')
            .select('name')
            .eq('id', record.company_id)
            .single();
          
          if (company) {
            companyName = company.name;
          }
        }

        // Get employee info if employee_id exists
        if (record.employee_id) {
          const { data: employee } = await supabase
            .from('employee_contacts')
            .select('name, title')
            .eq('id', record.employee_id)
            .single();
          
          if (employee) {
            contactName = employee.name;
            contactTitle = employee.title || '';
          }
        }

        return {
          id: record.id,
          company: companyName,
          contact: contactName,
          contact_title: contactTitle,
          email: record.emailAddress,
          date: record.created_at,
          status: record.status === 'sent' ? 'Email sent' : 'Not sent'
        };
      })
    );

    console.log('✅ Final search history:', searchHistory);

    return NextResponse.json({ 
      searchHistory,
      total: searchHistory.length 
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}