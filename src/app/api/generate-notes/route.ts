import { NextResponse } from "next/server";
import { YoutubeTranscript } from "youtube-transcript";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "@/lib/supabase";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { youtubeUrl, sessionId } = await req.json();

    if (!youtubeUrl || !sessionId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Extract Video ID
    const videoIdMatch = youtubeUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;

    if (!videoId) {
      return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
    }

    // 1. Fetch Transcript
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    const transcriptText = transcript.map((t) => t.text).join(" ");

    // 2. Generate Notes with Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `You are a technical mentor. Generate highly structured, comprehensive study notes in Markdown format based on the following video transcript. Include headers, bullet points, and code blocks if applicable:\n\n${transcriptText.substring(0, 30000)}`; // Truncated to prevent context limit errors
    
    const result = await model.generateContent(prompt);
    const notesMarkdown = result.response.text();

    // 3. Save to Supabase 'videos' table
    const { data: videoRecord, error: dbError } = await supabase
      .from("videos")
      .insert([
        {
          session_id: sessionId,
          yt_video_id: videoId,
          yt_url: youtubeUrl,
          notes: notesMarkdown,
        }
      ])
      .select()
      .single();

    if (dbError) throw dbError;

    return NextResponse.json({ success: true, video: videoRecord });

  } catch (error: any) {
    console.error("API Error:", error);
    // Handle the specific caption error we discussed earlier
    if (error.message?.includes("Transcript is disabled")) {
       return NextResponse.json({ error: "This video does not have closed captions available." }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to process video." }, { status: 500 });
  }
}