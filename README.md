# 🧠 VibeLearn

### AI-Powered Learning and Adaptive Revision Platform

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-Blue?style=flat&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Green?style=flat&logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-blue?style=flat&logo=tailwind-css)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue?style=flat&logo=postgresql)
![Groq](https://img.shields.io/badge/AI-Groq_Llama_3.3-purple?style=flat)

VibeLearn is an AI-powered learning platform that transforms educational YouTube videos into structured study notes, AI-generated quizzes, and adaptive revision sessions. Built with Next.js, Supabase, PostgreSQL, and Llama 3.3, it helps students move beyond passive video consumption toward active learning.

🌐 **Live Application:** https://vibe-learn-vert.vercel.app

🎥 **Demo Video:** https://www.youtube.com/watch?v=QPJMyy4IJ7c

---

# 🚀 Evolution of VibeLearn

VibeLearn was not built in a single iteration.

The project began as a functional MVP that demonstrated the complete AI learning workflow—from YouTube transcript extraction to AI-generated notes and quizzes. Rather than rebuilding the application from scratch, Version 2.0 focused on solving real engineering challenges encountered while scaling the MVP, including authentication, database architecture, caching, deployment performance, and user experience.

The result is a significantly more secure, scalable, and maintainable platform while preserving the original learning workflow.

---

## Version Comparison

| Version 1 (MVP) | Version 2.0 |
|-----------------|-------------|
| Custom Authentication | Supabase Authentication |
| LocalStorage-based user management | Secure server-side authentication |
| Email authentication | Google OAuth + Email Authentication |
| Basic dashboard | Analytics Dashboard |
| Notes regenerated every request | Intelligent Global Notes Cache |
| Quiz regenerated every request | Intelligent Global Quiz Cache |
| Basic interface | Complete UI redesign |
| No Dark Mode | Semantic Dark Mode |
| Basic revision workflow | Adaptive Master Revision |
| Prototype architecture | Production-ready architecture |

---

# 📜 Project History

## Version 1 (Legacy MVP)

The original MVP demonstrates the first working implementation of VibeLearn. It successfully introduced the complete AI-powered learning workflow, including transcript extraction, AI-generated study notes, contextual quizzes, and adaptive revision.

To preserve the project's engineering journey, the original implementation has been retained as a dedicated legacy branch.

🔗 **Legacy Branch (Version 1):**

https://github.com/Abhijay-Nagal/vibe-learn/tree/legacy-v1-mvp

---

## Version 2.0 (Current)

Version 2.0 transforms the original MVP into a significantly more scalable and production-ready application by redesigning authentication, improving database architecture, introducing intelligent caching, enhancing the user interface, and optimizing performance while maintaining the original learning experience.

🔗 **Main Branch:**

https://github.com/Abhijay-Nagal/vibe-learn

---

# ✨ Core Features

## 📖 AI Learning Workspace

- Convert educational YouTube videos into structured study sessions
- Automatic transcript extraction
- AI-generated Markdown study notes
- Organized session management
- Notes-only study mode
- Embedded YouTube workspace

---

## 📝 AI Quiz Generation

- Generate contextual quizzes from video content
- Instant evaluation and scoring
- Correct answer explanations
- Quiz performance tracking
- Session-wise quiz history

---

## 🎯 Adaptive Master Revision

- Automatically detect weak concepts
- Aggregate knowledge gaps
- Generate targeted revision quizzes
- Personalized learning loop
- Continuous mastery improvement

---

## ⚡ Intelligent Caching

Version 2.0 introduces an intelligent caching layer to reduce redundant AI processing.

- Global Notes Cache using YouTube Video IDs
- Global Video Quiz Cache
- Eliminates duplicate transcript extraction
- Reduces Groq API usage
- Faster response times for previously processed videos

---

## 🔒 Authentication & Security

- Supabase Authentication
- Google OAuth
- Secure server-side API authentication
- Protected routes
- Session ownership validation
- Delete Account functionality
- Logout functionality

---

## 📊 Analytics Dashboard

- Total Study Sessions
- Videos Processed
- Quizzes Attempted
- Average Quiz Performance
- Personalized learning overview

---

## 🎨 User Experience

- Fully responsive interface
- Premium dashboard layout
- Collapsible sidebar navigation
- Semantic Dark Mode
- Theme switching
- Improved loading experience
- Confirmation dialogs
- Better navigation flow

---

# 🏗️ System Architecture

VibeLearn follows a full-stack architecture built using the Next.js App Router, Supabase, PostgreSQL, and Groq AI.

### Learning Workflow

```
User Login
      │
      ▼
Create Study Session
      │
      ▼
Paste YouTube URL
      │
      ▼
Transcript Extraction
      │
      ▼
Check Global Notes Cache
      │
      ├──────────────► Cached Notes Found
      │                    │
      ▼                    ▼
Generate AI Notes     Reuse Cached Notes
      │
      ▼
Generate / Reuse Quiz
      │
      ▼
Attempt Quiz
      │
      ▼
Track Weak Topics
      │
      ▼
Generate Adaptive Revision Quiz
      │
      ▼
Improve Learning
```

---

# 🛠️ Tech Stack

### Frontend

- Next.js 14 (App Router)
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Markdown
- Lucide React

### Backend

- Next.js API Routes
- TypeScript

### Database

- Supabase PostgreSQL
- PostgreSQL RPC Functions

### Authentication

- Supabase Authentication
- Google OAuth

### AI

- Groq API
- Llama 3.3 70B Versatile

### Utilities

- youtube-transcript
- React Markdown

### Deployment

- Vercel

---

# 💡 Engineering Highlights

Version 2.0 focused on improving scalability, security, and overall system architecture.

Major engineering improvements include:

- Migrated from custom authentication to Supabase Authentication
- Integrated Google OAuth
- Implemented secure server-side authentication
- Added user profile management
- Built intelligent global notes caching
- Built intelligent global quiz caching
- Eliminated duplicate video processing
- Added Notes-only Mode
- Added Delete Account functionality
- Added Delete Session functionality
- Added confirmation dialogs
- Redesigned the dashboard
- Redesigned the session workspace
- Redesigned the quiz interface
- Added analytics dashboard
- Added semantic Dark Mode
- Added responsive sidebar navigation
- Optimized AI API usage
- Improved database architecture
- Enhanced deployment performance
- Improved loading experience
- Improved navigation flow

---

# 💻 Local Installation

### Clone the repository

```bash
git clone https://github.com/Abhijay-Nagal/vibe-learn.git
```

### Navigate into the project

```bash
cd vibe-learn
```

### Install dependencies

```bash
npm install
```

### Create a `.env.local` file

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url

NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

GROQ_API_KEY=your_groq_api_key

SUPADATA_API_KEY=your_supadata_api_key
```

### Run the development server

```bash
npm run dev
```

Open:

```
http://localhost:3000
```

---

# 🔮 Future Scope

Future enhancements planned for VibeLearn include:

- AI-generated flashcards
- Spaced repetition learning
- PDF and document-based learning
- Multi-video study sessions
- Semantic search across notes
- Study streaks and achievements
- Mobile application
- Collaborative study sessions
- AI tutor / conversational learning assistant
- Personalized learning recommendations

---

# 👨‍💻 Author

## Abhijay Nagal

Computer Science and Engineering Student  
Thapar Institute of Engineering and Technology

### Connect

**GitHub**

https://github.com/Abhijay-Nagal

**LinkedIn**

https://www.linkedin.com/in/abhijay-nagal

---

## ⭐ Support the Project

If you found VibeLearn interesting or helpful, consider giving the repository a **Star ⭐**.

It helps others discover the project and motivates further development.
