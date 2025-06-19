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

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { emailId, status } = await req.json();
    
    if (!emailId || !status) {
      return NextResponse.json({ error: 'Email ID and status are required' }, { status: 400 });
    }

    if (!['pending', 'sent', 'failed'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    console.log('🔄 Updating email status:', { emailId, status, userId: user.id });

    // Update the email status, but only for emails belonging to this user
    const { data: updatedEmail, error: updateError } = await supabase
      .from('email_generation')
      .update({ status })
      .eq('id', emailId)
      .eq('user_id', user.id) // Security: only update user's own emails
      .select('id, status')
      .single();

    if (updateError) {
      console.error('❌ Error updating email status:', updateError);
      return NextResponse.json({ error: 'Failed to update email status' }, { status: 500 });
    }

    if (!updatedEmail) {
      return NextResponse.json({ error: 'Email not found or access denied' }, { status: 404 });
    }

    console.log('✅ Email status updated successfully:', updatedEmail);

    return NextResponse.json({ 
      success: true, 
      email: updatedEmail 
    });

  } catch (error) {
    console.error('❌ API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}