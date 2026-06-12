"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

// (Reusing the types from your previous quiz component)
type Question = {
  topic: string; question: string; options: string[]; 
  correctAnswer: string; explanationRight: string; explanationWrong: string;
};

export default function RevisionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [quizId, setQuizId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [weakTopics, setWeakTopics] = useState<string[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  const generateMasterQuiz = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate-master-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Fetch the generated quiz
      const { data: newQuiz } = await supabase.from("quizzes").select("*").eq("id", data.quizId).single();
      if (newQuiz) {
        setQuizId(newQuiz.id);
        setQuestions(newQuiz.questions);
        resetQuizState();
      }
    } catch (error: any) {
      alert(error.message || "Failed to generate revision.");
    } finally {
      setIsGenerating(false);
    }
  };

  const resetQuizState = () => {
    setCurrentIndex(0); setSelectedOption(null); setIsAnswered(false);
    setScore(0); setWeakTopics([]); setIsFinished(false);
  };

  const handleSelectOption = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option); setIsAnswered(true);
    const currentQ = questions[currentIndex];
    
    if (option === currentQ.correctAnswer) {
      setScore((prev) => prev + 1);
    } else {
      if (!weakTopics.includes(currentQ.topic)) setWeakTopics((prev) => [...prev, currentQ.topic]);
    }
  };

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null); setIsAnswered(false);
    } else {
      setIsFinished(true);
      if (quizId) {
        await supabase.from("quiz_attempts").insert([{
          quiz_id: quizId, score, total_questions: questions.length, weak_topics: weakTopics,
        }]);
      }
    }
  };

  // 1. Landing / Loading State
  if (questions.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
        <div className="text-center space-y-6 max-w-md">
          <h1 className="text-3xl font-bold">Master Revision</h1>
          <p className="text-zinc-500">We will analyze all your notes and target your weak spots to build a 20-question ultimate test.</p>
          <Button size="lg" className="w-full" onClick={generateMasterQuiz} disabled={isGenerating}>
            {isGenerating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Compiling AI Quiz...</> : "Generate Adaptive Quiz"}
          </Button>
          <Button variant="ghost" onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
        </div>
      </main>
    );
  }

  // 2. Finished State (The Endless Loop)
  if (isFinished) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
        <div className="text-center bg-white dark:bg-zinc-900 p-8 rounded-xl shadow-lg border space-y-6 max-w-md w-full">
          <h2 className="text-3xl font-bold">Revision Complete!</h2>
          <p className="text-xl">You scored {score} out of {questions.length}</p>
          <div className="space-y-3 pt-4">
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => setQuestions([])}>
              Next Quiz (Target Weaknesses)
            </Button>
            <Button className="w-full" variant="outline" onClick={() => router.push("/dashboard")}>
              End Revision & Return
            </Button>
          </div>
        </div>
      </main>
    );
  }

  // 3. Active Quiz State
  const currentQ = questions[currentIndex];
  const isCorrect = selectedOption === currentQ.correctAnswer;

  return (
    <main className="min-h-screen p-4 md:p-8 bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center">
      <div className="w-full max-w-3xl space-y-4">
        <header className="flex justify-between items-center mb-4">
          <span className="text-zinc-500 font-medium">Question {currentIndex + 1} of {questions.length}</span>
          <Button variant="ghost" className="text-red-600" onClick={() => router.push("/dashboard")}>Exit</Button>
        </header>

        <Card className="w-full shadow-lg border-zinc-200 dark:border-zinc-800">
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl leading-relaxed">{currentQ.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentQ.options.map((option, idx) => {
              let btnClass = "w-full justify-start text-left h-auto py-4 px-6 text-md font-normal whitespace-normal ";
              if (isAnswered) {
                if (option === currentQ.correctAnswer) btnClass += "bg-green-600 hover:bg-green-700 text-white";
                else if (option === selectedOption) btnClass += "bg-red-600 hover:bg-red-700 text-white";
                else btnClass += "opacity-50 cursor-not-allowed";
              }
              return (
                <Button key={idx} variant="outline" className={btnClass} onClick={() => handleSelectOption(option)} disabled={isAnswered}>
                  {option}
                </Button>
              );
            })}
          </CardContent>

          {isAnswered && (
            <CardFooter className="flex-col items-start bg-zinc-50 dark:bg-zinc-900 border-t p-6 rounded-b-xl">
              <div className="w-full mb-4">
                <h4 className={`font-bold mb-2 ${isCorrect ? "text-green-600" : "text-red-600"}`}>
                  {isCorrect ? "Correct!" : "Incorrect"}
                </h4>
                <p className="text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed">
                  {isCorrect ? currentQ.explanationRight : currentQ.explanationWrong}
                </p>
              </div>
              <Button onClick={handleNext} className="w-full">
                {currentIndex < questions.length - 1 ? "Next Question" : "Finish Revision"}
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </main>
  );
}