import { NextResponse } from "next/server";
import { groq } from "@/lib/groq";
import { supabase } from "@/lib/supabase";

// Allow this specific API route to run for up to 60 seconds on Vercel
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { videoId, sessionId, notes } = await req.json();

    if (!videoId || !sessionId || !notes) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const prompt = `You are an expert technical mentor.

Based on the following study notes, generate a short multiple-choice quiz (3-5 questions depending on the number of core concepts).

Return ONLY a valid JSON array.

Schema:

[
  {
    "topic": "The core concept being tested",
    "question": "The question text",
    "options": [
      "Option A",
      "Option B",
      "Option C",
      "Option D"
    ],
    "correctAnswer": "The exact string of the correct option",
    "explanationRight": "An appreciative remark followed by a 1-line explanation.",
    "explanationWrong": "An encouraging remark followed by a 2-3 line explanation."
  }
]

Study Notes:

${notes.substring(0, 30000)}`;

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

    const responseText =
      completion.choices[0]?.message?.content || "";

    if (!responseText) {
      throw new Error("Empty quiz response received");
    }

    // Remove markdown wrappers if model returns ```json ... ```
    const cleanedResponse = responseText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const quizData = JSON.parse(cleanedResponse);

    // Save generated quiz
    const { data: quizRecord, error: dbError } = await supabase
      .from("quizzes")
      .insert([
        {
          session_id: sessionId,
          video_id: videoId,
          quiz_type: "video_quiz",
          questions: quizData,
        },
      ])
      .select()
      .single();

    if (dbError) throw dbError;

    return NextResponse.json({
      success: true,
      quizId: quizRecord.id,
    });
  } catch (error: any) {
    console.error("Quiz Generation Error:", error);

    return NextResponse.json(
      {
        error: error.message || "Failed to generate quiz.",
      },
      { status: 500 }
    );
  }
}