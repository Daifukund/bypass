"use client";

import { useRouter } from 'next/navigation';
import { useSearchStore } from '@/stores/search-store';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Copy, Mail, Send, Check, AlertCircle, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { useSupabase } from '@/components/supabase-provider';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { cleanEmailContent } from '@/lib/utils';
import { useAppStore } from '@/stores/app-store';

interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  email_credits?: number;
  plan?: string;
}

export default function EmailsPage() {
  const { selectedEmployee, selectedCompany, generatedEmail, setGeneratedEmail } = useSearchStore();
  const supabase = useSupabase();
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [emailType, setEmailType] = useState<'networking' | 'cold_application' | 'referral' | 'coffee_chat'>('coffee_chat');
  const [language, setLanguage] = useState<string>('English');
  const [guessedEmail, setGuessedEmail] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [emailCopied, setEmailCopied] = useState(false);
  const [contentCopied, setContentCopied] = useState(false);
  const [creditError, setCreditError] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [isGeneratingEmail, setIsGeneratingEmail] = useState(false);

  // Language options
  const languageOptions = [
    { value: 'English', label: 'English', flag: '🇺🇸' },
    { value: 'French', label: 'Français', flag: '🇫🇷' },
    { value: 'German', label: 'Deutsch', flag: '🇩🇪' },
    { value: 'Spanish', label: 'Español', flag: '🇪🇸' },
    { value: 'Italian', label: 'Italiano', flag: '🇮🇹' },
    { value: 'Portuguese', label: 'Português', flag: '🇵🇹' },
  ];

  // Smart language detection based on company location
  const detectLanguageFromLocation = (location?: string): string => {
    if (!location) return 'English';
    
    const locationLower = location.toLowerCase();
    
    if (locationLower.includes('france') || locationLower.includes('paris') || locationLower.includes('lyon') || locationLower.includes('marseille')) {
      return 'French';
    }
    if (locationLower.includes('germany') || locationLower.includes('berlin') || locationLower.includes('munich') || locationLower.includes('hamburg')) {
      return 'German';
    }
    if (locationLower.includes('spain') || locationLower.includes('madrid') || locationLower.includes('barcelona') || locationLower.includes('valencia')) {
      return 'Spanish';
    }
    if (locationLower.includes('italy') || locationLower.includes('rome') || locationLower.includes('milan') || locationLower.includes('naples')) {
      return 'Italian';
    }
    if (locationLower.includes('portugal') || locationLower.includes('lisbon') || locationLower.includes('porto')) {
      return 'Portuguese';
    }
    
    return 'English'; // Default fallback
  };

  // Auto-detect language when employee/company changes
  useEffect(() => {
    if (selectedEmployee && selectedCompany) {
      const detectedLanguage = detectLanguageFromLocation(selectedEmployee.location || selectedCompany.location);
      setLanguage(detectedLanguage);
    }
  }, [selectedEmployee, selectedCompany]);

  // Handle case where user navigates directly to /emails
  useEffect(() => {
    if (!selectedEmployee || !selectedCompany) {
      router.push('/employees');
      return;
    }
  }, [selectedEmployee, selectedCompany, router]);

  // Get user and profile data
  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          router.push('/login');
          return;
        }

        setUser(user);

        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error fetching profile:', profileError);
        } else if (profileData) {
          setProfile(profileData);
        }
      } catch (error) {
        console.error('Error in getUser:', error);
      }
    };

    getUser();
  }, [supabase, router]);

  // Auto-generate email address when component loads
  useEffect(() => {
    if (selectedEmployee && selectedCompany && !guessedEmail && user) {
      generateEmailAddress();
    }
  }, [selectedEmployee, selectedCompany, guessedEmail, user]);

  const generateEmailAddress = async () => {
    if (!selectedEmployee || !selectedCompany || isGeneratingEmail) return;
    
    setIsGeneratingEmail(true);
    setIsLoading(true);
    setCreditError('');
    
    try {
      const response = await fetch('/api/emails/guess-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: selectedEmployee.name,
          companyName: selectedCompany.name,
          companyId: selectedCompany.id,
          employeeId: selectedEmployee.id,
          jobTitle: selectedEmployee.title,
          location: selectedEmployee.location,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setGuessedEmail(result.email);
        setConfidence(result.confidence_score);
        
        // ✅ Refresh global store credits from database
        const { refreshCreditsAfterOperation } = useAppStore.getState();
        await refreshCreditsAfterOperation(supabase);
        
        // Refresh local profile
        if (result.creditsUsed !== undefined && user) {
          const { data: updatedProfile } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();
          if (updatedProfile) {
            setProfile(updatedProfile);
          }
        }
      } else if (response.status === 402) {
        // Credit limit reached
        setCreditError(result.message || 'You have reached your credit limit');
      } else {
        console.error('Failed to generate email address:', result.error);
        setCreditError('Failed to generate email address. Please try again.');
      }
    } catch (error) {
      console.error('Error generating email:', error);
      setCreditError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
      setIsGeneratingEmail(false);
    }
  };

  // Update the generateEmailContent function:
  const generateEmailContent = async () => {
    if (!selectedEmployee || !selectedCompany) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/emails/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify({
          contactName: selectedEmployee.name,
          jobTitle: selectedEmployee.title,
          companyName: selectedCompany.name,
          location: selectedEmployee.location,
          emailType: emailType,
          language: language,
          companyId: selectedCompany.id,
          employeeId: selectedEmployee.id,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Email generation result:', result);
        
        // Store subject and body separately instead of trying to fix encoding
        if (result.subject && result.body) {
          setEmailSubject(result.subject);
          setEmailBody(result.body);
          
          // Combine for display in textarea
          const displayEmail = `Subject: ${result.subject}\n\n${result.body}`;
          setGeneratedEmail(displayEmail);
          
          console.log('📧 Email content set:', { 
            subject: result.subject, 
            body: result.body.substring(0, 50) + '...' 
          });
        }
      } else {
        const errorData = await response.json();
        console.error('❌ Email generation failed:', errorData);
      }
    } catch (error) {
      console.error('❌ Error generating email:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, type: 'email' | 'content') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'email') {
        setEmailCopied(true);
        setTimeout(() => setEmailCopied(false), 2000);
      } else {
        setContentCopied(true);
        setTimeout(() => setContentCopied(false), 2000);
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };
  
  const createMailtoLink = () => {
    if (!guessedEmail) return '#';
    
    let subject = emailSubject;
    let body = emailBody;
    
    // If we don't have separate subject/body, parse from generatedEmail
    if (!subject || !body) {
      if (generatedEmail.startsWith('Subject:')) {
        const lines = generatedEmail.split('\n');
        subject = lines[0].replace('Subject:', '').trim();
        const bodyStartIndex = lines.findIndex((line, index) => index > 0 && line.trim() !== '');
        body = bodyStartIndex >= 0 ? lines.slice(bodyStartIndex).join('\n').trim() : '';
      } else {
        subject = `Invitation à un échange informel`;
        body = generatedEmail;
      }
    }
    
    // Ensure we have content
    if (!subject.trim()) {
      subject = `Invitation à un échange informel`;
    }
    if (!body.trim()) {
      body = `Bonjour,\n\nJ'aimerais échanger avec vous.\n\nCordialement`;
    }
    
    console.log('📧 Creating mailto with:', { subject, body: body.substring(0, 50) + '...' });
    
    // Simple, clean encoding - only encode once
    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(body);
    
    const mailtoLink = `mailto:${guessedEmail}?subject=${encodedSubject}&body=${encodedBody}`;
    console.log('📧 Final mailto link:', mailtoLink);
    
    return mailtoLink;
  };

  // Add a new function to handle the email sending with better error handling
  const handleSendEmail = (e: React.MouseEvent) => {
    e.preventDefault();
    
    const mailtoLink = createMailtoLink();
    
    if (mailtoLink === '#') {
      alert('Please generate both an email address and email content first.');
      return;
    }
    
    console.log('📧 Opening mailto link:', mailtoLink);
    
    try {
      // Try to open the mailto link
      window.location.href = mailtoLink;
    } catch (error) {
      console.error('❌ Error opening mailto link:', error);
      
      // Get subject and body for fallback
      let subject = emailSubject;
      let body = emailBody;
      
      if (!subject || !body) {
        if (generatedEmail.startsWith('Subject:')) {
          const lines = generatedEmail.split('\n');
          subject = lines[0].replace('Subject:', '').trim();
          const bodyStartIndex = lines.findIndex((line, index) => index > 0 && line.trim() !== '');
          body = bodyStartIndex >= 0 ? lines.slice(bodyStartIndex).join('\n').trim() : '';
        } else {
          subject = `Regarding opportunities at ${selectedCompany?.name}`;
          body = generatedEmail;
        }
      }
      
      // Fallback: copy to clipboard and show instructions
      navigator.clipboard.writeText(`To: ${guessedEmail}\nSubject: ${subject}\n\n${body}`)
        .then(() => {
          alert('Could not open email client. Email details have been copied to clipboard. Please paste into your email client manually.');
        })
        .catch(() => {
          alert(`Could not open email client. Please copy this information manually:\n\nTo: ${guessedEmail}\nSubject: ${subject}\n\n${body}`);
        });
    }
  };

  const getEmailTypeLabel = (type: string) => {
    switch (type) {
      case 'networking': return 'Networking Email';
      case 'coffee_chat': return 'Quick Call Request';
      case 'cold_application': return 'Cold Application';
      case 'referral': return 'Internal Referral Request';
      default: return 'Quick Call Request';
    }
  };

  const getEmailTypeDescription = (type: string) => {
    switch (type) {
      case 'networking': return 'Build a professional relationship and learn about opportunities.';
      case 'coffee_chat': return 'Request a brief informational interview or coffee chat. (Recommended)';
      case 'cold_application': return 'Directly apply for a specific role or express interest.';
      case 'referral': return 'Ask for a referral to open positions at their company.';
      default: return 'Request a brief informational interview or coffee chat. (Recommended)';
    }
  };

  // Add this function to force refresh profile
  const refreshUserProfile = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      } else if (profileData) {
        setProfile(profileData);
        console.log('✅ Profile refreshed:', profileData);
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  }, [user, supabase]);

  // Add this useEffect to refresh profile when component mounts
  useEffect(() => {
    refreshUserProfile();
  }, [refreshUserProfile]);

  if (!selectedEmployee || !selectedCompany || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const maxFreeCredits = 5;
  const emailCreditsUsed = profile?.email_credits || 0;
  const isPremium = profile?.plan === 'premium';
  const creditsRemaining = Math.max(0, maxFreeCredits - emailCreditsUsed);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/employees" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Employees
        </Link>
        <h1 className="text-3xl font-bold">Generate Your Email</h1>
        <p className="text-gray-600 mt-2">
          Contacting <span className="font-medium">{selectedEmployee.name}</span> at{' '}
          <span className="font-medium">{selectedCompany.name}</span>
        </p>
      </div>

      {/* Generate Address Email Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Generate Email Address</h2>
          {!isPremium && (
            <div className="text-sm text-gray-600">
              1 credit will be used • {creditsRemaining} remaining
            </div>
          )}
        </div>
        
        {/* Credit Error Display */}
        {creditError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-red-800 font-medium">Credit Limit Reached</p>
                <p className="text-red-700 text-sm">{creditError}</p>
                <Link href="/upgrade" className="inline-flex items-center mt-2 text-sm text-red-600 hover:text-red-800">
                  <CreditCard className="h-4 w-4 mr-1" />
                  Upgrade to Premium
                </Link>
              </div>
            </div>
          </div>
        )}
        
        {isLoading && !guessedEmail ? (
          <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">Generating email address...</span>
          </div>
        ) : guessedEmail ? (
          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
            <div>
              <p className="font-mono text-lg font-medium text-green-900">{guessedEmail}</p>
              <p className="text-sm text-green-700">
                Confidence score: {confidence}% • Email address generated successfully
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(guessedEmail, 'email')}
              className="flex items-center space-x-2"
            >
              {emailCopied ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copy email</span>
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-600 mb-4">No email address generated yet</p>
            <Button 
              onClick={generateEmailAddress}
              disabled={!isPremium && emailCreditsUsed >= maxFreeCredits || isGeneratingEmail}
            >
              {!isPremium && emailCreditsUsed >= maxFreeCredits 
                ? 'Upgrade to Generate More' 
                : isGeneratingEmail
                ? 'Generating...'
                : 'Generate Email Address'
              }
            </Button>
            {!isPremium && (
              <p className="text-xs text-gray-500 mt-2">
                Uses 1 credit • {creditsRemaining} credits remaining
              </p>
            )}
          </div>
        )}
      </div>

      {/* Email Generator Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Email Content Generator</h2>
          <div className="text-sm text-green-600 font-medium">
            ✨ Free unlimited email content generation
          </div>
        </div>
        
        {/* Choice of email types */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Choose your email type</h3>
          <div className="space-y-3">
            {[
              { value: 'networking', label: 'Networking Email' },
              { value: 'coffee_chat', label: 'Quick Call Request' },
              { value: 'cold_application', label: 'Cold Application' },
              { value: 'referral', label: 'Internal Referral Request' },
            ].map((type) => (
              <label
                key={type.value}
                className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                  emailType === type.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="emailType"
                  value={type.value}
                  checked={emailType === type.value}
                  onChange={(e) => setEmailType(e.target.value as any)}
                  className="mt-1"
                />
                <div>
                  <h4 className="font-medium">{getEmailTypeLabel(type.value)}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {getEmailTypeDescription(type.value)}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Language Selection */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Choose email language</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {languageOptions.map((lang) => (
              <label
                key={lang.value}
                className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                  language === lang.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="language"
                  value={lang.value}
                  checked={language === lang.value}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="sr-only"
                />
                <span className="text-lg">{lang.flag}</span>
                <span className="font-medium">{lang.label}</span>
              </label>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Language auto-detected based on company location. You can change it above.
          </p>
        </div>

        {/* Generate Email Button */}
        <div className="mb-6">
          <Button 
            onClick={generateEmailContent}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? 'Generating Email Content...' : `Generate Email Content in ${language} (Free)`}
          </Button>
          <p className="text-xs text-gray-500 mt-2">
            Email content generation is unlimited and free for all users
          </p>
        </div>

        {/* Text Area editable */}
        {generatedEmail ? (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Email Content (editable)
            </label>
            <textarea
              value={generatedEmail}
              onChange={(e) => setGeneratedEmail(e.target.value)}
              className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Your generated email content will appear here..."
            />
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => copyToClipboard(generatedEmail, 'content')}
              >
                {contentCopied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Email Content
                  </>
                )}
              </Button>
              {guessedEmail && (
                <Button onClick={handleSendEmail}>
                  <Send className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <Mail className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600">Generate email content to get started</p>
            <p className="text-sm text-green-600 mt-1">Free and unlimited</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/employees">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Employees
          </Button>
        </Link>
        
        <Link href="/companies">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Companies
          </Button>
        </Link>
        
        <Link href="/dashboard">
          <Button variant="outline">
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}