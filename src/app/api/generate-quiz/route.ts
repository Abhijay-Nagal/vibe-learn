import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "@/lib/supabase";

// Allow this specific API route to run for up to 60 seconds on Vercel
export const maxDuration = 60; 

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { videoId, sessionId, notes } = await req.json();

    if (!videoId || !sessionId || !notes) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Prompt Gemini for strict JSON output
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" } 
    });

    const prompt = `You are an expert technical mentor. Based on the following study notes, generate a short multiple-choice quiz (3-5 questions depending on the number of core concepts). 
    
    Output strictly as a JSON array of objects with the following schema:
    [
      {
        "topic": "The core concept being tested (e.g., Time Complexity)",
        "question": "The question text",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": "The exact string of the correct option from the array"
        "explanationRight": "An appreciative remark (e.g., 'Great job!') followed by a strictly 1-line explanation of why this is correct.",
        "explanationWrong": "An encouraging remark (e.g., 'Not quite, but you are close!') followed by a 2-3 line explanation of why this is incorrect and what the right concept is."
      }
    ]
    
    Notes to base the quiz on:
    ${notes.substring(0, 30000)}`;
    
    const result = await model.generateContent(prompt);
    const quizData = JSON.parse(result.response.text());

    // 2. Save the generated quiz to the Supabase 'quizzes' table
    const { data: quizRecord, error: dbError } = await supabase
      .from("quizzes")
      .insert([
        {
          session_id: sessionId,
          video_id: videoId,
          quiz_type: "video_quiz",
          questions: quizData,
        }
      ])
      .select()
      .single();

    if (dbError) throw dbError;

    return NextResponse.json({ success: true, quizId: quizRecord.id });

  } catch (error: any) {
    console.error("Quiz Generation Error:", error);
    return NextResponse.json({ error: "Failed to generate quiz." }, { status: 500 });
  }
}