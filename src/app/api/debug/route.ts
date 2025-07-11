import { NextRequest, NextResponse } from "next/server";
import { openai, supportsWebSearch } from "@/lib/openai/client";

export async function GET(req: NextRequest) {
  try {
    if (!supportsWebSearch()) {
      return NextResponse.json({ error: "Web search not supported" }, { status: 500 });
    }

    console.log("🧪 Running DECISIVE WebSearch test...");

    // Test 1: Something that requires TODAY'S web access
    const currentTest = await openai!.responses.create({
      model: "gpt-4.1",
      tools: [{ type: "web_search_preview", search_context_size: "medium" }],
      input:
        "What is the current stock price of Apple (AAPL) right now today? Visit a financial website to get the exact current price.",
    });

    // Test 2: Very recent news (last 7 days)
    const newsTest = await openai!.responses.create({
      model: "gpt-4.1",
      tools: [{ type: "web_search_preview", search_context_size: "medium" }],
      input:
        "What major tech news happened in the last 7 days? Search for recent tech news from this week.",
    });

    // Extract results
    const extractInfo = (response: any) => {
      const message = response.output.find((item: any) => item.type === "message");
      const content = message?.content?.[0];
      return {
        text: content?.text || "",
        citations: content?.annotations || [],
        usedWebSearch: response.output.some((x: any) => x.type === "web_search_call"),
      };
    };

    const currentInfo = extractInfo(currentTest);
    const newsInfo = extractInfo(newsTest);

    // Get today's date for comparison
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const currentYear = new Date().getFullYear();

    // Analysis
    const analysis = {
      stockTest: {
        hasCitations: currentInfo.citations.length > 0,
        mentionsCurrentPrice: currentInfo.text.includes("$") && currentInfo.text.includes("AAPL"),
        citationsCount: currentInfo.citations.length,
      },
      newsTest: {
        hasCitations: newsInfo.citations.length > 0,
        mentionsCurrentYear: newsInfo.text.includes(currentYear.toString()),
        mentionsRecentDates: newsInfo.text.includes("2025"),
        citationsCount: newsInfo.citations.length,
      },
      totalCitations: currentInfo.citations.length + newsInfo.citations.length,
    };

    // Decisive conclusion
    const isRealWebSearch =
      analysis.totalCitations > 0 &&
      (analysis.stockTest.mentionsCurrentPrice || analysis.newsTest.mentionsRecentDates);

    console.log("📊 DECISIVE Test Results:");
    console.log("- Total citations:", analysis.totalCitations);
    console.log("- Stock price info:", analysis.stockTest.mentionsCurrentPrice);
    console.log("- Recent news:", analysis.newsTest.mentionsRecentDates);
    console.log("- CONCLUSION:", isRealWebSearch ? "REAL" : "FAKE");

    return NextResponse.json({
      success: true,
      analysis,
      stockResponse: currentInfo.text.substring(0, 300),
      newsResponse: newsInfo.text.substring(0, 300),
      allCitations: [...currentInfo.citations, ...newsInfo.citations],
      decisiveConclusion: isRealWebSearch
        ? "🎉 WebSearch is REAL - It can access current web data!"
        : "❌ WebSearch is FAKE - No real-time web access, just enhanced training data",
    });
  } catch (error) {
    console.error("❌ Decisive test failed:", error);
    return NextResponse.json(
      {
        error: "Decisive test failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
