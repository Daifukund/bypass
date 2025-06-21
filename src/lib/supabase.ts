import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  // Get environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Debug logging (remove in production)
  if (typeof window !== "undefined") {
    console.log("🔍 Supabase Client Debug:", {
      url: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : "MISSING",
      key: supabaseAnonKey
        ? `${supabaseAnonKey.substring(0, 10)}...`
        : "MISSING",
      hasWindow: typeof window !== "undefined",
    });
  }

  // Check for missing environment variables
  if (!supabaseUrl) {
    throw new Error(
      "❌ NEXT_PUBLIC_SUPABASE_URL is missing. Check your .env.local file.",
    );
  }

  if (!supabaseAnonKey) {
    throw new Error(
      "❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is missing. Check your .env.local file.",
    );
  }

  // Validate URL format
  try {
    const url = new URL(supabaseUrl);
    if (!url.hostname.includes("supabase.co")) {
      throw new Error(`❌ Invalid Supabase URL format: ${supabaseUrl}`);
    }
  } catch (urlError) {
    throw new Error(
      `❌ Invalid NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl}. Must be a valid URL like https://your-project.supabase.co`,
    );
  }

  // Validate anon key format
  if (supabaseAnonKey.length < 100 || !supabaseAnonKey.startsWith("eyJ")) {
    throw new Error(
      '❌ Invalid NEXT_PUBLIC_SUPABASE_ANON_KEY. Must be a valid JWT token starting with "eyJ"',
    );
  }

  // Create and return the client
  try {
    const client = createBrowserClient(supabaseUrl, supabaseAnonKey);
    console.log("✅ Supabase client created successfully");
    return client;
  } catch (clientError) {
    console.error("❌ Failed to create Supabase client:", clientError);
    throw new Error(
      `❌ Failed to create Supabase client: ${clientError instanceof Error ? clientError.message : "Unknown error"}`,
    );
  }
}
