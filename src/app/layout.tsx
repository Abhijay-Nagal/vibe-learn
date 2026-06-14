import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/context/UserContext";
import { ThemeProvider } from "@/components/ThemeProvider";

// Primary Font for Dashboard & Workflows
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Display Font strictly for Landing Page Hero
const poppins = Poppins({
  weight: ["700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VibeLearn | AI-Powered Learning Platform",
  description: "Transform passive video consumption into active learning. Convert educational YouTube videos into structured notes and adaptive quizzes using AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${poppins.variable} h-full antialiased`}
      suppressHydrationWarning // Good practice for future dark-mode theme providers
    >
      <body className="min-h-full flex flex-col font-sans">
        <ThemeProvider
  attribute="class"
  defaultTheme="system"
  enableSystem
  disableTransitionOnChange
>
  <UserProvider>{children}</UserProvider>
</ThemeProvider>
      </body>
    </html>
  );
}