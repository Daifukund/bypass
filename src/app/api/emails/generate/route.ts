import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { OPENAI_PROMPTS, OPENAI_CONFIG } from '@/constants/prompts';

// Replace the fixFrenchEncoding function with this more comprehensive one:
function fixFrenchEncoding(text: string): string {
  if (!text) return text;
  
  console.log('🔧 Before encoding fix:', text);
  
  let fixed = text;
  
  // Apply fixes multiple times to catch nested issues
  for (let i = 0; i < 3; i++) {
    fixed = fixed
      // Core French characters
      .replace(/Ã©/g, 'é')
      .replace(/Ã¨/g, 'è') 
      .replace(/Ã /g, 'à')
      .replace(/Ã¢/g, 'â')
      .replace(/Ã´/g, 'ô')
      .replace(/Ã®/g, 'î')
      .replace(/Ã§/g, 'ç')
      .replace(/Ã¹/g, 'ù')
      .replace(/Ã»/g, 'û')
      .replace(/Ã«/g, 'ë')
      .replace(/Ã¯/g, 'ï')
      .replace(/Ã¼/g, 'ü')
      .replace(/Ã¶/g, 'ö')
      .replace(/Ã¡/g, 'á')
      .replace(/Ã³/g, 'ó')
      .replace(/Ã­/g, 'í')
      .replace(/Ãº/g, 'ú')
      .replace(/Ã±/g, 'ñ')
      
      // Uppercase variants
      .replace(/Ã‰/g, 'É')
      .replace(/Ã€/g, 'À')
      .replace(/Ã‡/g, 'Ç')
      .replace(/Ãˆ/g, 'È')
      .replace(/ÃŠ/g, 'Ê')
      .replace(/Ã‹/g, 'Ë')
      .replace(/ÃŽ/g, 'Î')
      .replace(/Ã"/g, 'Ô')
      .replace(/Ã™/g, 'Ù')
      .replace(/Ã›/g, 'Û')
      
      // Common problematic sequences
      .replace(/Ã\u0080/g, 'À')
      .replace(/Ã\u0081/g, 'Á')
      .replace(/Ã\u0082/g, 'Â')
      .replace(/Ã\u0083/g, 'Ã')
      .replace(/Ã\u0084/g, 'Ä')
      .replace(/Ã\u0085/g, 'Å')
      .replace(/Ã\u0086/g, 'Æ')
      .replace(/Ã\u0087/g, 'Ç')
      .replace(/Ã\u0088/g, 'È')
      .replace(/Ã\u0089/g, 'É')
      .replace(/Ã\u008A/g, 'Ê')
      .replace(/Ã\u008B/g, 'Ë')
      .replace(/Ã\u008C/g, 'Ì')
      .replace(/Ã\u008D/g, 'Í')
      .replace(/Ã\u008E/g, 'Î')
      .replace(/Ã\u008F/g, 'Ï')
      .replace(/Ã\u0090/g, 'Ð')
      .replace(/Ã\u0091/g, 'Ñ')
      .replace(/Ã\u0092/g, 'Ò')
      .replace(/Ã\u0093/g, 'Ó')
      .replace(/Ã\u0094/g, 'Ô')
      .replace(/Ã\u0095/g, 'Õ')
      .replace(/Ã\u0096/g, 'Ö')
      .replace(/Ã\u0097/g, '×')
      .replace(/Ã\u0098/g, 'Ø')
      .replace(/Ã\u0099/g, 'Ù')
      .replace(/Ã\u009A/g, 'Ú')
      .replace(/Ã\u009B/g, 'Û')
      .replace(/Ã\u009C/g, 'Ü')
      .replace(/Ã\u009D/g, 'Ý')
      .replace(/Ã\u009E/g, 'Þ')
      .replace(/Ã\u009F/g, 'ß')
      .replace(/Ã\u00A0/g, 'à')
      .replace(/Ã\u00A1/g, 'á')
      .replace(/Ã\u00A2/g, 'â')
      .replace(/Ã\u00A3/g, 'ã')
      .replace(/Ã\u00A4/g, 'ä')
      .replace(/Ã\u00A5/g, 'å')
      .replace(/Ã\u00A6/g, 'æ')
      .replace(/Ã\u00A7/g, 'ç')
      .replace(/Ã\u00A8/g, 'è')
      .replace(/Ã\u00A9/g, 'é')
      .replace(/Ã\u00AA/g, 'ê')
      .replace(/Ã\u00AB/g, 'ë')
      .replace(/Ã\u00AC/g, 'ì')
      .replace(/Ã\u00AD/g, 'í')
      .replace(/Ã\u00AE/g, 'î')
      .replace(/Ã\u00AF/g, 'ï')
      .replace(/Ã\u00B0/g, 'ð')
      .replace(/Ã\u00B1/g, 'ñ')
      .replace(/Ã\u00B2/g, 'ò')
      .replace(/Ã\u00B3/g, 'ó')
      .replace(/Ã\u00B4/g, 'ô')
      .replace(/Ã\u00B5/g, 'õ')
      .replace(/Ã\u00B6/g, 'ö')
      .replace(/Ã\u00B7/g, '÷')
      .replace(/Ã\u00B8/g, 'ø')
      .replace(/Ã\u00B9/g, 'ù')
      .replace(/Ã\u00BA/g, 'ú')
      .replace(/Ã\u00BB/g, 'û')
      .replace(/Ã\u00BC/g, 'ü')
      .replace(/Ã\u00BD/g, 'ý')
      .replace(/Ã\u00BE/g, 'þ')
      .replace(/Ã\u00BF/g, 'ÿ');
  }
  
  console.log('🔧 After encoding fix:', fixed);
  return fixed;
}

// Also, let's try a different approach - add this alternative function:
function fixEncodingWithBuffer(text: string): string {
  if (!text) return text;
  
  try {
    // Convert the string to bytes assuming it's been incorrectly decoded as latin1
    const bytes = new Uint8Array(text.length);
    for (let i = 0; i < text.length; i++) {
      bytes[i] = text.charCodeAt(i) & 0xFF;
    }
    
    // Decode as UTF-8
    const decoder = new TextDecoder('utf-8', { fatal: false });
    const corrected = decoder.decode(bytes);
    
    // If the corrected version has fewer encoding artifacts, use it
    if (corrected.includes('Ã') < text.includes('Ã')) {
      return corrected;
    }
  } catch (error) {
    console.warn('Buffer encoding fix failed:', error);
  }
  
  return text;
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

// Map frontend email types to database values
function mapEmailType(frontendType: string): string {
  const typeMap: { [key: string]: string } = {
    'networking': 'networking',
    'coffee_chat': 'coffee_chat',
    'cold_application': 'cold_application',
    'referral': 'referral',
  };
  
  return typeMap[frontendType] || 'networking';
}

// Simplified approach - use the existing EMAIL_CONTENT_GENERATION prompt
async function generateEmailContent(params: {
  contactName: string;
  jobTitle: string;
  companyName: string;
  location?: string;
  emailType: string;
  language: string;
  userProfile?: {
    firstName?: string;
    lastName?: string;
    university?: string;
    studyLevel?: string;
    fieldOfStudy?: string;
    phone?: string;
    linkedin?: string;
  };
}): Promise<{ subject: string; body: string }> {
  try {
    const { openai } = await import('@/lib/openai/client');
    
    if (!openai) {
      throw new Error('OpenAI client not initialized');
    }

    const prompt = OPENAI_PROMPTS.EMAIL_CONTENT_GENERATION(params);

    const completion = await openai.chat.completions.create({
      model: OPENAI_CONFIG.MODELS.STANDARD,
      messages: [
        {
          role: 'system',
          content: `You are a professional job search coach. Write emails in ${params.language} language. Use proper formatting and professional tone. Format as: Subject: [subject]\n\n[body]`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: OPENAI_CONFIG.TEMPERATURE.CREATIVE,
      max_tokens: OPENAI_CONFIG.MAX_TOKENS.MEDIUM,
    });

    const content = completion.choices[0]?.message?.content?.trim() || '';

    // Parse the response
    let subject = '';
    let body = '';

    if (content.includes('Subject:')) {
      const lines = content.split('\n');
      const subjectLine = lines.find(line => line.toLowerCase().startsWith('subject:'));
      if (subjectLine) {
        subject = subjectLine.replace(/^subject:\s*/i, '').trim();
      }
      
      const subjectIndex = lines.findIndex(line => line.toLowerCase().startsWith('subject:'));
      if (subjectIndex >= 0) {
        const bodyLines = lines.slice(subjectIndex + 1).filter(line => line.trim() !== '');
        body = bodyLines.join('\n').trim();
      }
    } else {
      subject = getLanguageSpecificFallback(params.language, 'subject');
      body = content;
    }

    // Language-aware fallbacks
    if (!subject || subject.length < 5) {
      subject = getLanguageSpecificFallback(params.language, 'subject');
    }

    if (!body || body.length < 20) {
      const senderName = params.userProfile?.firstName && params.userProfile?.lastName 
        ? `${params.userProfile.firstName} ${params.userProfile.lastName}` 
        : 'Student';
        
      body = getLanguageSpecificFallback(params.language, 'body', {
        senderName,
        contactName: params.contactName,
        companyName: params.companyName,
        studyLevel: params.userProfile?.studyLevel || 'student',
        fieldOfStudy: params.userProfile?.fieldOfStudy || 'Finance',
        university: params.userProfile?.university || 'my university'
      });
    }

    return { subject, body };

  } catch (error) {
    console.error('❌ Error generating email content:', error);
    throw error;
  }
}

// Add this helper function:
function getLanguageSpecificFallback(language: string, type: 'subject' | 'body', params?: any): string {
  const lang = language.toLowerCase();
  
  if (type === 'subject') {
    switch (lang) {
      case 'french':
      case 'français':
        return 'Demande d\'échange professionnel';
      case 'german':
      case 'deutsch':
        return 'Anfrage für beruflichen Austausch';
      case 'spanish':
      case 'español':
        return 'Solicitud de intercambio profesional';
      case 'italian':
      case 'italiano':
        return 'Richiesta di scambio professionale';
      case 'portuguese':
      case 'português':
        return 'Solicitação de intercâmbio profissional';
      default:
        return 'Request for professional exchange';
    }
  } else { // body
    if (!params) return '';
    
    switch (lang) {
      case 'french':
      case 'français':
        return `Bonjour ${params.contactName},

Je m'appelle ${params.senderName}, ${params.studyLevel} en ${params.fieldOfStudy} à ${params.university}. Je suis très intéressé par votre parcours chez ${params.companyName}.

Seriez-vous disponible pour un échange de 15 minutes ?

Cordialement,
${params.senderName}`;
      
      case 'german':
      case 'deutsch':
        return `Hallo ${params.contactName},

mein Name ist ${params.senderName}, ${params.studyLevel} in ${params.fieldOfStudy} an der ${params.university}. Ich bin sehr interessiert an Ihrem Werdegang bei ${params.companyName}.

Wären Sie für einen 15-minütigen Austausch verfügbar?

Mit freundlichen Grüßen,
${params.senderName}`;
      
      case 'spanish':
      case 'español':
        return `Hola ${params.contactName},

Mi nombre es ${params.senderName}, ${params.studyLevel} en ${params.fieldOfStudy} en ${params.university}. Estoy muy interesado en su trayectoria en ${params.companyName}.

¿Estaría disponible para un intercambio de 15 minutos?

Saludos cordiales,
${params.senderName}`;
      
      default: // English
        return `Hello ${params.contactName},

My name is ${params.senderName}, a ${params.studyLevel} in ${params.fieldOfStudy} at ${params.university}. I am very interested in your career path at ${params.companyName}.

Would you be available for a 15-minute exchange?

Best regards,
${params.senderName}`;
    }
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
    const { contactName, jobTitle, companyName, location, emailType, language, companyId, employeeId } = body;
    
    // Validate required fields
    if (!contactName || !jobTitle || !companyName || !emailType) {
      return NextResponse.json(
        { error: 'Contact name, job title, company name, and email type are required' }, 
        { status: 400 }
      );
    }

    // Fetch user profile for personalization
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('first_name, last_name, university, study_level, field_of_study, phone, linkedin')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('❌ Error fetching user profile:', profileError);
    }

    // Add this right after fetching the user profile:
    console.log('👤 User profile data:', {
      first_name: userProfile?.first_name,
      last_name: userProfile?.last_name,
      university: userProfile?.university,
      study_level: userProfile?.study_level,
      field_of_study: userProfile?.field_of_study,
      phone: userProfile?.phone,
      linkedin: userProfile?.linkedin
    });

    // Map email type to database format
    const mappedEmailType = mapEmailType(emailType);

    // Check user plan and credits
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
    const plan = userData.plan || 'freemium';

    let creditResult;
    if (plan === 'premium') {
      creditResult = {
        success: true,
        newCreditsUsed: emailCreditsUsed,
        creditsRemaining: Infinity,
      };
    } else {
      creditResult = {
        success: true,
        newCreditsUsed: emailCreditsUsed,
        creditsRemaining: Math.max(0, 5 - emailCreditsUsed),
      };
    }

    // Replace the existing query with this more flexible one:
    const { data: existingEmailRecord, error: findError } = await supabase
      .from('email_generation')
      .select('id, emailAddress, generatedEmail')
      .eq('user_id', user.id)
      .eq('company_id', companyId)
      .eq('employee_id', employeeId)
      .not('emailAddress', 'is', null) // Must have email address
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(); // Use maybeSingle() instead of single()

    if (!existingEmailRecord) {
      console.error('❌ No email address record found. Generate email address first.');
      return NextResponse.json({ 
        error: 'Email address must be generated first' 
      }, { status: 400 });
    }

    // Log what we found
    console.log('📧 Found existing email record:', {
      id: existingEmailRecord.id,
      hasEmailAddress: !!existingEmailRecord.emailAddress,
      hasGeneratedContent: !!existingEmailRecord.generatedEmail
    });

    // And log the mapped data:
    const mappedUserProfile = userProfile ? {
      firstName: userProfile.first_name,
      lastName: userProfile.last_name,
      university: userProfile.university,
      studyLevel: userProfile.study_level,
      fieldOfStudy: userProfile.field_of_study,
      phone: userProfile.phone,
      linkedin: userProfile.linkedin,
    } : undefined;

    console.log('🗂️ Mapped user profile:', mappedUserProfile);

    // Generate the email content
    const emailContent = await generateEmailContent({
      contactName,
      jobTitle,
      companyName,
      location,
      emailType: mappedEmailType,
      language,
      userProfile: mappedUserProfile
    });

    // UPDATE the existing record instead of inserting
    const { data: updatedRecord, error: updateError } = await supabase
      .from('email_generation')
      .update({
        emailType: mappedEmailType,
        generatedEmail: emailContent.body,
        generatedSubject: emailContent.subject,
        status: 'pending'
      })
      .eq('id', existingEmailRecord.id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error updating email record:', updateError);
      return NextResponse.json({ error: 'Failed to save email content' }, { status: 500 });
    }

    console.log('✅ Email content updated successfully');

    // ✅ FIX: Return the correct structure that frontend expects
    return NextResponse.json({
      success: true,
      subject: emailContent.subject,     // ← Direct properties
      body: emailContent.body,           // ← Direct properties
      email: updatedRecord,              // ← Keep for backward compatibility
      emailType: mappedEmailType,
      language: language
    });

  } catch (error) {
    console.error('❌ Email generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}