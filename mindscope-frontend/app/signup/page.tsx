"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {

  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleSignup() {

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/onboarding");
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">

      {/* GLOW */}

      <div className="absolute top-[-150px] left-[-150px] h-[400px] w-[400px] bg-purple-500/20 blur-[120px] rounded-full" />

      <div className="absolute bottom-[-150px] right-[-150px] h-[400px] w-[400px] bg-blue-500/20 blur-[120px] rounded-full" />

      <div className="relative z-10 w-full max-w-md rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-2xl p-10 shadow-2xl">

        <div className="mb-10">

          <h1 className="text-5xl font-black">
            Create Account
          </h1>

          <p className="text-white/50 mt-3">
            Start building your personalized AI companion.
          </p>
        </div>

        <div className="space-y-5">

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl bg-white/5 border border-white/10 px-5 py-4 outline-none focus:border-purple-500"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-2xl bg-white/5 border border-white/10 px-5 py-4 outline-none focus:border-purple-500"
          />

          <button
            onClick={handleSignup}
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 font-semibold hover:scale-[1.02] transition-all"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </div>

        <p className="text-white/40 text-sm mt-8 text-center">

          Already have an account?{" "}

          <Link
            href="/login"
            className="text-purple-400 hover:text-purple-300"
          >
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}