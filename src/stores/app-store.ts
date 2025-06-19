// src/stores/app-store.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { SupabaseClient } from '@supabase/supabase-js';
import { CreditService } from '@/lib/credits';

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Clear storage if we detect a version mismatch or corruption
  const storageVersion = localStorage.getItem('bypass-storage-version');
  const currentVersion = '1.0.0'; // Update this when you make breaking changes
  
  if (storageVersion !== currentVersion) {
    console.log('Clearing storage due to version change');
    localStorage.removeItem('bypass-app-storage');
    localStorage.removeItem('bypass-search-storage');
    localStorage.setItem('bypass-storage-version', currentVersion);
  }
}

export interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  university?: string;
  study_level?: string;
  field_of_study?: string;
  phone?: string;
  linkedin?: string;
  language?: string;
  plan?: 'freemium' | 'premium';
  email_credits?: number;
  created_at?: string;
  updated_at?: string;
}

type AppState = {
  // User data
  user: {
    id: string;
    email: string;
  } | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;

  // Credit management
  emailCreditsUsed: number;
  maxFreeCredits: number;
  isPremium: boolean;
  creditsRemaining: number;

  // ADD THESE TWO LINES:
  showWelcomeModal: boolean;
  hasCompletedOnboarding: boolean;

  // Actions
  setUser: (user: AppState["user"]) => void;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearUser: () => void;
  
  // Credit actions
  incrementCredits: () => void;
  refreshProfile: (supabase: SupabaseClient) => Promise<void>;
  initializeUser: (supabase: SupabaseClient) => Promise<void>;
  refreshCredits: (supabase: SupabaseClient) => Promise<void>;

  // ADD THESE THREE LINES:
  setShowWelcomeModal: (show: boolean) => void;
  setHasCompletedOnboarding: (completed: boolean) => void;
  checkIfFirstTimeUser: (profile: UserProfile | null) => boolean;

  // Add this method to the store
  refreshCreditsAfterOperation: (supabase: SupabaseClient) => Promise<void>;
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      profile: null,
      loading: false,
      error: null,
      emailCreditsUsed: 0,
      maxFreeCredits: 5,
      isPremium: false,
      creditsRemaining: 5,

      // ADD THESE TWO LINES:
      showWelcomeModal: false,
      hasCompletedOnboarding: false,

      // Basic setters
      setUser: (user) => {
        set({ user });
        // Clear profile if user is cleared
        if (!user) {
          set({ profile: null, emailCreditsUsed: 0, isPremium: false, creditsRemaining: 5 });
        }
      },

      setProfile: (profile) => {
        const emailCreditsUsed = profile?.email_credits || 0;
        const isPremium = profile?.plan === 'premium';
        const creditsRemaining = Math.max(0, get().maxFreeCredits - emailCreditsUsed);

        set({ 
          profile,
          emailCreditsUsed,
          isPremium,
          creditsRemaining
        });

        // Enhanced onboarding logic
        const isFirstTime = get().checkIfFirstTimeUser(profile);
        const hasCompletedOnboarding = get().hasCompletedOnboarding;
        
        console.log('🎯 Onboarding check:', { 
          isFirstTime, 
          hasCompletedOnboarding, 
          createdAt: profile?.created_at 
        });
        
        if (isFirstTime && !hasCompletedOnboarding) {
          console.log('✅ Showing welcome modal for new user');
          set({ showWelcomeModal: true });
        }
      },

      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      clearUser: () => set({ 
        user: null, 
        profile: null, 
        emailCreditsUsed: 0, 
        isPremium: false, 
        creditsRemaining: 5,
        loading: false,
        error: null,
        showWelcomeModal: false,
        hasCompletedOnboarding: false
      }),

      // Credit management
      incrementCredits: () => {
        const state = get();
        if (!state.isPremium) {
          const newCreditsUsed = state.emailCreditsUsed + 1;
          const newCreditsRemaining = Math.max(0, state.maxFreeCredits - newCreditsUsed);
          
          set({
            emailCreditsUsed: newCreditsUsed,
            creditsRemaining: newCreditsRemaining
          });

          // Also update the profile if it exists
          if (state.profile) {
            set({
              profile: {
                ...state.profile,
                email_credits: newCreditsUsed
              }
            });
          }
        }
      },

      // Refresh profile from database
      refreshProfile: async (supabase: SupabaseClient) => {
        const state = get();
        if (!state.user?.id) return;

        try {
          set({ loading: true, error: null });

          const { data: profileData, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', state.user.id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') {
            console.error('Error fetching profile:', profileError);
            set({ error: 'Failed to fetch profile' });
          } else if (profileData) {
            get().setProfile(profileData);
          }
        } catch (error) {
          console.error('Error refreshing profile:', error);
          set({ error: 'Failed to refresh profile' });
        } finally {
          set({ loading: false });
        }
      },

      // Initialize user and profile
      initializeUser: async (supabase: SupabaseClient) => {
        try {
          set({ loading: true, error: null });

          const { data: { user }, error: authError } = await supabase.auth.getUser();
          
          if (authError || !user) {
            get().clearUser();
            return;
          }

          set({ user: { id: user.id, email: user.email || '' } });

          // Try to fetch profile, but don't fail if it doesn't work
          try {
            const { data: profileData, error: profileError } = await supabase
              .from('users')
              .select('*')
              .eq('id', user.id)
              .single();

            if (!profileError && profileData) {
              get().setProfile(profileData);
            }
          } catch (profileError) {
            console.warn('Profile fetch failed:', profileError);
            // Continue without profile
          }
          
        } catch (error) {
          console.error('Error initializing user:', error);
          set({ error: 'Failed to initialize user' });
        } finally {
          set({ loading: false });
        }
      },

      // Refresh credits
      refreshCredits: async (supabase: SupabaseClient) => {
        const user = get().user;
        if (!user) return;
        
        try {
          const creditStatus = await CreditService.getCreditStatus(user.id, supabase);
          set({
            emailCreditsUsed: creditStatus.creditsUsed,
            creditsRemaining: creditStatus.creditsRemaining,
            isPremium: creditStatus.plan === 'premium'
          });
        } catch (error) {
          console.error('Error refreshing credits:', error);
        }
      },

      // ADD THESE THREE LINES:
      setShowWelcomeModal: (show) => set({ showWelcomeModal: show }),
      setHasCompletedOnboarding: (completed) => set({ hasCompletedOnboarding: completed }),
      checkIfFirstTimeUser: (profile) => {
        if (!profile?.created_at) {
          console.log('❌ No created_at found in profile');
          return false;
        }
        
        const createdAt = new Date(profile.created_at);
        const now = new Date();
        const timeDiff = now.getTime() - createdAt.getTime();
        const hoursDiff = timeDiff / (1000 * 3600);
        
        console.log('⏰ Time check:', { 
          createdAt: createdAt.toISOString(), 
          now: now.toISOString(), 
          hoursDiff: hoursDiff.toFixed(2) 
        });
        
        // Consider users created within the last 24 hours as first-time users
        return hoursDiff <= 24;
      },

      // Add this method to the store
      refreshCreditsAfterOperation: async (supabase: SupabaseClient) => {
        const state = get();
        if (!state.user?.id) return;

        try {
          const { data: userData, error } = await supabase
            .from('users')
            .select('email_credits, plan')
            .eq('id', state.user.id)
            .single();

          if (!error && userData) {
            const emailCreditsUsed = userData.email_credits || 0;
            const isPremium = userData.plan === 'premium';
            const creditsRemaining = Math.max(0, state.maxFreeCredits - emailCreditsUsed);
            
            set({
              emailCreditsUsed,
              isPremium,
              creditsRemaining
            });

            // Also update profile if it exists
            if (state.profile) {
              set({
                profile: {
                  ...state.profile,
                  email_credits: emailCreditsUsed,
                  plan: userData.plan
                }
              });
            }
          }
        } catch (error) {
          console.error('Error refreshing credits:', error);
        }
      },
    }),
    {
      name: 'bypass-app-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        // Don't persist loading/error states
      }),
      // Add error handling for corrupted storage
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.warn('Failed to rehydrate app store:', error);
          // Clear corrupted storage
          localStorage.removeItem('bypass-app-storage');
        }
      },
    }
  )
);