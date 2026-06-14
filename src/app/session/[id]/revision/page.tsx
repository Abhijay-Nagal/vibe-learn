"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client"; // Ensure correct client import
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, Sparkles, Target, CheckCircle2, XCircle, ArrowRight, BrainCircuit, RotateCcw, AlertCircle } from "lucide-react";

type Question = {
  topic: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanationRight: string;
  explanationWrong: string;
};

export default function RevisionPage() {
  const params = useParams();
const router = useRouter();
const supabase = createClient();
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
    setCurrentIndex(0); 
    setSelectedOption(null); 
    setIsAnswered(false);
    setScore(0); 
    setWeakTopics([]); 
    setIsFinished(false);
  };

  const handleSelectOption = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option); 
    setIsAnswered(true);
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
      setSelectedOption(null); 
      setIsAnswered(false);
    } else {
      setIsFinished(true);
      if (quizId) {
        await supabase.from("quiz_attempts").insert([{
          quiz_id: quizId, 
          score, 
          total_questions: questions.length, 
          weak_topics: weakTopics,
        }]);
      }
    }
  };

  // ==========================================
  // 1. Landing / Pre-Flight State
  // ==========================================
  if (questions.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background p-6">
        <Card className="max-w-lg w-full border-border shadow-md">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <BrainCircuit className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold text-foreground">Master Revision</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6 pt-4">
            <p className="text-muted-foreground leading-relaxed">
              We will analyze all your notes, videos, and past performance in this session to build a highly targeted adaptive test to close your knowledge gaps.
            </p>
            <div className="space-y-3">
              <Button size="lg" className="w-full bg-ai hover:bg-ai/90 text-ai-foreground text-md font-semibold transition-transform active:scale-[0.98]" onClick={generateMasterQuiz} disabled={isGenerating}>
                {isGenerating ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Compiling AI Analysis...</>
                ) : (
                  <><Sparkles className="mr-2 h-5 w-5" /> Generate Adaptive Quiz</>
                )}
              </Button>
              <Button variant="ghost" className="w-full text-muted-foreground hover:text-foreground" onClick={() => router.push("/dashboard")} disabled={isGenerating}>
                Return to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  // ==========================================
  // 2. Finished State (Analytics & Loop)
  // ==========================================
  if (isFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    const isMastery = percentage >= 80;

    return (
      <main className="min-h-screen flex items-center justify-center bg-background p-6">
        <Card className="max-w-md w-full border-border shadow-md overflow-hidden">
          <div className={`h-2 w-full ${isMastery ? 'bg-success' : 'bg-primary'}`} />
          <CardHeader className="text-center pb-2 pt-8">
            <CardTitle className="text-3xl font-bold text-foreground">Revision Complete</CardTitle>
            <p className="text-muted-foreground mt-2">Here is your performance breakdown.</p>
          </CardHeader>
          
          <CardContent className="space-y-8 pt-6">
            <div className="flex flex-col items-center justify-center">
              <div className="text-6xl font-black text-foreground">{percentage}%</div>
              <div className="text-sm font-medium text-muted-foreground mt-1 uppercase tracking-widest">
                {score} / {questions.length} Correct
              </div>
            </div>

            {weakTopics.length > 0 ? (
              <div className="space-y-3 bg-muted/50 p-4 rounded-xl border border-border">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                  <AlertCircle className="w-4 h-4 text-destructive" /> Identified Knowledge Gaps
                </div>
                <div className="flex flex-wrap gap-2">
                  {weakTopics.map((topic, idx) => (
                    <span key={idx} className="bg-background border border-border text-foreground px-3 py-1 text-xs font-medium rounded-full shadow-sm">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-success/10 text-success p-4 rounded-xl border border-success/20 flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 shrink-0" />
                <p className="text-sm font-medium">Excellent work. No major knowledge gaps identified in this run.</p>
              </div>
            )}

            <div className="space-y-3 pt-2">
              <Button className="w-full bg-ai hover:bg-ai/90 text-ai-foreground font-semibold shadow-sm transition-transform active:scale-[0.98]" onClick={() => setQuestions([])}>
                <RotateCcw className="mr-2 h-4 w-4" /> Next Loop (Target Weaknesses)
              </Button>
              <Button className="w-full border-border text-muted-foreground hover:bg-secondary hover:text-foreground" variant="outline" onClick={() => router.push("/dashboard")}>
                End Revision & Return
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  // ==========================================
  // 3. Active Quiz State (Mirrors Phase 4)
  // ==========================================
  const currentQ = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const isCorrect = selectedOption === currentQ.correctAnswer;

  return (
    <main className="min-h-screen p-6 md:p-12 bg-background flex flex-col items-center">
      <div className="w-full max-w-2xl space-y-6">
        
        {/* Progress & Header */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium text-muted-foreground">
            <span>Adaptive Revision Progress</span>
            <span>{currentIndex + 1} / {questions.length}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl font-bold leading-snug text-foreground">
              {currentQ.question}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentQ.options.map((option, idx) => {
              const isSelected = option === selectedOption;
              const isCorrectOption = option === currentQ.correctAnswer;
              
              let baseClasses = "w-full justify-start h-auto py-4 px-6 text-md font-normal whitespace-normal transition-all text-left";
              
              if (isAnswered) {
                if (isCorrectOption) baseClasses += " bg-success text-success-foreground border-success hover:bg-success";
                else if (isSelected && !isCorrect) baseClasses += " bg-destructive text-destructive-foreground border-destructive hover:bg-destructive";
                else baseClasses += " opacity-50";
              }

              return (
                <Button 
                  key={idx} 
                  variant={isAnswered ? "outline" : "outline"} 
                  className={baseClasses} 
                  onClick={() => handleSelectOption(option)} 
                  disabled={isAnswered}
                >
                  {option}
                </Button>
              );
            })}
          </CardContent>

          {/* Inline Semantic Feedback */}
          {isAnswered && (
            <div className="px-6 pb-6 animate-in slide-in-from-bottom-4 duration-300">
              <div className={`p-4 rounded-xl mb-4 flex gap-3 ${isCorrect ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                {isCorrect ? <CheckCircle2 className="shrink-0" /> : <XCircle className="shrink-0" />}
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider opacity-80 mb-1 block">
                    Target Topic: {currentQ.topic}
                  </span>
                  <p className="text-sm font-medium">
                    {isCorrect ? currentQ.explanationRight : currentQ.explanationWrong}
                  </p>
                </div>
              </div>
              <Button onClick={handleNext} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                {currentIndex < questions.length - 1 ? "Next Question" : "View Analytics"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}