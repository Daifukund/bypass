import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { OPENAI_PROMPTS, SYSTEM_PROMPTS, OPENAI_CONFIG } from '@/constants/prompts';

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

// Generate email address using OpenAI with centralized prompts
async function generateEmailAddress(
  fullName: string, 
  companyName: string, 
  jobTitle?: string, 
  location?: string
): Promise<{ email: string; confidence_score: number }> {
  try {
    console.log('📧 Generating email address for:', { fullName, companyName, jobTitle, location });

    // Import OpenAI here to avoid module issues
    const { openai } = await import('@/lib/openai/client');
    
    if (!openai) {
      throw new Error('OpenAI client not initialized');
    }

    // Use centralized prompt from prompts.ts
    const prompt = OPENAI_PROMPTS.EMAIL_ADDRESS_GENERATION(fullName, companyName, jobTitle, location);

    const completion = await openai.chat.completions.create({
      model: OPENAI_CONFIG.MODELS.STANDARD,
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPTS.JSON_OBJECT_ONLY
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: OPENAI_CONFIG.TEMPERATURE.FACTUAL,
      max_tokens: OPENAI_CONFIG.MAX_TOKENS.SHORT,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    console.log('📝 Raw email response:', content);

    // Parse JSON response
    try {
      let jsonContent = content;
      
      // ✅ Remove markdown code blocks if present
      if (content.includes('```json')) {
        const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          jsonContent = jsonMatch[1];
        }
      } else if (content.includes('```')) {
        const codeMatch = content.match(/```\s*([\s\S]*?)\s*```/);
        if (codeMatch) {
          jsonContent = codeMatch[1];
        }
      }
      
      const parsed = JSON.parse(jsonContent.trim());
      
      // ✅ Handle both naming conventions
      const email = parsed.email;
      const confidenceScore = parsed.confidenceScore || parsed.confidence_score;
      
      if (!email || typeof confidenceScore !== 'number') {
        throw new Error('Invalid response format');
      }
      
      return {
        email: email,
        confidence_score: Math.min(Math.max(confidenceScore, 0), 1) // Clamp between 0 and 1
      };
    } catch (parseError) {
      console.error('❌ Failed to parse OpenAI response:', parseError);
      
      // Fallback: try to extract email manually
      const emailMatch = content.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
      if (emailMatch) {
        return {
          email: emailMatch[1],
          confidence_score: 0.5 // Lower confidence for fallback
        };
      }
      
      throw new Error('Could not extract email from response');
    }

  } catch (error) {
    console.error('❌ Error generating email address:', error);
    throw new Error(`Failed to generate email address: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

    console.log('🔐 Authenticated user:', user.id);

    const body = await req.json();
    const { fullName, companyName, companyId, employeeId, jobTitle, location } = body;
    
    // ✅ ADD DEBUG LOGGING HERE
    console.log('📋 Received IDs:', {
      companyId: companyId,
      companyIdType: typeof companyId,
      employeeId: employeeId,
      employeeIdType: typeof employeeId,
      companyIdLength: companyId?.length,
      employeeIdLength: employeeId?.length
    });
    
    // Validate required fields
    if (!fullName || !companyName) {
      return NextResponse.json(
        { error: 'Full name and company name are required' }, 
        { status: 400 }
      );
    }

    console.log('📧 Generating email address for:', { fullName, companyName, jobTitle, location });

    // Check user plan and credits - AUTO-CREATE SUBSCRIPTION VERSION
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('email_credits, plan')
      .eq('id', user.id)
      .single();

    if (userError) {
      console.error('❌ Error fetching user data:', userError);
      return NextResponse.json({ error: 'Failed to check user credits' }, { status: 500 });
    }

    const emailCreditsUsed = userData.email_credits || 0;
    let isPremium = userData.plan === 'premium';

    // ✅ If user is premium but no active subscription exists, create one
    if (isPremium) {
      const { data: existingSubscription } = await supabase
        .from('subscriptions')
        .select('id, status')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();
        
      if (!existingSubscription) {
        console.log('🔄 Premium user without subscription - creating active subscription');
        
        // Create active subscription
        const { error: subscriptionError } = await supabase
          .from('subscriptions')
          .insert({
            id: crypto.randomUUID(),
            user_id: user.id,
            plan: 'premium',
            status: 'active',
            startedAt: new Date().toISOString(),
            expiresAt: null,
            stripeCustomerId: null,
            stripeSubscriptionId: null,
            created_at: new Date().toISOString(),
          });
          
        if (subscriptionError) {
          console.error('❌ Failed to create subscription:', subscriptionError);
        } else {
          console.log('✅ Active subscription created for premium user');
        }
      }
    }

    console.log('📊 User plan and credits:', { 
      isPremium, 
      emailCreditsUsed, 
      userPlan: userData.plan,
      rawUserData: userData 
    });

    if (userData.plan === 'premium') {
      console.log('✅ User has premium plan in database');
    } else {
      console.log('❌ User does not have premium plan. Current plan:', userData.plan);
    }

    let creditResult;

    // If premium, allow unlimited generation
    if (isPremium) {
      console.log('✅ Premium user - unlimited credits');
      creditResult = {
        success: true,
        newCreditsUsed: emailCreditsUsed,
        creditsRemaining: Infinity,
      };
    } else if (emailCreditsUsed >= 5) {
      // Freemium user at limit
      console.log('❌ Freemium user at credit limit');
      return NextResponse.json(
        { 
          error: 'You have used all 5 free email generations. Upgrade to Premium for unlimited access.',
          creditsUsed: emailCreditsUsed,
          creditsRemaining: 0,
          upgradeRequired: true
        }, 
        { status: 402 }
      );
    } else {
      // Freemium user with credits remaining - deduct credit
      console.log('💳 Deducting credit for freemium user');
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          email_credits: emailCreditsUsed + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('❌ Error updating credits:', updateError);
        return NextResponse.json({ error: 'Failed to deduct credit' }, { status: 500 });
      }

      creditResult = {
        success: true,
        newCreditsUsed: emailCreditsUsed + 1,
        creditsRemaining: Math.max(0, 5 - (emailCreditsUsed + 1)),
      };
    }

    console.log('✅ Credit check passed. Remaining:', creditResult.creditsRemaining);

    // Generate email address with additional context
    let emailData: { email: string; confidence_score: number };
    try {
      emailData = await generateEmailAddress(fullName, companyName, jobTitle, location);
    } catch (openaiError) {
      console.error('❌ OpenAI generation failed:', openaiError);
      
      // If OpenAI fails, refund the credit for freemium users
      if (isPremium) {
        console.log('🔄 Refunding credit due to generation failure...');
        await supabase
          .from('users')
          .update({ 
            email_credits: Math.max(0, creditResult.newCreditsUsed - 1),
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);
      }
      
      return NextResponse.json(
        { error: 'AI service temporarily unavailable. Please try again.' },
        { status: 503 }
      );
    }

    console.log('✅ Email address generated successfully:', emailData);

    // ✅ IMPROVED UUID VALIDATION AND LOGGING
    const isValidUUID = (id: string | undefined | null): boolean => {
      if (!id || typeof id !== 'string') return false;
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      return uuidRegex.test(id);
    };

    const validCompanyId = isValidUUID(companyId) ? companyId : null;
    const validEmployeeId = isValidUUID(employeeId) ? employeeId : null;

    console.log('🔍 UUID Validation Results:', {
      companyId: companyId,
      validCompanyId: validCompanyId,
      companyIdValid: isValidUUID(companyId),
      employeeId: employeeId,
      validEmployeeId: validEmployeeId,
      employeeIdValid: isValidUUID(employeeId)
    });

    // Check if an email address was already generated for this combination
    const { data: existingEmail, error: checkError } = await supabase
      .from('email_generation')
      .select('id, emailAddress, created_at')
      .eq('user_id', user.id)
      .eq('company_id', validCompanyId)
      .eq('employee_id', validEmployeeId)
      .not('emailAddress', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingEmail) {
      // Check if it was created very recently (within last 10 seconds)
      const existingTime = new Date(existingEmail.created_at).getTime();
      const currentTime = new Date().getTime();
      const timeDiff = currentTime - existingTime;
      
      if (timeDiff < 10000) { // Less than 10 seconds ago
        console.log('🔄 Duplicate request detected, returning existing email:', existingEmail.emailAddress);
        return NextResponse.json({
          success: true,
          email: existingEmail.emailAddress,
          confidence_score: 85, // Default confidence
          creditsUsed: creditResult.newCreditsUsed,
          creditsRemaining: creditResult.creditsRemaining,
          id: existingEmail.id,
          message: 'Email address already generated'
        });
      }
    }

    // Save to database with actual IDs
    const emailGenerationData = {
      id: crypto.randomUUID(),
      user_id: user.id,
      company_id: validCompanyId,
      employee_id: validEmployeeId,
      emailAddress: emailData.email,
      confidenceScore: Math.round(emailData.confidence_score * 100),
      emailType: null,
      generatedEmail: null,
      generatedSubject: null,
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    console.log('💾 Inserting email generation to database:', emailGenerationData);

    const { error: saveError } = await supabase
      .from('email_generation')
      .insert(emailGenerationData);

    if (saveError) {
      console.error('❌ Email generation save error:', saveError);
      return NextResponse.json({ error: 'Failed to save email generation' }, { status: 500 });
    }

    console.log('✅ Email generation saved to database successfully');

    // Return response
    return NextResponse.json({
      success: true,
      email: emailData.email,
      confidence_score: Math.round(emailData.confidence_score * 100),
      creditsUsed: creditResult.newCreditsUsed,
      creditsRemaining: creditResult.creditsRemaining,
      id: emailGenerationData.id,
      message: 'Email address generated successfully'
    });

  } catch (error) {
    console.error('❌ Error in guess-email API:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}