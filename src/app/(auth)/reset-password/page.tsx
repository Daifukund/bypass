'use client';

import { useState, useEffect } from 'react';
import { useSupabase } from '@/components/supabase-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Mail } from 'lucide-react';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  const supabase = useSupabase();

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleResetPassword() {
    try {
      setLoading(true);
      setError(null);
      
      if (!email.trim()) {
        throw new Error('Please enter your email address');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        throw new Error('Please enter a valid email address');
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${location.origin}/auth/callback?type=recovery`,
      });

      if (error) {
        // Handle specific error cases
        if (error.message.includes('rate limit')) {
          throw new Error('Too many requests. Please wait a few minutes before trying again.');
        } else {
          throw error;
        }
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while sending reset email');
    } finally {
      setLoading(false);
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && email && !loading && !success) {
      handleResetPassword();
    }
  };

  if (!mounted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Back to Login Link */}
        <div>
          <a
            href="/login"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Login
          </a>
        </div>

        {/* Header */}
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Reset Your Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {success 
              ? "Check your email for reset instructions"
              : "Enter your email address and we'll send you a link to reset your password"
            }
          </p>
        </div>

        {/* Success State */}
        {success ? (
          <div className="mt-8 space-y-6">
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-green-400 mr-2" />
                <div className="text-sm text-green-700">
                  <p className="font-medium">Reset email sent!</p>
                  <p className="mt-1">
                    We've sent a password reset link to <strong>{email}</strong>
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-md">
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-2">Next steps:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Check your email inbox (and spam folder)</li>
                  <li>Click the reset link in the email</li>
                  <li>Create a new password</li>
                  <li>Log in with your new password</li>
                </ol>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => {
                  setSuccess(false);
                  setEmail('');
                  setError(null);
                }}
                variant="outline"
                className="w-full"
              >
                Send Another Reset Email
              </Button>

              <Button
                onClick={() => window.location.href = '/login'}
                className="w-full bg-black hover:bg-gray-800"
              >
                Back to Login
              </Button>
            </div>
          </div>
        ) : (
          /* Form State */
          <div className="mt-8 space-y-6">
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            <div className="space-y-4">
              {/* Email Field */}
              <div>
                <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  className="w-full"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <Button
                onClick={handleResetPassword}
                disabled={loading || !email.trim()}
                className="group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Reset Email"}
              </Button>
            </div>

            {/* Links */}
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                Remember your password?{" "}
                <a
                  href="/login"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Sign in here
                </a>
              </p>
              
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <a
                  href="/signup"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Sign up for free
                </a>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}