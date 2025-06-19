/**
 * Email Content Generation Service
 * Uses OpenAI Standard to create personalized email content
 */

import { openai } from '@/lib/openai';
import { OPENAI_PROMPTS, OPENAI_CONFIG } from '@/constants/prompts';
import { parseEmailContent } from '@/lib/openai/utils';
import { EmailContent } from '@/lib/openai/types';
import type { SupabaseClient } from '@supabase/supabase-js';

// Types for email generation
export interface EmailGenerationParams {
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
}

export interface CreditCheckResult {
  canGenerate: boolean;
  creditsUsed: number;
  plan: string;
  isAtLimit: boolean;
}

/**
 * Generate email content using OpenAI Standard Generation (Chat Completions)
 * This creates personalized email content without web search
 */
export async function generateEmailContent(
  params: EmailGenerationParams
): Promise<EmailContent> {
  try {
    console.log('✍️ Generating email content for:', params);

    if (!openai) {
      throw new Error('OpenAI client not initialized');
    }

    const prompt = OPENAI_PROMPTS.EMAIL_CONTENT_GENERATION(params);

    // Use standard chat completion for email content generation
    const completion = await openai.chat.completions.create({
      model: OPENAI_CONFIG.MODELS.STANDARD,
      messages: [
        {
          role: 'system',
          content: 'You are a professional job search coach helping students and early-career professionals.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: OPENAI_CONFIG.TEMPERATURE.CREATIVE,
      max_tokens: OPENAI_CONFIG.MAX_TOKENS.MEDIUM,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    console.log('📝 Raw email content:', content);

    // Parse subject and body from the response
    const parsedContent = parseEmailContent(content);
    
    const emailContent: EmailContent = {
      subject: parsedContent.subject,
      body: parsedContent.body,
      emailType: params.emailType,
      language: params.language,
    };

    console.log('✅ Generated email content:', emailContent);
    return emailContent;

  } catch (error) {
    console.error('❌ Error generating email content:', error);
    throw new Error(`Failed to generate email content: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Check user's credit status
 */
export async function checkUserCredits(userId: string, supabase: SupabaseClient): Promise<CreditCheckResult> {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('email_credits, plan')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('❌ Error checking user credits:', error);
      throw new Error('Failed to check user credits');
    }

    const creditsUsed = user.email_credits || 0;
    const plan = user.plan || 'freemium';
    const isAtLimit = plan === 'freemium' && creditsUsed >= 5;

    return {
      canGenerate: plan === 'premium' || creditsUsed < 5,
      creditsUsed,
      plan,
      isAtLimit,
    };

  } catch (error) {
    console.error('❌ Error checking credits:', error);
    throw error;
  }
}

/**
 * Increment user's email credits
 */
export async function incrementUserCredits(userId: string, supabase: SupabaseClient): Promise<void> {
  try {
    // Get current credits
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('email_credits')
      .eq('id', userId)
      .single();

    if (fetchError) {
      console.error('❌ Error fetching user credits:', fetchError);
      throw new Error('Failed to fetch user credits');
    }

    const currentCredits = user.email_credits || 0;
    
    // Increment credits
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        email_credits: currentCredits + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      console.error('❌ Error updating user credits:', updateError);
      throw new Error('Failed to update user credits');
    }

    console.log('✅ Incremented user credits:', { userId, newCredits: currentCredits + 1 });

  } catch (error) {
    console.error('❌ Error incrementing credits:', error);
    throw error;
  }
}

/**
 * Save email generation to database
 */
export async function saveEmailGeneration(
  userId: string,
  companyId: string,
  employeeId: string,
  emailAddress: string,
  confidenceScore: number,
  emailType: string,
  supabase: SupabaseClient,
  generatedEmail?: string,
  generatedSubject?: string
): Promise<string> {
  try {
    const emailGenerationId = crypto.randomUUID();
    
    const { error } = await supabase
      .from('email_generation')
      .insert({
        id: emailGenerationId,
        user_id: userId,
        company_id: companyId,
        employee_id: employeeId,
        emailAddress: emailAddress,
        confidenceScore: Math.round(confidenceScore * 100),
        emailType: emailType,
        generatedEmail: generatedEmail,
        generatedSubject: generatedSubject,
        status: 'pending',
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error('❌ Error saving email generation:', error);
      throw new Error('Failed to save email generation');
    }

    console.log('✅ Saved email generation:', emailGenerationId);
    return emailGenerationId;

  } catch (error) {
    console.error('❌ Error saving email generation:', error);
    throw error;
  }
}