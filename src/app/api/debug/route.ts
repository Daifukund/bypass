import { NextRequest, NextResponse } from "next/server";
import { openai, supportsWebSearch, debugWebSearchSupport } from "@/lib/openai/client";

export async function GET(req: NextRequest) {
  try {
    // Debug web search support
    debugWebSearchSupport();

    if (!supportsWebSearch()) {
      return NextResponse.json(
        {
          error: "Web search not supported",
          details: {
            openaiExists: !!openai,
            responsesExists: !!openai?.responses,
            responsesCreateExists: !!openai?.responses?.create,
          },
        },
        { status: 500 }
      );
    }

    // Test simple web search
    console.log("🧪 Testing simple web search...");

    const testResponse = await openai!.responses.create({
      model: "gpt-4.1",
      tools: [
        {
          type: "web_search_preview",
          search_context_size: "medium",
        },
      ],
      input:
        "What is Pierre Fabre company? Give me basic information about this French pharmaceutical company.",
    });

    console.log("✅ Web search test successful");
    console.log("Response:", JSON.stringify(testResponse, null, 2));

    return NextResponse.json({
      success: true,
      message: "Web search is working",
      response: testResponse,
    });
  } catch (error) {
    console.error("❌ Web search test failed:", error);

    return NextResponse.json(
      {
        error: "Web search test failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
