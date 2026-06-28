import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { Supadata } from "@supadata/js";
import { groq } from "@/lib/groq";

const supadata = new Supadata({
  apiKey: process.env.SUPADATA_API_KEY!,
});

export async function POST(req: Request) {
  const supabase = await createClient();

  // Secure API Route
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: "Unauthorized access. Please log in." },
      { status: 401 }
    );
  }

  try {
    const { youtubeUrl, sessionId } = await req.json();

    if (!youtubeUrl || !sessionId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Extract YouTube Video ID
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

    // =====================================================
    // PREVENT DUPLICATES IN SAME SESSION
    // =====================================================

    const { data: existingVideo } = await supabase
      .from("videos")
      .select("*")
      .eq("session_id", sessionId)
      .eq("yt_video_id", videoId)
      .maybeSingle();

    if (existingVideo) {
      console.log(
        "VIDEO ALREADY EXISTS IN THIS SESSION"
      );

      return NextResponse.json({
        success: true,
        video: existingVideo,
        cached: true,
        duplicate: true,
      });
    }

    // =====================================================
    // PHASE 2.2 - INTELLIGENT CACHE CHECK
    // =====================================================

    const { data: cachedVideo } = await supabase
      .from("videos")
      .select(
        "notes, title, thumbnail_url, yt_url"
      )
      .eq("yt_video_id", videoId)
      .not("notes", "is", null)
      .limit(1)
      .maybeSingle();

    if (cachedVideo) {
      console.log(
        "CACHE HIT: Cloning existing video notes."
      );

      const { data: clonedVideo, error: cloneError } =
        await supabase
          .from("videos")
          .insert([
            {
              session_id: sessionId,
              yt_video_id: videoId,
              yt_url:
                cachedVideo.yt_url || youtubeUrl,
              notes: cachedVideo.notes,
              title: cachedVideo.title,
              thumbnail_url:
                cachedVideo.thumbnail_url,
            },
          ])
          .select()
          .single();

      if (cloneError) {
        throw cloneError;
      }

      return NextResponse.json({
        success: true,
        video: clonedVideo,
        cached: true,
      });
    }

    console.log(
      "CACHE MISS: Fetching transcript and generating notes."
    );

    // =====================================================
    // NORMAL PIPELINE
    // =====================================================

    const transcriptResult =
      await supadata.youtube.transcript({
        url: youtubeUrl,
      });

    let transcriptText = "";

    if (
      typeof transcriptResult.content ===
      "string"
    ) {
      transcriptText =
        transcriptResult.content;
    } else {
      transcriptText =
        transcriptResult.content
          .map((item: any) => item.text)
          .join(" ");
    }

    if (!transcriptText) {
      throw new Error(
        "Failed to fetch transcript"
      );
    }

    const prompt = `You are a technical mentor. Generate highly structured, comprehensive study notes in Markdown format based on the following video transcript.
    IMPORTANT:
Always generate the notes in fluent English, regardless of the language of the transcript.
If the transcript is in Hindi or any other language, first understand it internally and then write the final notes entirely in English.
Do not include any Hindi text in the output.

Requirements:
- Use proper Markdown headings
- Use bullet points
- Explain important concepts clearly
- Include examples when relevant
- Include code blocks if programming concepts are discussed
- Create revision-friendly notes

Transcript:

${transcriptText.substring(
  0,
  30000
)}`;

    const completion =
      await groq.chat.completions.create({
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
      completion.choices[0]?.message
        ?.content || "";

    if (!notesMarkdown) {
      throw new Error(
        "Failed to generate notes"
      );
    }

    const {
      data: videoRecord,
      error: dbError,
    } = await supabase
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
      cached: false,
    });
  } catch (error: any) {
    console.error("FULL API ERROR:", {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
      error,
    });

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Failed to process video.",
      },
      { status: 500 }
    );
  }
}