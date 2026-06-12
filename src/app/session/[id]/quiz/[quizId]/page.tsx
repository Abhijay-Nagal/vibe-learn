"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

type Question = {
  topic: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanationRight: string;
  explanationWrong: string;
};

type QuizData = {
  id: string;
  questions: Question[];
};

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.quizId as string;

  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  
  // State for the endless revision loop
  const [score, setScore] = useState(0);
  const [weakTopics, setWeakTopics] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      const { data, error } = await supabase
        .from("quizzes")
        .select("*")
        .eq("id", quizId)
        .single();

      if (error) {
        console.error("Failed to fetch quiz:", error);
      } else {
        setQuiz(data);
      }
    };
    fetchQuiz();
  }, [quizId]);

  const handleSelectOption = (option: string) => {
    if (isAnswered || !quiz) return;
    
    setSelectedOption(option);
    setIsAnswered(true);

    const currentQ = quiz.questions[currentIndex];
    
    if (option === currentQ.correctAnswer) {
      setScore((prev) => prev + 1);
    } else {
      // Track the topic the user failed for adaptive revision later
      if (!weakTopics.includes(currentQ.topic)) {
        setWeakTopics((prev) => [...prev, currentQ.topic]);
      }
    }
  };

  const handleNext = async () => {
    if (!quiz) return;

    if (currentIndex < quiz.questions.length - 1) {
      // Move to next question
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      // Finish Quiz and Save Attempt
      setIsSaving(true);
      const { error } = await supabase.from("quiz_attempts").insert([
        {
          quiz_id: quizId,
          score: score,
          total_questions: quiz.questions.length,
          weak_topics: weakTopics,
        },
      ]);

      if (error) {
        console.error("Failed to save attempt:", error);
        alert("Failed to save your score, but you can return to the dashboard.");
      }
      router.push("/dashboard"); // Route back to the main dashboard
    }
  };

  const handleExit = () => {
    if (window.confirm("Are you sure you want to exit? Your progress will not be saved.")) {
      router.push("/dashboard");
    }
  };

  if (!quiz) {
    return <div className="flex min-h-screen items-center justify-center">Loading quiz...</div>;
  }

  const currentQ = quiz.questions[currentIndex];
  const isCorrect = selectedOption === currentQ.correctAnswer;

  return (
    <main className="min-h-screen p-4 md:p-8 bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center">
      <div className="w-full max-w-3xl space-y-4">
        
        <header className="flex justify-between items-center mb-8">
          <span className="text-zinc-500 font-medium">
            Question {currentIndex + 1} of {quiz.questions.length}
          </span>
          <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleExit}>
            Exit Quiz
          </Button>
        </header>

        <Card className="w-full shadow-lg border-zinc-200 dark:border-zinc-800">
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl leading-relaxed">
              {currentQ.question}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentQ.options.map((option, idx) => {
              // Determine styling based on whether the question has been answered
              let buttonVariant: "outline" | "default" | "destructive" = "outline";
              let buttonClasses = "w-full justify-start text-left h-auto py-4 px-6 text-md font-normal whitespace-normal";

              if (isAnswered) {
                if (option === currentQ.correctAnswer) {
                  buttonVariant = "default";
                  buttonClasses += " bg-green-600 hover:bg-green-700 text-white border-transparent";
                } else if (option === selectedOption) {
                  buttonVariant = "destructive";
                  buttonClasses += " border-transparent";
                } else {
                  buttonClasses += " opacity-50 cursor-not-allowed";
                }
              }

              return (
                <Button
                  key={idx}
                  variant={buttonVariant}
                  className={buttonClasses}
                  onClick={() => handleSelectOption(option)}
                  disabled={isAnswered}
                >
                  {option}
                </Button>
              );
            })}
          </CardContent>

          {/* Explanation Box appears instantly after answering */}
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
              <Button onClick={handleNext} className="w-full" disabled={isSaving}>
                {isSaving ? "Saving Results..." : currentIndex < quiz.questions.length - 1 ? "Next Question" : "Finish Quiz"}
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </main>
  );
}