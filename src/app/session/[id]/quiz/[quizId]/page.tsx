"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, ArrowRight, BrainCircuit } from "lucide-react";

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
  const sessionId = params.id as string;

  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
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
      if (error) console.error("Failed to fetch quiz:", error);
      else setQuiz(data);
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
    } else if (!weakTopics.includes(currentQ.topic)) {
      setWeakTopics((prev) => [...prev, currentQ.topic]);
    }
  };

  const handleNext = async () => {
    if (!quiz) return;
    if (currentIndex < quiz.questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsSaving(true);
      await supabase.from("quiz_attempts").insert([{
        quiz_id: quizId,
        score,
        total_questions: quiz.questions.length,
        weak_topics: weakTopics,
      }]);
      router.push(`/session/${sessionId}`); 
    }
  };

  if (!quiz) return <div className="flex min-h-screen items-center justify-center">Loading assessment...</div>;

  const currentQ = quiz.questions[currentIndex];
  const progress = ((currentIndex + 1) / quiz.questions.length) * 100;
  const isCorrect = selectedOption === currentQ.correctAnswer;

  return (
    <main className="min-h-screen p-6 md:p-12 bg-background flex flex-col items-center">
      <div className="w-full max-w-2xl space-y-6">
        
        {/* Progress & Header */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium text-muted-foreground">
            <span>Progress</span>
            <span>{currentIndex + 1} / {quiz.questions.length}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl font-bold leading-snug">
              {currentQ.question}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentQ.options.map((option, idx) => {
              const isSelected = option === selectedOption;
              const isCorrectOption = option === currentQ.correctAnswer;
              
              let baseClasses = "w-full justify-start h-auto py-4 px-6 text-md font-normal whitespace-normal transition-all";
              
              if (isAnswered) {
                if (isCorrectOption) baseClasses += " bg-success text-success-foreground border-success hover:bg-success";
                else if (isSelected && !isCorrect) baseClasses += " bg-destructive text-destructive-foreground border-destructive hover:bg-destructive";
                else baseClasses += " opacity-50";
              }

              return (
                <Button key={idx} variant={isAnswered ? "outline" : "outline"} className={baseClasses} onClick={() => handleSelectOption(option)} disabled={isAnswered}>
                  {option}
                </Button>
              );
            })}
          </CardContent>

          {/* Inline Feedback */}
          {isAnswered && (
            <div className="px-6 pb-6 animate-in slide-in-from-bottom-4 duration-300">
              <div className={`p-4 rounded-xl mb-4 flex gap-3 ${isCorrect ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                {isCorrect ? <CheckCircle2 className="shrink-0" /> : <XCircle className="shrink-0" />}
                <p className="text-sm font-medium">
                  {isCorrect ? currentQ.explanationRight : currentQ.explanationWrong}
                </p>
              </div>
              <Button onClick={handleNext} className="w-full bg-ai hover:bg-ai/90" disabled={isSaving}>
                {isSaving ? "Finalizing..." : (currentIndex < quiz.questions.length - 1 ? "Next Question" : "Complete Quiz")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}