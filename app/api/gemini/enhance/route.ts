import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
    try {
        const { prompt, originalPrompt, task } = await req.json();

        if (!process.env.GOOGLE_GEMINI_API_KEY) {
            return NextResponse.json(
                { error: "Gemini API key not configured" },
                { status: 500 }
            );
        }

        // Use gemini-pro or gemini-1.5-flash for better performance/cost if available
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        let systemInstruction = "";
        if (task === "image_generation") {
            systemInstruction = `You are an expert image prompt enhancer.
      Your goal is to take a user's input and transform it into a detailed, high-quality prompt for an image generation model.
      Focus on adding descriptive details about lighting, style, composition, and mood.
      Keep the prompt under 100 words.`;
        } else if (task === "album_creation") {
            systemInstruction = `You are an expert image prompt enhancer for photo albums.
        Your goal is to take a user's input and transform it into a detailed prompt.
        Maintain consistency with the theme if provided.`;
        } else {
            systemInstruction = `You are an expert image prompt enhancer.`;
        }

        let userMessage = "";
        if (originalPrompt) {
            userMessage = `Original Context Prompt: "${originalPrompt}"
      User's Modified Input: "${prompt}"
      
      The user has modified a prompt alias or provided new input based on an original idea.
      Combine the essence of the "Original Context Prompt" with the specific changes or details in the "User's Modified Input".
      The "User's Modified Input" takes precedence for specific details (like changing "beach" to "mountain").
      If the user input is completely different, ignore the original context.
      
      Output ONLY the final enhanced prompt text. Do not include "Here is the prompt:" or quotes.`;
        } else {
            userMessage = `User Prompt: "${prompt}"
      
      Enhance this prompt to be more descriptive and suitable for high-quality image generation.
      Output ONLY the enhanced prompt text.`;
        }

        const result = await model.generateContent([
            systemInstruction,
            userMessage
        ]);
        const response = await result.response;
        const enhancedPrompt = response.text().trim();

        return NextResponse.json({ enhancedPrompt });
    } catch (error) {
        console.error("Gemini Enhance API Error:", error);
        return NextResponse.json(
            { error: "Failed to enhance prompt" },
            { status: 500 }
        );
    }
}
