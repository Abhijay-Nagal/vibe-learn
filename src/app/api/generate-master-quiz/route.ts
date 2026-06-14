import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { groq } from "@/lib/groq";


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
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing sessionId" },
        { status: 400 }
      );
    }

    // 1. Fetch all notes for the session
    const { data: videos, error: videoError } = await supabase
      .from("videos")
      .select("notes")
      .eq("session_id", sessionId);

    if (videoError || !videos || videos.length === 0) {
      return NextResponse.json(
        { error: "No notes found for this session." },
        { status: 400 }
      );
    }

    const allNotes = videos
      .map((video) => video.notes)
      .join("\n\n---\n\n");

    // 2. Fetch previous weak topics
    const { data: quizzes } = await supabase
      .from("quizzes")
      .select("id")
      .eq("session_id", sessionId);

    let weakTopics: string[] = [];

    if (quizzes && quizzes.length > 0) {
      const quizIds = quizzes.map((quiz) => quiz.id);

      const { data: attempts } = await supabase
        .from("quiz_attempts")
        .select("weak_topics")
        .in("quiz_id", quizIds);

      if (attempts) {
        attempts.forEach((attempt: any) => {
          if (
            attempt.weak_topics &&
            Array.isArray(attempt.weak_topics)
          ) {
            weakTopics.push(...attempt.weak_topics);
          }
        });
      }
    }

    const uniqueWeakTopics = [...new Set(weakTopics)];

    // 3. Generate adaptive master quiz
    const prompt = `You are an expert technical mentor.

Generate a comprehensive 20-question multiple-choice revision quiz based strictly on the provided study notes.

IMPORTANT:
The learner has historically struggled with these topics:

${uniqueWeakTopics.join(", ") || "None"}

Ensure a significant portion of the quiz targets these weak areas while still covering the full study material.

Return ONLY a valid JSON array.

Schema:

[
  {
    "topic": "Core concept being tested",
    "question": "Question text",
    "options": [
      "Option A",
      "Option B",
      "Option C",
      "Option D"
    ],
    "correctAnswer": "Exact correct option string",
    "explanationRight": "Short positive explanation",
    "explanationWrong": "Short corrective explanation"
  }
]

Study Notes:

${allNotes.substring(0, 50000)}
`;

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
      throw new Error("Empty revision quiz response");
    }

    const cleanedResponse = responseText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const quizData = JSON.parse(cleanedResponse);

    // 4. Save quiz
    const { data: quizRecord, error: dbError } = await supabase
      .from("quizzes")
      .insert([
        {
          session_id: sessionId,
          quiz_type: "revision_master",
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
    });
  } catch (error: any) {
    console.error("Master Quiz Error:", error);

    return NextResponse.json(
      {
        error:
          error.message || "Failed to generate master quiz.",
      },
      { status: 500 }
    );
  }
}