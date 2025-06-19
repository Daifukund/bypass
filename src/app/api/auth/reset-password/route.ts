import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Rate limiting (simple in-memory store - use Redis in production)
const resetAttempts = new Map<string, { count: number; lastAttempt: number }>();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 3;

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

// Check rate limiting
function checkRateLimit(email: string): { allowed: boolean; remainingAttempts: number } {
  const now = Date.now();
  const attempts = resetAttempts.get(email);
  
  if (!attempts) {
    resetAttempts.set(email, { count: 1, lastAttempt: now });
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS - 1 };
  }
  
  // Reset if window has passed
  if (now - attempts.lastAttempt > RATE_LIMIT_WINDOW) {
    resetAttempts.set(email, { count: 1, lastAttempt: now });
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS - 1 };
  }
  
  // Check if limit exceeded
  if (attempts.count >= MAX_ATTEMPTS) {
    return { allowed: false, remainingAttempts: 0 };
  }
  
  // Increment attempts
  resetAttempts.set(email, { count: attempts.count + 1, lastAttempt: now });
  return { allowed: true, remainingAttempts: MAX_ATTEMPTS - attempts.count - 1 };
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await req.json();
    const { email } = body;
    
    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ 
        error: 'Email is required' 
      }, { status: 400 });
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({ 
        error: 'Invalid email format' 
      }, { status: 400 });
    }
    
    // Check rate limiting
    const rateLimit = checkRateLimit(email.toLowerCase());
    if (!rateLimit.allowed) {
      return NextResponse.json({ 
        error: 'Too many reset attempts. Please wait 15 minutes before trying again.',
        rateLimited: true
      }, { status: 429 });
    }
    
    // Send reset email
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?type=recovery`,
    });
    
    if (error) {
      console.error('Reset password error:', error);
      
      // Don't reveal if email exists or not for security
      // Always return success to prevent email enumeration
    }
    
    // Log the attempt (you can enhance this with proper logging)
    console.log(`Password reset requested for: ${email}`);
    
    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, we have sent a password reset link.',
      remainingAttempts: rateLimit.remainingAttempts
    });
    
  } catch (error) {
    console.error('Error in reset password API:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}