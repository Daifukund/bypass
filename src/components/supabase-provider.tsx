"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";

type SupabaseContext = {
  supabase: SupabaseClient | null;
  error: string | null;
  isLoading: boolean;
};

const Context = createContext<SupabaseContext | undefined>(undefined);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      console.log("🚀 Initializing Supabase client...");
      const client = createClient();
      setSupabase(client);
      setError(null);
      console.log("✅ Supabase client initialized successfully");
    } catch (err) {
      console.error("❌ Supabase initialization error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to initialize Supabase",
      );
      setSupabase(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg border border-red-200">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-red-800 mb-2">
              Configuration Error
            </h2>
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <div className="text-xs text-gray-500 bg-gray-100 p-3 rounded">
              <p className="font-semibold mb-1">To fix this:</p>
              <ol className="text-left list-decimal list-inside space-y-1">
                <li>Create a .env.local file in your project root</li>
                <li>Add your Supabase URL and anon key</li>
                <li>Restart your development server</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <Context.Provider value={{ supabase, error, isLoading }}>
      {children}
    </Context.Provider>
  );
}

export const useSupabase = () => {
  const context = useContext(Context);

  if (context === undefined) {
    throw new Error("useSupabase must be used inside SupabaseProvider");
  }

  if (context.error) {
    throw new Error(`Supabase error: ${context.error}`);
  }

  if (!context.supabase) {
    throw new Error("Supabase client is not available");
  }

  return context.supabase;
};
