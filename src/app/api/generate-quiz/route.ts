import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { groq } from "@/lib/groq";

// Allow this specific API route to run for up to 60 seconds on Vercel
export const maxDuration = 60;

export async function POST(req: Request) {
  const supabase = await createClient();

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
    const { videoId, sessionId, notes } = await req.json();

    if (!videoId || !sessionId || !notes) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // =====================================================
    // GET CURRENT VIDEO INFO
    // =====================================================

    const { data: currentVideo, error: videoError } = await supabase
      .from("videos")
      .select("yt_video_id")
      .eq("id", videoId)
      .single();

    if (videoError || !currentVideo) {
      throw new Error("Video not found");
    }

    // =====================================================
    // QUIZ CACHE CHECK
    // =====================================================

    const { data: cachedQuiz } = await supabase
      .from("quizzes")
      .select("questions")
      .eq("yt_video_id", currentVideo.yt_video_id)
      .eq("quiz_type", "video_quiz")
      .limit(1)
      .maybeSingle();

    if (cachedQuiz) {
      console.log("QUIZ CACHE HIT: Reusing existing quiz.");

      const { data: clonedQuiz, error: cloneError } = await supabase
        .from("quizzes")
        .insert([
          {
            session_id: sessionId,
            video_id: videoId,
            yt_video_id: currentVideo.yt_video_id,
            quiz_type: "video_quiz",
            questions: cachedQuiz.questions,
          },
        ])
        .select()
        .single();

      if (cloneError) {
        throw cloneError;
      }

      return NextResponse.json({
        success: true,
        quizId: clonedQuiz.id,
        cached: true,
      });
    }

    console.log("QUIZ CACHE MISS: Generating new quiz.");

    // =====================================================
    // GENERATE NEW QUIZ
    // =====================================================

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

    const cleanedResponse = responseText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const quizData = JSON.parse(cleanedResponse);

    // =====================================================
    // SAVE NEW QUIZ
    // =====================================================

    const { data: quizRecord, error: dbError } = await supabase
      .from("quizzes")
      .insert([
        {
          session_id: sessionId,
          video_id: videoId,
          yt_video_id: currentVideo.yt_video_id,
          quiz_type: "video_quiz",
          questions: quizData,
        },
      ])
      .select()
      .single();

    if (dbError) {
      throw dbError;
    }

    return NextResponse.json({
      success: true,
      quizId: quizRecord.id,
      cached: false,
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