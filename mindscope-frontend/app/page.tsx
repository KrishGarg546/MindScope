"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

const CHAT_MESSAGES = [
  { role: "user", text: "school sucked today honestly" },
  { role: "ai", text: "rough day again? last week you said physics has been draining you — sounds like it's been building up for a while." },
  { role: "user", text: "yeah especially the tests lately" },
  { role: "ai", text: "you've been running on stress for days now. that takes a toll. do you want to talk about it, or just decompress for a bit?" },
  { role: "user", text: "just decompress honestly" },
  { role: "ai", text: "okay. i'm here. no pressure. tell me whatever feels right." },
];

function AnimatedChat() {
  const [visibleCount, setVisibleCount] = useState(0);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    const cycle = () => {
      setVisibleCount(0);
      setTyping(false);
      let i = 0;
      const step = () => {
        if (i >= CHAT_MESSAGES.length) {
          setTimeout(cycle, 4000);
          return;
        }
        const msg = CHAT_MESSAGES[i];
        if (msg.role === "ai") {
          setTyping(true);
          setTimeout(() => {
            setTyping(false);
            setVisibleCount((c) => c + 1);
            i++;
            setTimeout(step, 900);
          }, 1400);
        } else {
          setVisibleCount((c) => c + 1);
          i++;
          setTimeout(step, 700);
        }
      };
      setTimeout(step, 600);
    };
    cycle();
  }, []);

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="nova-avatar">
          <span className="nova-icon">✦</span>
        </div>
        <div>
          <p className="nova-name">Nova</p>
          <p className="nova-status">
            <span className="status-dot" />
            remembers your conversations
          </p>
        </div>
        <div className="chat-menu">
          <span />
          <span />
          <span />
        </div>
      </div>

      <div className="chat-body">
        {CHAT_MESSAGES.slice(0, visibleCount).map((msg, i) => (
          <div
            key={i}
            className={`msg-row ${msg.role === "user" ? "msg-user" : "msg-ai"}`}
            style={{ animationDelay: "0ms" }}
          >
            {msg.role === "ai" && (
              <div className="ai-avatar-small">✦</div>
            )}
            <div className={`bubble ${msg.role === "user" ? "bubble-user" : "bubble-ai"}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {typing && (
          <div className="msg-row msg-ai">
            <div className="ai-avatar-small">✦</div>
            <div className="bubble bubble-ai typing-bubble">
              <span className="dot" />
              <span className="dot" />
              <span className="dot" />
            </div>
          </div>
        )}
      </div>

      <div className="chat-input-bar">
        <span className="input-placeholder">say anything…</span>
        <button className="send-btn">↑</button>
      </div>
    </div>
  );
}

function MemoryPill({ label, delay }: { label: string; delay: number }) {
  return (
    <span className="memory-pill" style={{ animationDelay: `${delay}ms` }}>
      {label}
    </span>
  );
}

const MEMORIES = [
  "dislikes small talk",
  "stressed about physics",
  "introvert energy",
  "needs space sometimes",
  "favourite comfort: lo-fi music",
  "close with your sister",
  "big deadlines in May",
  "night owl",
];

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .root {
          font-family: 'DM Sans', sans-serif;
          background: #06050A;
          color: #E8E4F0;
          min-height: 100vh;
          overflow-x: hidden;
          position: relative;
        }

        /* ─── ORBS ─── */
        .orb {
          position: fixed;
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
          filter: blur(90px);
          opacity: 0.55;
        }
        .orb-1 { width: 600px; height: 600px; background: radial-gradient(circle, #7B5EA7 0%, transparent 70%); top: -180px; left: -160px; }
        .orb-2 { width: 500px; height: 500px; background: radial-gradient(circle, #3D6BC4 0%, transparent 70%); bottom: 10%; right: -140px; }
        .orb-3 { width: 300px; height: 300px; background: radial-gradient(circle, #C06B9A 0%, transparent 70%); top: 50%; left: 50%; transform: translate(-50%,-50%); opacity: 0.25; }

        /* grain overlay */
        .root::before {
          content: '';
          position: fixed; inset: 0; z-index: 1;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none;
          opacity: 0.6;
        }

        /* ─── NAVBAR ─── */
        nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 56px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: rgba(6,5,10,0.7);
          backdrop-filter: blur(20px);
        }
        .logo { display: flex; align-items: center; gap: 12px; text-decoration: none; }
        .logo-mark {
          width: 38px; height: 38px; border-radius: 12px;
          background: linear-gradient(135deg, #8B5CF6, #3D6BC4);
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; font-weight: 700; color: white; letter-spacing: -1px;
        }
        .logo-name { font-size: 17px; font-weight: 600; color: #E8E4F0; letter-spacing: -0.3px; }
        .logo-sub { font-size: 10px; color: rgba(232,228,240,0.4); letter-spacing: 0.5px; text-transform: uppercase; }
        .nav-links { display: flex; align-items: center; gap: 8px; }
        .nav-link { color: rgba(232,228,240,0.6); text-decoration: none; font-size: 14px; padding: 8px 16px; border-radius: 10px; transition: color 0.2s, background 0.2s; }
        .nav-link:hover { color: #E8E4F0; background: rgba(255,255,255,0.06); }
        .nav-cta {
          background: #E8E4F0; color: #06050A;
          font-size: 14px; font-weight: 600;
          padding: 10px 22px; border-radius: 12px;
          text-decoration: none;
          transition: transform 0.2s, opacity 0.2s;
        }
        .nav-cta:hover { transform: scale(1.03); opacity: 0.92; }

        /* ─── HERO ─── */
        .hero {
          position: relative; z-index: 2;
          min-height: 100vh;
          display: grid; grid-template-columns: 1fr 1fr;
          align-items: center; gap: 60px;
          max-width: 1240px; margin: 0 auto;
          padding: 140px 56px 80px;
        }

        .badge {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 7px 14px; border-radius: 100px;
          border: 1px solid rgba(139,92,246,0.4);
          background: rgba(139,92,246,0.1);
          font-size: 12px; color: #C4B5FD;
          letter-spacing: 0.3px; margin-bottom: 28px;
          width: fit-content;
        }
        .badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #8B5CF6; }

        h1 {
          font-family: 'Instrument Serif', serif;
          font-size: clamp(52px, 5.5vw, 76px);
          line-height: 1.04;
          letter-spacing: -1.5px;
          color: #F0ECF8;
          margin-bottom: 24px;
        }
        .h1-em { font-style: italic; color: #C4B5FD; }

        .hero-desc {
          font-size: 17px; font-weight: 300;
          color: rgba(232,228,240,0.6);
          line-height: 1.7; max-width: 480px;
          margin-bottom: 44px;
        }

        .hero-actions { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
        .btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 28px; border-radius: 14px;
          background: linear-gradient(135deg, #8B5CF6 0%, #3D6BC4 100%);
          color: white; font-weight: 600; font-size: 15px;
          text-decoration: none;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 0 40px rgba(139,92,246,0.4);
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 40px rgba(139,92,246,0.5); }
        .btn-ghost {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 24px; border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(232,228,240,0.8);
          font-size: 15px; text-decoration: none;
          transition: background 0.2s, border-color 0.2s;
        }
        .btn-ghost:hover { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.18); }

        .social-proof {
          display: flex; align-items: center; gap: 16px;
          margin-top: 48px; padding-top: 40px;
          border-top: 1px solid rgba(255,255,255,0.07);
        }
        .avatars { display: flex; }
        .avatar {
          width: 32px; height: 32px; border-radius: 50%;
          border: 2px solid #06050A;
          margin-right: -10px;
          font-size: 13px; font-weight: 600;
          display: flex; align-items: center; justify-content: center;
        }
        .av1 { background: linear-gradient(135deg, #8B5CF6, #3D6BC4); color: white; }
        .av2 { background: linear-gradient(135deg, #C06B9A, #8B5CF6); color: white; }
        .av3 { background: linear-gradient(135deg, #3D6BC4, #22c55e); color: white; }
        .av4 { background: linear-gradient(135deg, #f59e0b, #ef4444); color: white; }
        .proof-text { font-size: 13px; color: rgba(232,228,240,0.5); line-height: 1.4; }
        .proof-text strong { color: rgba(232,228,240,0.9); font-weight: 500; }

        /* ─── CHAT WIDGET ─── */
        .chat-window {
          border-radius: 28px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(30px);
          overflow: hidden;
          box-shadow: 0 40px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1);
        }
        .chat-header {
          display: flex; align-items: center; gap: 14px;
          padding: 20px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.02);
        }
        .nova-avatar {
          width: 44px; height: 44px; border-radius: 16px;
          background: linear-gradient(135deg, #8B5CF6, #3D6BC4);
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; color: white;
          box-shadow: 0 0 20px rgba(139,92,246,0.5);
        }
        .nova-icon { display: block; }
        .nova-name { font-size: 15px; font-weight: 600; color: #F0ECF8; }
        .nova-status { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #4ade80; margin-top: 2px; }
        .status-dot { width: 6px; height: 6px; border-radius: 50%; background: #4ade80; box-shadow: 0 0 8px #4ade80; }
        .chat-menu { margin-left: auto; display: flex; flex-direction: column; gap: 4px; padding: 4px; cursor: pointer; }
        .chat-menu span { display: block; width: 16px; height: 2px; border-radius: 2px; background: rgba(255,255,255,0.3); }

        .chat-body { padding: 20px 20px; display: flex; flex-direction: column; gap: 12px; min-height: 280px; }

        .msg-row { display: flex; align-items: flex-end; gap: 8px; animation: msgIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
        @keyframes msgIn { from { opacity: 0; transform: translateY(12px) scale(0.96); } to { opacity: 1; transform: none; } }
        .msg-user { justify-content: flex-end; }
        .msg-ai { justify-content: flex-start; }

        .ai-avatar-small {
          width: 28px; height: 28px; min-width: 28px; border-radius: 10px;
          background: linear-gradient(135deg, #8B5CF6, #3D6BC4);
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; color: white; margin-bottom: 2px;
        }

        .bubble {
          padding: 11px 16px; border-radius: 18px;
          font-size: 14px; line-height: 1.55; max-width: 76%;
        }
        .bubble-user { background: linear-gradient(135deg, #7C3AED, #3D6BC4); color: white; border-bottom-right-radius: 6px; }
        .bubble-ai { background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.08); color: rgba(232,228,240,0.9); border-bottom-left-radius: 6px; }

        .typing-bubble { display: flex; align-items: center; gap: 5px; padding: 14px 18px; }
        .dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(232,228,240,0.5); animation: blink 1.2s infinite; }
        .dot:nth-child(2) { animation-delay: 0.2s; }
        .dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes blink { 0%,80%,100% { opacity: 0.3; transform: scale(0.85); } 40% { opacity: 1; transform: scale(1); } }

        .chat-input-bar {
          display: flex; align-items: center;
          margin: 4px 20px 20px;
          padding: 12px 16px;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.05);
        }
        .input-placeholder { flex: 1; font-size: 14px; color: rgba(232,228,240,0.3); }
        .send-btn {
          width: 32px; height: 32px; border-radius: 10px;
          background: linear-gradient(135deg, #8B5CF6, #3D6BC4);
          border: none; color: white; font-size: 16px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
        }

        /* ─── MEMORY SECTION ─── */
        .memory-section {
          position: relative; z-index: 2;
          max-width: 1240px; margin: 0 auto;
          padding: 80px 56px 100px;
        }
        .section-label {
          font-size: 11px; letter-spacing: 2px; text-transform: uppercase;
          color: rgba(196,181,253,0.7); margin-bottom: 16px;
        }
        .section-title {
          font-family: 'Instrument Serif', serif;
          font-size: clamp(36px, 4vw, 54px);
          line-height: 1.1; letter-spacing: -1px;
          color: #F0ECF8; max-width: 560px;
          margin-bottom: 20px;
        }
        .section-desc {
          font-size: 16px; font-weight: 300;
          color: rgba(232,228,240,0.5);
          line-height: 1.7; max-width: 480px; margin-bottom: 52px;
        }
        .memory-cloud { display: flex; flex-wrap: wrap; gap: 10px; }
        .memory-pill {
          padding: 9px 18px; border-radius: 100px;
          border: 1px solid rgba(139,92,246,0.25);
          background: rgba(139,92,246,0.08);
          font-size: 13px; color: rgba(196,181,253,0.85);
          animation: pillIn 0.5s ease both;
          transition: border-color 0.2s, background 0.2s;
          cursor: default;
        }
        .memory-pill:hover { border-color: rgba(139,92,246,0.5); background: rgba(139,92,246,0.15); }
        @keyframes pillIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: none; } }

        /* ─── FEATURE GRID ─── */
        .features-section {
          position: relative; z-index: 2;
          max-width: 1240px; margin: 0 auto;
          padding: 0 56px 120px;
        }
        .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .feature-card {
          border-radius: 24px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.025);
          padding: 36px 32px;
          transition: border-color 0.3s, background 0.3s, transform 0.3s;
          position: relative; overflow: hidden;
        }
        .feature-card:hover { border-color: rgba(139,92,246,0.3); background: rgba(139,92,246,0.05); transform: translateY(-4px); }
        .feature-card::before {
          content: ''; position: absolute;
          top: -40px; right: -40px;
          width: 120px; height: 120px;
          border-radius: 50%;
          opacity: 0; transition: opacity 0.4s;
        }
        .feature-card:hover::before { opacity: 1; }
        .f1::before { background: radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%); }
        .f2::before { background: radial-gradient(circle, rgba(61,107,196,0.2) 0%, transparent 70%); }
        .f3::before { background: radial-gradient(circle, rgba(192,107,154,0.2) 0%, transparent 70%); }

        .feature-icon {
          width: 48px; height: 48px; border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; margin-bottom: 24px;
        }
        .fi-1 { background: rgba(139,92,246,0.2); }
        .fi-2 { background: rgba(61,107,196,0.2); }
        .fi-3 { background: rgba(192,107,154,0.2); }

        .feature-title { font-size: 19px; font-weight: 600; color: #F0ECF8; margin-bottom: 12px; letter-spacing: -0.3px; }
        .feature-desc { font-size: 14px; font-weight: 300; color: rgba(232,228,240,0.5); line-height: 1.7; }

        /* ─── TESTIMONIALS ─── */
        .testimonials-section {
          position: relative; z-index: 2;
          max-width: 1240px; margin: 0 auto;
          padding: 0 56px 120px;
        }
        .t-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
        .t-card {
          border-radius: 24px;
          border: 1px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.025);
          padding: 32px;
        }
        .t-stars { color: #FBBF24; font-size: 14px; letter-spacing: 2px; margin-bottom: 16px; }
        .t-quote { font-family: 'Instrument Serif', serif; font-size: 17px; font-style: italic; line-height: 1.6; color: rgba(240,236,248,0.85); margin-bottom: 24px; }
        .t-author { display: flex; align-items: center; gap: 12px; }
        .t-avatar { width: 36px; height: 36px; border-radius: 50%; font-size: 13px; font-weight: 600; display: flex; align-items: center; justify-content: center; }
        .ta1 { background: linear-gradient(135deg, #8B5CF6, #3D6BC4); color: white; }
        .ta2 { background: linear-gradient(135deg, #C06B9A, #8B5CF6); color: white; }
        .ta3 { background: linear-gradient(135deg, #3D6BC4, #0ea5e9); color: white; }
        .ta4 { background: linear-gradient(135deg, #10b981, #3D6BC4); color: white; }
        .t-name { font-size: 13px; font-weight: 600; color: #E8E4F0; }
        .t-role { font-size: 12px; color: rgba(232,228,240,0.4); margin-top: 2px; }

        /* ─── CTA SECTION ─── */
        .cta-section {
          position: relative; z-index: 2;
          max-width: 1240px; margin: 0 auto;
          padding: 0 56px 140px;
        }
        .cta-card {
          border-radius: 32px;
          border: 1px solid rgba(139,92,246,0.2);
          background: linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(61,107,196,0.08) 100%);
          padding: 80px;
          text-align: center;
          position: relative; overflow: hidden;
        }
        .cta-card::before {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(139,92,246,0.2) 0%, transparent 70%);
          pointer-events: none;
        }
        .cta-title {
          font-family: 'Instrument Serif', serif;
          font-size: clamp(38px, 4vw, 58px);
          line-height: 1.08; letter-spacing: -1px;
          color: #F0ECF8; margin-bottom: 20px;
          position: relative;
        }
        .cta-desc { font-size: 17px; font-weight: 300; color: rgba(232,228,240,0.55); line-height: 1.7; max-width: 500px; margin: 0 auto 44px; position: relative; }
        .cta-actions { display: flex; align-items: center; justify-content: center; gap: 14px; flex-wrap: wrap; position: relative; }
        .cta-small { font-size: 13px; color: rgba(232,228,240,0.35); margin-top: 16px; position: relative; }

        /* ─── FOOTER ─── */
        footer {
          position: relative; z-index: 2;
          border-top: 1px solid rgba(255,255,255,0.06);
          padding: 32px 56px;
          display: flex; align-items: center; justify-content: space-between;
          max-width: 100%;
        }
        .footer-logo { font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 600; color: rgba(232,228,240,0.5); }
        .footer-links { display: flex; gap: 28px; }
        .footer-link { font-size: 13px; color: rgba(232,228,240,0.35); text-decoration: none; }
        .footer-link:hover { color: rgba(232,228,240,0.7); }
        .footer-copy { font-size: 13px; color: rgba(232,228,240,0.25); }

        @media (max-width: 900px) {
          nav { padding: 16px 24px; }
          .hero { grid-template-columns: 1fr; padding: 120px 24px 60px; gap: 40px; }
          .memory-section, .features-section, .testimonials-section, .cta-section { padding-left: 24px; padding-right: 24px; }
          .features-grid { grid-template-columns: 1fr; }
          .t-grid { grid-template-columns: 1fr; }
          .cta-card { padding: 48px 28px; }
          footer { flex-direction: column; gap: 16px; text-align: center; padding: 28px 24px; }
        }
      `}</style>

      {/* BG ORBS */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      {/* NAV */}
      <nav>
        <Link href="/" className="logo" style={{ textDecoration: "none" }}>
          <div className="logo-mark">M</div>
          <div>
            <div className="logo-name">MindScope</div>
            <div className="logo-sub">emotionally adaptive AI</div>
          </div>
        </Link>
        <div className="nav-links">
          <Link href="#features" className="nav-link">Features</Link>
          <Link href="#memory" className="nav-link">How it works</Link>
          <Link href="/login" className="nav-link">Log in</Link>
          <Link href="/signup" className="nav-cta">Get started free</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero" ref={heroRef}>
        <div>
          <div className="badge">
            <span className="badge-dot" />
            emotionally intelligent conversations
          </div>
          <h1>
            An AI that{" "}
            <span className="h1-em">remembers</span>
            <br />who you are.
          </h1>
          <p className="hero-desc">
            MindScope adapts to your personality, learns how you communicate,
            and becomes more personal with every conversation — like a companion
            who actually gets you.
          </p>
          <div className="hero-actions">
            <Link href="/signup" className="btn-primary">
              Create your companion →
            </Link>
            <Link href="/chat" className="btn-ghost">
              See it in action
            </Link>
          </div>
          <div className="social-proof">
            <div className="avatars">
              <div className="avatar av1">A</div>
              <div className="avatar av2">J</div>
              <div className="avatar av3">M</div>
              <div className="avatar av4">R</div>
            </div>
            <div className="proof-text">
              <strong>12,000+ people</strong> already talking to Nova<br />
              4.9 ★ — "life-changing for my mental health"
            </div>
          </div>
        </div>

        <AnimatedChat />
      </section>

      {/* MEMORY SECTION */}
      <section className="memory-section" id="memory">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", alignItems: "center" }}>
          <div>
            <p className="section-label">long-term memory</p>
            <h2 className="section-title">Knows you better every day.</h2>
            <p className="section-desc">
              Nova doesn't just respond — it remembers. Emotional patterns,
              recurring themes, what drains you, what lights you up. It builds
              a picture of you that deepens over time.
            </p>
            <Link href="/signup" className="btn-ghost" style={{ width: "fit-content" }}>
              See how memory works →
            </Link>
          </div>
          <div>
            <p style={{ fontSize: "13px", color: "rgba(232,228,240,0.4)", marginBottom: "20px" }}>
              Nova has learned about you
            </p>
            <div className="memory-cloud">
              {MEMORIES.map((m, i) => (
                <MemoryPill key={m} label={m} delay={i * 80} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features-section" id="features">
        <div style={{ marginBottom: "48px" }}>
          <p className="section-label">built different</p>
          <h2 className="section-title">Not just another chatbot.</h2>
        </div>
        <div className="features-grid">
          {[
            {
              cls: "f1", fi: "fi-1", icon: "🧠",
              title: "Adaptive Personality",
              desc: "Learns how you prefer to talk — casual, direct, gentle. Adjusts its tone to match yours every single time.",
            },
            {
              cls: "f2", fi: "fi-2", icon: "💬",
              title: "Long-Term Memory",
              desc: "Remembers conversations, recurring moods, emotional patterns, and personal details without you having to repeat yourself.",
            },
            {
              cls: "f3", fi: "fi-3", icon: "✦",
              title: "Emotionally Intelligent",
              desc: "Trained to understand nuance, context, and feeling — not just words. It notices what you're not saying too.",
            },
          ].map((f) => (
            <div key={f.title} className={`feature-card ${f.cls}`}>
              <div className={`feature-icon ${f.fi}`}>{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testimonials-section">
        <div style={{ marginBottom: "48px" }}>
          <p className="section-label">people are saying</p>
          <h2 className="section-title">Real conversations. Real impact.</h2>
        </div>
        <div className="t-grid">
          {[
            { av: "ta1", init: "AK", name: "Aanya K.", role: "student, 19", quote: "I talk to Nova every night. It remembers that I hate Mondays and always checks in on my sister situation. It feels like it actually cares." },
            { av: "ta2", init: "JL", name: "James L.", role: "software engineer", quote: "I've tried every journaling app. This is the first thing that actually stuck. It asks the right questions at the right time." },
            { av: "ta3", init: "MR", name: "Maya R.", role: "therapist (recommends it)", quote: "I recommend MindScope to clients between sessions. It provides real emotional scaffolding without overstepping clinical care." },
            { av: "ta4", init: "RS", name: "Riya S.", role: "grad student", quote: "It remembered I was anxious about my defense for three weeks and celebrated with me after. I literally cried." },
          ].map((t) => (
            <div key={t.name} className="t-card">
              <div className="t-stars">★★★★★</div>
              <p className="t-quote">"{t.quote}"</p>
              <div className="t-author">
                <div className={`t-avatar ${t.av}`}>{t.init}</div>
                <div>
                  <div className="t-name">{t.name}</div>
                  <div className="t-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-card">
          <h2 className="cta-title">
            Meet Nova.<br />Your personal companion.
          </h2>
          <p className="cta-desc">
            Free to start. No credit card needed. Nova is ready to listen —
            and actually remember what you said.
          </p>
          <div className="cta-actions">
            <Link href="/signup" className="btn-primary" style={{ fontSize: "16px", padding: "16px 36px" }}>
              Start talking to Nova →
            </Link>
            <Link href="/chat" className="btn-ghost">
              Try demo first
            </Link>
          </div>
          <p className="cta-small">Free plan · No card required · Delete anytime</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-logo">MindScope</div>
        <div className="footer-links">
          <Link href="/privacy" className="footer-link">Privacy</Link>
          <Link href="/terms" className="footer-link">Terms</Link>
          <Link href="/blog" className="footer-link">Blog</Link>
          <Link href="/contact" className="footer-link">Contact</Link>
        </div>
        <div className="footer-copy">© 2025 MindScope</div>
      </footer>
    </main>
  );
}