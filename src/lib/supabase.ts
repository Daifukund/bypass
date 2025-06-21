import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  // Get environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Debug for Vercel
  console.log("🔍 Vercel Environment Check:", {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    urlLength: supabaseUrl?.length,
    keyLength: supabaseAnonKey?.length,
    urlPreview: supabaseUrl?.substring(0, 30) + "...",
    keyPreview: supabaseAnonKey?.substring(0, 20) + "...",
    isProduction: process.env.NODE_ENV === "production",
  });

  // Check for missing environment variables
  if (!supabaseUrl || supabaseUrl === "undefined") {
    throw new Error(
      "❌ NEXT_PUBLIC_SUPABASE_URL is missing in Vercel environment variables",
    );
  }

  if (!supabaseAnonKey || supabaseAnonKey === "undefined") {
    throw new Error(
      "❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is missing in Vercel environment variables",
    );
  }

  // Clean the values
  const cleanUrl = supabaseUrl.trim();
  const cleanKey = supabaseAnonKey.trim();

  // Validate URL format
  try {
    const url = new URL(cleanUrl);
    if (!url.hostname.includes("supabase.co")) {
      throw new Error(`❌ Invalid Supabase URL: ${cleanUrl}`);
    }
  } catch (urlError) {
    throw new Error(
      `❌ Invalid NEXT_PUBLIC_SUPABASE_URL: ${cleanUrl}. Error: ${urlError instanceof Error ? urlError.message : "Unknown"}`,
    );
  }

  // Validate anon key format
  if (cleanKey.length < 100 || !cleanKey.startsWith("eyJ")) {
    throw new Error(
      `❌ Invalid NEXT_PUBLIC_SUPABASE_ANON_KEY. Length: ${cleanKey.length}, Starts with: ${cleanKey.substring(0, 3)}`,
    );
  }

  try {
    return createBrowserClient(cleanUrl, cleanKey);
  } catch (clientError) {
    console.error("❌ Supabase client creation failed:", clientError);
    throw new Error(
      `❌ Failed to create Supabase client: ${clientError instanceof Error ? clientError.message : "Unknown error"}`,
    );
  }
}
