# ARIA: The AI Voice Co-Teacher
**Built for the EchoSphere Hackathon**

[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/Version-1.0.0-emerald.svg)](https://github.com/saksham456456/Aria/releases)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)

ARIA is a real-time, intelligent Voice AI Co-Teacher designed to solve the "silent student" problem in online classrooms. Instead of a teacher lecturing to a wall of muted microphones, ARIA joins the video call as an active participant, helping to explain complex topics, detect learning gaps, and encourage student participation—all in real-time with sub-500ms latency.

## ?? Key Features

*   **Real-Time Video Classroom:** Seamless, low-latency video and audio rooms supporting multiple participants (Teacher & Students).
*   **Agora Conversational AI:** ARIA is powered natively by the **Agora Conversational AI Engine**. She possesses deep social awareness, utilizing the **Socratic Method** to gently guide struggling students without interrupting the main teacher.
*   **Live Confusion Radar:** An animated, glassmorphic UI radar that actively monitors the classroom for confusion (e.g., "how", "why", "this is hard") and visualizes learning friction in real-time.
*   **Auto-Spawning Pop Quizzes:** The teacher can instantly deploy AI-generated multiple-choice quizzes based on the last 5 minutes of transcript. Powered by Groq and broadcasted instantly to all students via Supabase Realtime WebSockets.
*   **Agent Brain Terminal:** A cyberpunk-inspired side panel that visualizes the AI's "internal thoughts", streaming STT intercepts and LLM reasoning logs live to the teacher.
*   **Post-Class Analytics:** At the end of a session, teachers receive an AI-generated summary of student insights and learning gaps.

## ??? Tech Stack

*   **Frontend:** Next.js 14, React, Tailwind CSS, Lucide Icons
*   **Database & Real-Time Sync:** Supabase (PostgreSQL + WebSockets)
*   **Video/Audio Layer:** Agora RTC Web SDK
*   **Voice AI Engine (ARIA):** Agora Conversational AI SDK (`agora-agents`) using `gpt-4o-mini` and MiniMax TTS.
*   **LLM Inference:** Groq (`llama-3.3-70b-versatile`) for instant Pop Quizzes and Post-Class Summaries.

## ?? Running Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/saksham456456/Aria.git
   cd Aria
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env.local` file in the root directory and add the following keys:
   ```env
   # Supabase (Database & Real-Time)
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key

   # Agora (Video & Conversational AI)
   NEXT_PUBLIC_AGORA_APP_ID=your_agora_app_id
   AGORA_APP_CERTIFICATE=your_agora_certificate

   # Groq (For Pop Quizzes & Summaries)
   GROQ_API_KEY=your_groq_api_key
   ```
   *Note: Ensure that the Conversational AI Engine is toggled ON in your Agora Console so the managed AI models function properly.*

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Test the Application:**
   Open `http://localhost:3000` in two different browsers (or one Incognito window) to simulate a Teacher and a Student joining the same classroom!

---
*Built with ?? for the EchoSphere Hackathon.*

