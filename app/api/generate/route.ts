import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
  try {
    const { prompt, aspectRatio = "1:1" } = await req.json();
    
    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // Map aspect ratio to dimensions
    let width = 1024;
    let height = 1024;
    if (aspectRatio === "16:9") { width = 1024; height = 576; }
    else if (aspectRatio === "9:16") { width = 576; height = 1024; }
    else if (aspectRatio === "4:3") { width = 1024; height = 768; }
    else if (aspectRatio === "3:4") { width = 768; height = 1024; }

    // Use Pollinations.ai (Free, no API key required)
    const seed = Math.floor(Math.random() * 1000000);
    const encodedPrompt = encodeURIComponent(prompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true`;

    // Fetch the image so we can return it as base64 (allows the download button to work properly)
    const imageResponse = await fetch(imageUrl);
    
    if (!imageResponse.ok) { 
      return NextResponse.json({ error: "Failed to generate image from free provider" }, { status: 500 });
    }

    const arrayBuffer = await imageResponse.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    
    // Convert to base64 using web standard approach
    let binary = '';
    const chunkSize = 8192;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunkSize)));
    }
    const base64Image = btoa(binary);

    return NextResponse.json({ image: `data:image/jpeg;base64,${base64Image}` });
  } catch (error: any) {
    console.error("Image generation error:", error);
    return NextResponse.json({ error: error.message || "An error occurred" }, { status: 500 });
  }
}
