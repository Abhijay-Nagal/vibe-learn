import { NextResponse } from "next/server";
import { YoutubeTranscript } from "youtube-transcript";
import { groq } from "@/lib/groq";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { youtubeUrl, sessionId } = await req.json();

    if (!youtubeUrl || !sessionId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Extract Video ID
    const videoIdMatch = youtubeUrl.match(
      /(?:youtu\.be\/|youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    );

    const videoId = videoIdMatch ? videoIdMatch[1] : null;

    if (!videoId) {
      return NextResponse.json(
        { error: "Invalid YouTube URL" },
        { status: 400 }
      );
    }

    // 1. Fetch Transcript
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    const transcriptText = transcript.map((t) => t.text).join(" ");

    // 2. Generate Notes with Groq
    const prompt = `You are a technical mentor. Generate highly structured, comprehensive study notes in Markdown format based on the following video transcript.

Requirements:
- Use proper Markdown headings
- Use bullet points
- Explain important concepts clearly
- Include examples when relevant
- Include code blocks if programming concepts are discussed
- Create revision-friendly notes

Transcript:

${transcriptText.substring(0, 30000)}`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
    });

    const notesMarkdown =
      completion.choices[0]?.message?.content || "";

    if (!notesMarkdown) {
      throw new Error("Failed to generate notes");
    }

    // 3. Save to Supabase 'videos' table
    const { data: videoRecord, error: dbError } = await supabase
      .from("videos")
      .insert([
        {
          session_id: sessionId,
          yt_video_id: videoId,
          yt_url: youtubeUrl,
          notes: notesMarkdown,
        },
      ])
      .select()
      .single();

    if (dbError) {
      throw dbError;
    }

    return NextResponse.json({
      success: true,
      video: videoRecord,
    });
  } 
  catch (error: any) {
  console.error("FULL API ERROR:", {
    name: error?.name,
    message: error?.message,
    stack: error?.stack,
    error,
  });

    if (error.message?.includes("Transcript is disabled")) {
      return NextResponse.json(
        {
          error: "This video does not have closed captions available.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: error.message || "Failed to process video.",
      },
      { status: 500 }
    );
  }
}