# ARIA: The Voice AI Co-Teacher

**Built for the EchoSphere Hackathon**

ARIA is a real-time, intelligent Voice AI Co-Teacher designed to solve the "silent student" problem in online classrooms. Instead of a teacher lecturing to a wall of muted microphones, ARIA joins the video call as an active participant, helping to explain complex topics, detect learning gaps, and encourage student participation—all in real-time with sub-500ms latency.

## 🚀 Features

- **Real-Time Video Classroom:** Seamless, low-latency video and audio rooms supporting multiple participants (Teacher & Students).
- **Agora Conversational AI:** ARIA is powered natively by the **Agora Conversational AI Engine**, meaning she joins the call via Agora's backend servers, eliminating client-side processing bottlenecks.
- **Learning Gaps & Summaries:** At the end of a session, teachers receive an AI-generated summary of student insights and learning gaps (powered by Groq).
- **Responsive UI:** A beautiful, modern glassmorphism interface built with Tailwind CSS.

## 🛠️ Tech Stack

- **Frontend:** Next.js 14, React, Tailwind CSS
- **Database & Auth:** Supabase (PostgreSQL)
- **Video/Audio Layer:** Agora RTC Web SDK
- **AI Engine (ARIA):** Agora Conversational AI SDK (`agora-agents`) using Agora-managed OpenAI and MiniMax models.
- **Summaries:** Groq (`llama-3.3-70b-versatile`)

## 💻 Running Locally

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
   # Supabase (Database)
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

   # Agora (Video & Conversational AI)
   NEXT_PUBLIC_AGORA_APP_ID=your_agora_app_id
   AGORA_APP_CERTIFICATE=your_agora_certificate

   # Groq (For Post-Class Summaries)
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
*Built with ❤️ for EchoSphere.*
