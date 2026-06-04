"use client";

import { useEffect, useState } from "react";

import {
  Send,
  Settings,
  LogOut,
  X,
  User,
  Brain,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

import { useRouter } from "next/navigation";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Conversation {
  id: string;
  title: string;
}

export default function ChatPage() {

  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "hey. i'm glad you're here :)",
    },
  ]);

  const [input, setInput] = useState("");

  const [loading, setLoading] = useState(false);

  const [emotion, setEmotion] =
  useState("neutral");

  const [profile, setProfile] = useState<any>({});

  const [showProfile, setShowProfile] =
    useState(false);

  const [conversations, setConversations] =
    useState<Conversation[]>([]);

  const [
    currentConversationId,
    setCurrentConversationId,
  ] = useState<string | null>(null);

  // ============================================
  // LOAD INITIAL DATA
  // ============================================

  useEffect(() => {

    const loadData = async () => {

      // LOAD PERSONALITY PROFILE

      const savedProfile =
        localStorage.getItem(
          "mindscope_personality"
        );

      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      }

      // GET USER

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // LOAD CONVERSATIONS

      const { data } = await supabase
        .from("conversations")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        });

      if (data) {

        setConversations(data);

        if (data.length > 0) {

          loadConversation(data[0].id);

        } else {

          createNewConversation();
        }
      }
    };

    loadData();

  }, []);

  // ============================================
  // LOAD CONVERSATION
  // ============================================

  const loadConversation = async (
    conversationId: string
  ) => {

    setCurrentConversationId(
      conversationId
    );

    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq(
        "conversation_id",
        conversationId
      )
      .order("created_at", {
        ascending: true,
      });

    if (data) {

      setMessages(
        data.map((msg) => ({
          role: msg.role,
          content: msg.content,
        }))
      );
    }
  };

  // ============================================
  // CREATE NEW CHAT
  // ============================================

  const createNewConversation =
    async () => {

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } =
        await supabase
          .from("conversations")
          .insert([
            {
              user_id: user.id,
              title: "New Conversation",
            },
          ])
          .select()
          .single();

      if (data) {

        setConversations((prev) => [
          data,
          ...prev,
        ]);

        setCurrentConversationId(
          data.id
        );

        setMessages([
          {
            role: "assistant",
            content:
              "hey. i'm glad you're here :)",
          },
        ]);
      }
    };

  // ============================================
  // LOGOUT
  // ============================================

  const handleLogout = async () => {

    await supabase.auth.signOut();

    localStorage.removeItem(
      "mindscope_personality"
    );

    router.push("/login");
  };

  // ============================================
  // SEND MESSAGE
  // ============================================

  const handleSend = async () => {

    if (!input.trim() || loading) return;

    const currentInput = input;

    const userMessage: Message = {
      role: "user",
      content: currentInput,
    };

    setMessages((prev) => [
      ...prev,
      userMessage,
    ]);

    setInput("");
    const isFirstMessage =
  messages.length <= 1;

    setLoading(true);

    // SAVE USER MESSAGE
    if (
        currentConversationId &&
        isFirstMessage
      ) {
      
        let generatedTitle =
          currentInput
            .trim()
            .slice(0, 40);
      
        if (
          generatedTitle.length >= 40
        ) {
          generatedTitle += "...";
        }
      
        await supabase
          .from("conversations")
          .update({
            title: generatedTitle,
          })
          .eq(
            "id",
            currentConversationId
          );
      
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === currentConversationId
              ? {
                  ...conv,
                  title: generatedTitle,
                }
              : conv
          )
        );
      }

    if (currentConversationId) {

      await supabase
        .from("messages")
        .insert([
          {
            conversation_id:
              currentConversationId,

            role: "user",

            content: currentInput,
          },
        ]);
    }

    try {

      const res = await fetch(
        "http://127.0.0.1:8000/chat",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            message: currentInput,
          
            user_name:
              profile.user_name,

              user_id:
              (
                await supabase.auth.getUser()
              ).data.user?.id,
          
            ai_name:
              profile.ai_name,
          
            personality_profile:

              profile,
          
            memory: [],
          
            history: messages,
          }),
        }
      );

      const data = await res.json();
      console.log("API RESPONSE:", data);
      setEmotion(data.emotion);
      if (
        data.new_memories &&
        data.new_memories.length > 0
      ) {
      
        const {
          data: { user }
        } = await supabase.auth.getUser()
      
        for (const memory of data.new_memories) {
      
          await supabase
            .from("memories")
            .insert([
              {
                user_id: user?.id,
                memory,
              },
            ])
        }
      }
      const botMessage: Message = {
        role: "assistant",
        content: data.response,
      };

      setMessages((prev) => [
        ...prev,
        botMessage,
      ]);

      // SAVE AI MESSAGE

      if (currentConversationId) {

        await supabase
          .from("messages")
          .insert([
            {
              conversation_id:
                currentConversationId,

              role: "assistant",

              content: data.response,
            },
          ]);
      }

    } catch (err) {

      console.error(err);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "connection to mindscope failed.",
        },
      ]);
    }

    setLoading(false);
  };

  return (
    <main className="h-screen bg-black text-white flex overflow-hidden">

      {/* SIDEBAR */}

      <aside className="w-[280px] border-r border-white/10 bg-[#09090f] flex flex-col">

        {/* HEADER */}

        <div className="p-6 border-b border-white/10">

          <div className="flex items-center gap-3">

            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-lg font-bold shadow-lg shadow-purple-500/20">
              🧠
            </div>

            <div>

              <h1 className="text-xl font-semibold">
                {profile.ai_name || "MindScope"}
              </h1>

              <p className="text-xs text-white/40">
                emotionally adaptive AI
              </p>

            </div>
          </div>
        </div>

        {/* NEW CHAT */}

        <div className="p-4">

          <button
            onClick={createNewConversation}
            className="w-full rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all py-4 text-sm"
          >
            + New conversation
          </button>

        </div>

        {/* HISTORY */}

        <div className="px-3 flex-1 overflow-y-auto">

          <p className="text-xs text-white/30 uppercase px-2 mb-3 tracking-wider">
            Recent
          </p>

          {conversations.map((chat) => (

            <div
              key={chat.id}

              onClick={() =>
                loadConversation(chat.id)
              }

              className={`rounded-2xl px-4 py-4 mb-2 cursor-pointer transition-all ${
                currentConversationId ===
                chat.id
                  ? "bg-white/10 border border-white/10"
                  : "hover:bg-white/5"
              }`}
            >

              <p className="text-sm text-white/80 truncate">
                {chat.title}
              </p>

            </div>
          ))}
        </div>

        {/* USER SECTION */}

        <div className="p-4 border-t border-white/10">

          <button
            onClick={() =>
              setShowProfile(true)
            }
            className="w-full flex items-center gap-3 bg-white/5 hover:bg-white/10 transition-all rounded-2xl p-3 border border-white/10"
          >

            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center font-semibold">
              {profile.user_name?.[0] || "U"}
            </div>

            <div className="text-left">

              <p className="text-sm font-medium">
                {profile.user_name || "User"}
              </p>

              <p className="text-xs text-white/40">
                Open profile
              </p>

            </div>
          </button>
        </div>
      </aside>

      {/* MAIN */}

      <section className="flex-1 flex flex-col bg-gradient-to-br from-[#020617] via-[#030712] to-black">

        {/* TOP BAR */}

        <div className="h-16 border-b border-white/10 flex items-center justify-between px-8 backdrop-blur-xl">

          <div className="flex items-center gap-4">

            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>

            <h2 className="font-medium">
              {profile.ai_name || "MindScope"}
            </h2>

            <div className="flex items-center gap-2 text-xs px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">

  <div
    className={`w-2 h-2 rounded-full ${
      emotion === "happy"
        ? "bg-green-400"
        : emotion === "sad"
        ? "bg-blue-400"
        : emotion === "angry"
        ? "bg-red-400"
        : emotion === "anxious"
        ? "bg-yellow-400"
        : "bg-gray-400"
    }`}
  />

  mood: {emotion}

</div>

          </div>

          <div className="text-xs text-white/30">
            online
          </div>
        </div>

        {/* CHAT AREA */}

        <div className="flex-1 overflow-y-auto px-8 py-8">

          <div className="max-w-4xl mx-auto">

            {messages.map((msg, i) => (

              <div
                key={i}
                className={`mb-8 flex ${
                  msg.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >

                <div className="max-w-[75%]">

                  {msg.role === "user" ? (

                    <div className="flex justify-end">

                      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-5 py-4 rounded-3xl rounded-tr-md text-white shadow-lg shadow-blue-500/10">
                        <p className="leading-relaxed">
                          {msg.content}
                        </p>
                      </div>

                    </div>

                  ) : (

                    <div className="flex gap-4">

                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                        🧠
                      </div>

                      <div>

                        <div className="bg-white/5 border border-white/10 backdrop-blur-xl px-5 py-4 rounded-3xl rounded-tl-md shadow-2xl">

                          <p className="leading-8 text-white/90 whitespace-pre-wrap">
                            {msg.content}
                          </p>

                        </div>

                        <p className="text-xs text-white/30 mt-2 ml-2">
                          just now
                        </p>

                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (

              <div className="flex gap-4 mb-8">

                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  🧠
                </div>

                <div className="bg-white/5 border border-white/10 px-5 py-4 rounded-3xl rounded-tl-md">

                  <div className="flex gap-2">

                    <div className="w-2 h-2 rounded-full bg-white/50 animate-bounce"></div>

                    <div className="w-2 h-2 rounded-full bg-white/50 animate-bounce delay-150"></div>

                    <div className="w-2 h-2 rounded-full bg-white/50 animate-bounce delay-300"></div>

                  </div>

                </div>
              </div>
            )}
          </div>
        </div>

        {/* INPUT */}

        <div className="p-6 border-t border-white/10 bg-black/30 backdrop-blur-xl">

          <div className="max-w-4xl mx-auto">

            <div className="relative">

              <input
                type="text"

                value={input}

                onChange={(e) =>
                  setInput(e.target.value)
                }

                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSend();
                  }
                }}

                placeholder={`talk to ${
                  profile.ai_name || "MindScope"
                }...`}

                className="w-full bg-white/5 border border-white/10 rounded-3xl px-6 py-5 pr-20 outline-none focus:border-indigo-500/40 text-white placeholder:text-white/30 backdrop-blur-xl"
              />

              <button
                onClick={handleSend}

                disabled={loading}

                className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center hover:scale-105 transition-all disabled:opacity-50"
              >
                <Send size={18} />
              </button>

            </div>

            <p className="text-center text-xs text-white/20 mt-4 tracking-widest">
              emotionally adaptive conversations
            </p>

          </div>
        </div>
      </section>

      {/* PROFILE DRAWER */}

      {showProfile && (

        <div className="fixed inset-0 z-50 flex justify-end">

          <div
            onClick={() =>
              setShowProfile(false)
            }
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          <div className="relative w-[380px] h-full bg-[#0b0b12] border-l border-white/10 p-6 flex flex-col">

            <div className="flex items-center justify-between mb-8">

              <h2 className="text-2xl font-bold">
                Profile
              </h2>

              <button
                onClick={() =>
                  setShowProfile(false)
                }
                className="p-2 rounded-xl hover:bg-white/10 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="rounded-3xl bg-white/5 border border-white/10 p-5 flex items-center gap-4">

              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-lg font-bold">
                {profile.user_name?.[0] || "U"}
              </div>

              <div>

                <h3 className="font-semibold text-lg">
                  {profile.user_name || "User"}
                </h3>

                <p className="text-white/40 text-sm">
                  personalized AI companion
                </p>

              </div>
            </div>

            <div className="mt-10 space-y-3">

              <button className="w-full flex items-center gap-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all p-4 border border-white/10">

                <Brain size={20} />

                <div className="text-left">

                  <p className="font-medium">
                    AI Companion
                  </p>

                  <p className="text-xs text-white/40">
                    {profile.ai_name || "MindScope"}
                  </p>

                </div>
              </button>

              <button className="w-full flex items-center gap-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all p-4 border border-white/10">

                <Settings size={20} />

                <div className="text-left">

                  <p className="font-medium">
                    Preferences
                  </p>

                  <p className="text-xs text-white/40">
                    personality & tone
                  </p>

                </div>
              </button>

              <button className="w-full flex items-center gap-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all p-4 border border-white/10">

                <User size={20} />

                <div className="text-left">

                  <p className="font-medium">
                    Account
                  </p>

                  <p className="text-xs text-white/40">
                    manage profile
                  </p>

                </div>
              </button>

            </div>

            <div className="flex-1" />

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-3 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-300 py-4 transition-all"
            >

              <LogOut size={18} />

              Sign Out

            </button>
          </div>
        </div>
      )}
    </main>
  );
}