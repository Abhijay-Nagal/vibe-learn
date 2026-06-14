"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

const quotes = [
  "Small progress each day compounds into mastery.",
  "Learning is not watching. Learning is recalling.",
  "Every revision strengthens memory.",
  "Building your neural pathways...",
  "Extracting the core concepts..."
];

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({
  message = "Processing...",
}: LoadingScreenProps) {
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-12 min-h-[400px] w-full animate-in fade-in duration-500">
      <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-8" />

      <div className="text-center space-y-4 max-w-md">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {message}
        </h3>

        <div className="h-12 flex items-center justify-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 italic transition-opacity duration-500 ease-in-out">
            "{quotes[quoteIndex]}"
          </p>
        </div>
      </div>
    </div>
  );
}