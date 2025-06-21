import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Enhanced debugging
  console.log("Environment check:", {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    urlPreview: supabaseUrl?.substring(0, 30) + "...",
    keyPreview: supabaseAnonKey?.substring(0, 20) + "...",
  });

  if (!supabaseUrl || !supabaseAnonKey) {
    const missingVars = [];
    if (!supabaseUrl) missingVars.push("NEXT_PUBLIC_SUPABASE_URL");
    if (!supabaseAnonKey) missingVars.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");

    throw new Error(
      `Missing Supabase environment variables: ${missingVars.join(", ")}. ` +
        `Please create a .env.local file in your project root with these variables.`,
    );
  }

  // Validate URL format
  try {
    const url = new URL(supabaseUrl);
    if (!url.hostname.includes("supabase")) {
      throw new Error("URL does not appear to be a Supabase URL");
    }
  } catch (error) {
    throw new Error(
      `Invalid NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl}. ` +
        `Must be a valid Supabase URL (e.g., https://your-project.supabase.co). ` +
        `Error: ${error instanceof Error ? error.message : "Invalid URL format"}`,
    );
  }

  // Validate anon key format (basic check)
  if (supabaseAnonKey.length < 100) {
    throw new Error(
      `Invalid NEXT_PUBLIC_SUPABASE_ANON_KEY: Key appears to be too short (${supabaseAnonKey.length} characters). ` +
        `Expected a JWT token with 100+ characters.`,
    );
  }

  // Validate it looks like a JWT token
  if (!supabaseAnonKey.startsWith("eyJ")) {
    throw new Error(
      "Invalid NEXT_PUBLIC_SUPABASE_ANON_KEY: Key does not appear to be a valid JWT token. " +
        'It should start with "eyJ".',
    );
  }

  try {
    return createBrowserClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    throw new Error(
      `Failed to create Supabase client: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
