"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";

type SupabaseContext = {
  supabase: SupabaseClient | null;
  error: string | null;
};

const Context = createContext<SupabaseContext | undefined>(undefined);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      console.log("🚀 Initializing Supabase on Vercel...");
      const client = createClient();
      setSupabase(client);
      setError(null);
      console.log("✅ Supabase initialized successfully");
    } catch (err) {
      console.error("❌ Supabase initialization failed:", err);
      setError(
        err instanceof Error ? err.message : "Failed to initialize Supabase",
      );
    }
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg border border-red-200">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-red-800 mb-2">
              Vercel Configuration Error
            </h2>
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <div className="text-xs text-gray-500 bg-gray-100 p-3 rounded">
              <p className="font-semibold mb-1">To fix this on Vercel:</p>
              <ol className="text-left list-decimal list-inside space-y-1">
                <li>Go to your Vercel Dashboard</li>
                <li>Settings → Environment Variables</li>
                <li>
                  Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
                </li>
                <li>Redeploy your application</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Context.Provider value={{ supabase, error }}>{children}</Context.Provider>
  );
}

export const useSupabase = () => {
  const context = useContext(Context);

  if (context === undefined) {
    throw new Error("useSupabase must be used inside SupabaseProvider");
  }

  return context.supabase;
};
