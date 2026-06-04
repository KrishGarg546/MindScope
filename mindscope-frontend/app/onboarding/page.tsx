"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Brain, Sparkles } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function OnboardingPage() {

  const router = useRouter()

  // ==================================================
  // USER STATES
  // ==================================================

  const [userName, setUserName] = useState("")
  const [aiName, setAiName] = useState("MindScope")

  // ==================================================
  // PERSONALITY STATES
  // ==================================================

  const [tone, setTone] = useState("Chill & casual")

  const [replyLength, setReplyLength] = useState(
    "Balanced"
  )

  const [humor, setHumor] = useState(
    "occasionally"
  )

  const [supportStyle, setSupportStyle] = useState(
    "Just venting"
  )

  const [energyMatch, setEnergyMatch] = useState(
    "yes naturally"
  )

  // ==================================================
  // CONTINUE
  // ==================================================

  const continueToChat = async () => {

    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) return

    const profile = {

      user_id: user.id,

      user_name: userName,

      ai_name: aiName || "MindScope",

      tone,
      reply_length: replyLength,
      humor,
      support_style: supportStyle,
      energy_match: energyMatch
    }

    // SAVE TO SUPABASE
    await supabase
      .from("user_profiles")
      .upsert(profile)

    // SAVE LOCALLY
    localStorage.setItem(
      "mindscope_profile",
      JSON.stringify(profile)
    )

    router.push("/chat")
  }

  // ==================================================
  // UI
  // ==================================================

  return (

    <main className="min-h-screen bg-black text-white overflow-hidden relative flex items-center justify-center px-6 py-20">

      {/* BACKGROUND */}
      <div className="absolute inset-0">

        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-600/20 blur-[160px]" />

        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/20 blur-[160px]" />

      </div>

      {/* CARD */}
      <motion.div

        initial={{ opacity: 0, y: 30 }}

        animate={{ opacity: 1, y: 0 }}

        transition={{ duration: 0.6 }}

        className="relative z-10 w-full max-w-3xl rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-10"
      >

        {/* HEADER */}
        <div className="flex items-center gap-4 mb-10">

          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/20">

            <Brain className="w-8 h-8 text-white" />

          </div>

          <div>

            <h1 className="text-4xl font-bold">
              Build Your AI Companion
            </h1>

            <p className="text-white/50 mt-1">
              personalize how your AI talks, reacts, and understands you
            </p>

          </div>

        </div>

        {/* FORM */}
        <div className="space-y-8">

          {/* USER NAME */}
          <div>

            <label className="text-sm text-white/60 block mb-2">
              Your Name
            </label>

            <input
              type="text"
              placeholder="Enter your name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-purple-500"
            />

          </div>

          {/* AI NAME */}
          <div>

            <label className="text-sm text-white/60 block mb-2">
              Your AI's Name
            </label>

            <input
              type="text"
              placeholder="MindScope"
              value={aiName}
              onChange={(e) => setAiName(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-white/5 border border-white/10 outline-none focus:border-blue-500"
            />

          </div>

          {/* TONE */}
          <div>

            <label className="text-sm text-white/60 block mb-3">
              Conversation Tone
            </label>

            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-black border border-white/10"
            >
              <option>Chill & casual</option>
              <option>Calm & thoughtful</option>
              <option>Supportive & warm</option>
              <option>Funny & playful</option>
              <option>Straightforward & honest</option>
              <option>Deep & reflective</option>
            </select>

          </div>

          {/* REPLY LENGTH */}
          <div>

            <label className="text-sm text-white/60 block mb-3">
              Reply Length
            </label>

            <select
              value={replyLength}
              onChange={(e) => setReplyLength(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-black border border-white/10"
            >
              <option>Short & quick</option>
              <option>Balanced</option>
              <option>Detailed conversations</option>
            </select>

          </div>

          {/* HUMOR */}
          <div>

            <label className="text-sm text-white/60 block mb-3">
              Humor Style
            </label>

            <select
              value={humor}
              onChange={(e) => setHumor(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-black border border-white/10"
            >
              <option>yes please</option>
              <option>occasionally</option>
              <option>not really</option>
            </select>

          </div>

          {/* SUPPORT STYLE */}
          <div>

            <label className="text-sm text-white/60 block mb-3">
              What helps you most?
            </label>

            <select
              value={supportStyle}
              onChange={(e) => setSupportStyle(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-black border border-white/10"
            >
              <option>Being comforted</option>
              <option>Practical advice</option>
              <option>Just venting</option>
              <option>Distraction & casual conversation</option>
            </select>

          </div>

          {/* ENERGY MATCH */}
          <div>

            <label className="text-sm text-white/60 block mb-3">
              Emotional Energy Style
            </label>

            <select
              value={energyMatch}
              onChange={(e) => setEnergyMatch(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-black border border-white/10"
            >
              <option>yes naturally</option>
              <option>stay calm always</option>
              <option>depends on the situation</option>
            </select>

          </div>

          {/* BUTTON */}
          <motion.button

            whileHover={{ scale: 1.02 }}

            whileTap={{ scale: 0.98 }}

            onClick={continueToChat}

            className="w-full py-5 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 font-semibold text-lg flex items-center justify-center gap-3 shadow-xl shadow-purple-500/20"
          >

            <Sparkles className="w-5 h-5" />

            Continue To MindScope

          </motion.button>

        </div>

      </motion.div>

    </main>
  )
}