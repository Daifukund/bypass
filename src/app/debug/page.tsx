"use client";

export default function DebugEnvPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Environment Debug (Vercel)</h1>

      <div className="space-y-4">
        <div className="p-4 bg-gray-100 rounded">
          <h3 className="font-semibold">NEXT_PUBLIC_SUPABASE_URL:</h3>
          <p className="font-mono text-sm break-all">
            {supabaseUrl ? `"${supabaseUrl}"` : "❌ UNDEFINED"}
          </p>
          <p className="text-xs text-gray-600">
            Type: {typeof supabaseUrl} | Length: {supabaseUrl?.length || 0}
          </p>
        </div>

        <div className="p-4 bg-gray-100 rounded">
          <h3 className="font-semibold">NEXT_PUBLIC_SUPABASE_ANON_KEY:</h3>
          <p className="font-mono text-sm break-all">
            {supabaseKey
              ? `"${supabaseKey.substring(0, 20)}...${supabaseKey.substring(supabaseKey.length - 10)}"`
              : "❌ UNDEFINED"}
          </p>
          <p className="text-xs text-gray-600">
            Type: {typeof supabaseKey} | Length: {supabaseKey?.length || 0}
          </p>
        </div>

        <div className="p-4 bg-yellow-100 rounded">
          <h3 className="font-semibold">URL Validation:</h3>
          <ul className="text-sm space-y-1">
            <li>
              ✅ Starts with https:{" "}
              {supabaseUrl?.startsWith("https://") ? "YES" : "❌ NO"}
            </li>
            <li>
              ✅ Contains supabase.co:{" "}
              {supabaseUrl?.includes("supabase.co") ? "YES" : "❌ NO"}
            </li>
            <li>
              ✅ No whitespace:{" "}
              {supabaseUrl && !supabaseUrl.includes(" ") ? "YES" : "❌ NO"}
            </li>
            <li>
              ✅ No quotes:{" "}
              {supabaseUrl &&
              !supabaseUrl.includes('"') &&
              !supabaseUrl.includes("'")
                ? "YES"
                : "❌ NO"}
            </li>
          </ul>
        </div>

        <div className="p-4 bg-blue-100 rounded">
          <h3 className="font-semibold">Key Validation:</h3>
          <ul className="text-sm space-y-1">
            <li>
              ✅ Starts with eyJ:{" "}
              {supabaseKey?.startsWith("eyJ") ? "YES" : "❌ NO"}
            </li>
            <li>
              ✅ No whitespace:{" "}
              {supabaseKey && !supabaseKey.includes(" ") ? "YES" : "❌ NO"}
            </li>
            <li>
              ✅ No quotes:{" "}
              {supabaseKey &&
              !supabaseKey.includes('"') &&
              !supabaseKey.includes("'")
                ? "YES"
                : "❌ NO"}
            </li>
          </ul>
        </div>

        <div className="p-4 bg-red-100 rounded">
          <h3 className="font-semibold">Test Fetch Call:</h3>
          <button
            onClick={() => {
              try {
                console.log("🧪 Testing fetch with URL:", supabaseUrl);
                fetch(supabaseUrl + "/rest/v1/", {
                  headers: {
                    apikey: supabaseKey || "",
                    Authorization: `Bearer ${supabaseKey || ""}`,
                  },
                })
                  .then((response) => {
                    console.log("✅ Fetch successful:", response.status);
                  })
                  .catch((error) => {
                    console.error("❌ Fetch failed:", error);
                  });
              } catch (error) {
                console.error("❌ Fetch setup failed:", error);
              }
            }}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Test Fetch (Check Console)
          </button>
        </div>
      </div>
    </div>
  );
}
