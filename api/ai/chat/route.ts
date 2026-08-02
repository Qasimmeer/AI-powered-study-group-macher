import { model } from "@/lib/ai-config";
import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    // Convert messages to Gemini format
    let history = messages.slice(0, -1).map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));
    
    // Gemini history MUST start with a 'user' role. 
    // If the first message is from the assistant, remove it.
    const firstUserIndex = history.findIndex((h: any) => h.role === "user");
    if (firstUserIndex !== -1) {
      history = history.slice(firstUserIndex);
    } else {
      history = []; // No user messages yet
    }
    
    const currentMessage = messages[messages.length - 1].content;

    const chat = model.startChat({
      history: history,
    });

    const result = await chat.sendMessageStream(currentMessage);

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            controller.enqueue(encoder.encode(chunkText));
          }
        } catch (err: any) {
          console.error("Stream error:", err);
          const errorMsg = "\n\n[AI Error: " + (err.message || "The model is currently busy. Please try again in a few seconds.") + "]";
          controller.enqueue(encoder.encode(errorMsg));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream);
  } catch (error: any) {
    console.error("AI Chat Error:", error);
    let status = 500;
    let message = "Failed to generate response";
    
    if (error.message?.includes("503") || error.message?.includes("high demand")) {
      status = 503;
      message = "The AI model is currently experiencing high demand. Please wait a moment and try again.";
    } else if (error.status === 429 || error.message?.includes("429") || error.message?.includes("quota")) {
      status = 429;
      message = "You've reached the free tier limit for the AI. Please try again later or check back tomorrow.";
    } else if (error.message?.includes("API key")) {
      status = 401;
      message = "Invalid or missing Google AI API Key. Please check your .env file.";
    }

    return NextResponse.json({ error: message }, { status });
  }
}
