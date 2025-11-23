import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";

    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Expected multipart/form-data" },
        { status: 400 }
      );
    }

    const form = await req.formData();
    const prompt = (form.get("prompt") as string) || "";

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

    if (!profile || profile.credits < 1) {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 403 })
    }

    // Handle multiple image files
    const imageFiles = form.getAll("imageFiles");
    console.log("Received imageFiles from form:", imageFiles.length);
    console.log(
      "Image file details:",
      imageFiles.map((f, i) => ({
        index: i,
        name: f instanceof File ? f.name : "not-file",
        type: f instanceof File ? f.type : typeof f,
      }))
    );

    const contents: (
      | { text: string }
      | { inlineData: { mimeType: string; data: string } }
    )[] = [];

    // Add the prompt as text
    contents.push({ text: prompt });

    // Process each image file
    console.log("Processing image files...");
    for (const imageFile of imageFiles) {
      if (imageFile && imageFile instanceof File) {
        console.log(
          `Processing file: ${imageFile.name}, size: ${imageFile.size}, type: ${imageFile.type}`
        );
        const buf = await imageFile.arrayBuffer();
        const b64 = Buffer.from(buf).toString("base64");
        contents.push({
          inlineData: {
            mimeType: imageFile.type || "image/png",
            data: b64,
          },
        });
      }
    }
    console.log("Total contents after processing:", contents.length);

    // Handle single image (backward compatibility)
    const singleImageFile = form.get("imageFile");
    if (
      singleImageFile &&
      singleImageFile instanceof File &&
      contents.length === 1
    ) {
      const buf = await singleImageFile.arrayBuffer();
      const b64 = Buffer.from(buf).toString("base64");
      contents.push({
        inlineData: {
          mimeType: singleImageFile.type || "image/png",
          data: b64,
        },
      });
    }

    // Handle base64 image (for generated images)
    const imageBase64 = (form.get("imageBase64") as string) || undefined;
    const imageMimeType = (form.get("imageMimeType") as string) || undefined;

    if (imageBase64 && contents.length === 1) {
      const cleaned = imageBase64.includes(",")
        ? imageBase64.split(",")[1]
        : imageBase64;
      contents.push({
        inlineData: {
          mimeType: imageMimeType || "image/png",
          data: cleaned,
        },
      });
    }

    if (contents.length < 2) {
      return NextResponse.json(
        { error: "No images provided for editing" },
        { status: 400 }
      );
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image-preview",
      contents: contents,
    });

    // Deduct credit on success
    await prisma.userProfile.update({
      where: { id: user.id },
      data: { credits: { decrement: 1 } }
    })

    // Process the response to extract the image
    let imageData = null;
    let responseMimeType = "image/png";

    for (const part of response.candidates[0].content.parts) {
      if (part.text) {
        console.log("Generated text:", part.text);
      } else if (part.inlineData) {
        imageData = part.inlineData.data;
        responseMimeType = part.inlineData.mimeType || "image/png";
        break;
      }
    }

    if (!imageData) {
      return NextResponse.json(
        { error: "No image generated" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      image: {
        imageBytes: imageData,
        mimeType: responseMimeType,
      },
    });
  } catch (error) {
    console.error("Error editing image with Gemini:", error);
    return NextResponse.json(
      { error: "Failed to edit image" },
      { status: 500 }
    );
  }
}
