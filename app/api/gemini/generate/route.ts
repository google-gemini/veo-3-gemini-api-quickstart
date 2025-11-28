import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const prompt = (body?.prompt as string) || "";
    const model = (body?.model as string) || "gemini-2.5-flash-image-preview";

    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    // Check credits
    const { createClient } = await import('@/lib/supabase/server')
    const { prisma } = await import('@/lib/prisma')

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const profile = await prisma.userProfile.findUnique({
      where: { id: user.id }
    })

    const cost = model.includes("gemini-3-pro") ? 3 : 1;

    if (!profile || profile.credits < cost) {
      return NextResponse.json({ error: `Insufficient credits. Required: ${cost}, Available: ${profile?.credits || 0}` }, { status: 403 })
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    // Deduct credit on success
    await prisma.userProfile.update({
      where: { id: user.id },
      data: { credits: { decrement: cost } }
    })

    // Process the response to extract the image
    let imageData = null;
    let imageMimeType = "image/png";

    for (const part of response.candidates[0].content.parts) {
      if (part.text) {
        console.log("Generated text:", part.text);
      } else if (part.inlineData) {
        imageData = part.inlineData.data;
        imageMimeType = part.inlineData.mimeType || "image/png";
        break;
      }
    }

    if (!imageData) {
      return NextResponse.json({ error: "No image generated" }, { status: 500 });
    }

    return NextResponse.json({
      image: {
        imageBytes: imageData,
        mimeType: imageMimeType,
      },
    });
  } catch (error: unknown) {
    console.error("Error generating image with Gemini:", error instanceof Error ? error.message : String(error));
    if (error && typeof error === 'object' && 'response' in error) {
      console.error("Gemini API Error Response:", JSON.stringify((error as any).response, null, 2));
    }
    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
}
