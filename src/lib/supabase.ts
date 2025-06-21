import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables. Please check your .env.local file.",
    );
  }

  // Validate URL format
  try {
    new URL(supabaseUrl);
  } catch {
    throw new Error(
      `Invalid NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl}. Must be a valid URL.`,
    );
  }

  // Validate anon key format (basic check)
  if (supabaseAnonKey.length < 100) {
    throw new Error(
      "Invalid NEXT_PUBLIC_SUPABASE_ANON_KEY: Key appears to be too short.",
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
