'use client';

import { useEffect, useState } from 'react';
import { useSupabase } from '@/components/supabase-provider';
import { Button } from '@/components/ui/button';
import { 
  Crown, 
  Check, 
  X,
  CreditCard,
  Zap,
  Users,
  Mail,
  Search,
  Building2
} from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  email_credits?: number;
  plan?: string;
}

export default function UpgradePage() {
  const supabase = useSupabase();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
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
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const emailCreditsUsed = profile?.email_credits || 0;
  const maxFreeCredits = 5;
  const isPremium = profile?.plan === 'premium';

  const features = [
    {
      name: 'Company Searches',
      free: 'Limited (until 5 emails used)',
      premium: 'Unlimited',
      icon: Building2
    },
    {
      name: 'Contact Searches',
      free: 'Limited (until 5 emails used)',
      premium: 'Unlimited',
      icon: Users
    },
    {
      name: 'Email Generations',
      free: '5 Free Emails',
      premium: 'Unlimited',
      icon: Mail
    },
    {
      name: 'AI Customization',
      free: 'Limited',
      premium: 'Advanced AI Messaging',
      icon: Zap
    },
    {
      name: 'Support',
      free: 'Community',
      premium: 'Priority Support',
      icon: CreditCard
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-full">
            <Crown className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Ready to Skip the Job Board Queue?</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Upgrade to unlock unlimited email generation, smart personalization, and faster replies.
        </p>
      </div>

      {/* Current Status */}
      {!isPremium && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <div className="bg-yellow-100 p-2 rounded-full">
              <Mail className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-semibold text-yellow-800">Current Usage</h3>
              <p className="text-yellow-700">
                You've used {emailCreditsUsed} out of {maxFreeCredits} free email generations.
                {emailCreditsUsed >= maxFreeCredits && " Upgrade to continue finding contacts!"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Comparison */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Free Plan */}
        <div className="bg-white border border-gray-200 rounded-xl p-8 relative">
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-bold text-gray-900">Freemium</h3>
            <div className="text-4xl font-bold text-gray-900">
              Free
              <span className="text-lg font-normal text-gray-600"> forever</span>
            </div>
            <p className="text-gray-600">Perfect for trying out Bypass</p>
          </div>

          <ul className="mt-8 space-y-4">
            {features.map((feature) => (
              <li key={feature.name} className="flex items-start space-x-3">
                <feature.icon className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium text-gray-900">{feature.name}</span>
                  <p className="text-sm text-gray-600">{feature.free}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-8">
            <Button 
              variant="outline" 
              className="w-full" 
              disabled={!isPremium}
            >
              {!isPremium ? 'Current Plan' : 'Downgrade'}
            </Button>
          </div>
        </div>

        {/* Premium Plan */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-8 relative">
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-medium">
              Most Popular
            </span>
          </div>

          <div className="text-center space-y-4">
            <h3 className="text-2xl font-bold text-gray-900">Premium</h3>
            <div className="text-4xl font-bold text-gray-900">
              €9.99
              <span className="text-lg font-normal text-gray-600">/month</span>
            </div>
            <p className="text-gray-600">For serious job seekers</p>
          </div>

          <ul className="mt-8 space-y-4">
            {features.map((feature) => (
              <li key={feature.name} className="flex items-start space-x-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium text-gray-900">{feature.name}</span>
                  <p className="text-sm text-gray-600">{feature.premium}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-8">
            <Button 
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              disabled={isPremium}
            >
              {isPremium ? 'Current Plan' : 'Upgrade Now'}
            </Button>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="bg-gray-50 rounded-xl p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
          Why Upgrade to Premium?
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center space-y-3">
            <div className="bg-blue-100 p-3 rounded-full w-fit mx-auto">
              <Zap className="h-6 w-6 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900">Unlimited Access</h4>
            <p className="text-sm text-gray-600">
              No limits on company searches, contact discovery, or email generation.
            </p>
          </div>
          <div className="text-center space-y-3">
            <div className="bg-green-100 p-3 rounded-full w-fit mx-auto">
              <Mail className="h-6 w-6 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-900">Advanced AI</h4>
            <p className="text-sm text-gray-600">
              More personalized and effective email messages that get responses.
            </p>
          </div>
          <div className="text-center space-y-3">
            <div className="bg-purple-100 p-3 rounded-full w-fit mx-auto">
              <CreditCard className="h-6 w-6 text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-900">Priority Support</h4>
            <p className="text-sm text-gray-600">
              Get help faster with dedicated premium support.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-gray-600 space-y-2">
        <p>Cancel anytime. Most users get hired on the free plan.</p>
        <p>No hidden fees. No long-term commitments.</p>
      </div>
    </div>
  );
}