"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import Navbar from "@/components/Navbar"

// ── Animated counter hook ──
function useCounter(target: number, duration = 1800, start = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!start) return
    let startTime: number
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [target, duration, start])
  return count
}

// ── Mock Resume Preview Card ──
function MockResumeCard() {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 text-left w-full">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4 pb-4 border-b border-gray-100">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-black text-sm flex-shrink-0">GA</div>
        <div className="flex-1 min-w-0">
          <div className="font-black text-gray-900 text-sm">Govindula Abhisht</div>
          <div className="text-xs text-gray-400 mt-0.5">govindula@email.com · +91 94901 14718</div>
        </div>
        <div className="flex-shrink-0">
          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full">✓ Parsed</span>
        </div>
      </div>
      {/* Skills */}
      <div className="mb-3">
        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">Extracted Skills · 14 found</div>
        <div className="flex flex-wrap gap-1.5">
          {["Python", "SARIMA", "LightGBM", "FastAPI", "Power BI", "SQL", "Pandas", "Scikit-learn", "Feature Eng."].map(s => (
            <span key={s} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-lg border border-indigo-100">{s}</span>
          ))}
          <span className="px-2 py-0.5 bg-gray-50 text-gray-400 text-[10px] font-bold rounded-lg border border-gray-100">+5 more</span>
        </div>
      </div>
      {/* Mini experience */}
      <div>
        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">Experience</div>
        <div className="space-y-1.5">
          {[
            { role: "Data Science Intern", company: "Analytics Co.", year: "2024" },
            { role: "ML Engineer", company: "TechStartup", year: "2023" },
          ].map((exp, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-300 flex-shrink-0" />
              <span className="text-[11px] font-semibold text-gray-700">{exp.role}</span>
              <span className="text-[10px] text-gray-400">· {exp.company}</span>
              <span className="ml-auto text-[10px] text-gray-300">{exp.year}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Mock Match Result ──
function MockMatchResult() {
  const [animate, setAnimate] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 600)
    return () => clearTimeout(t)
  }, [])
  const score = useCounter(87, 1600, animate)
  const circumference = 2 * Math.PI * 36
  const dashOffset = circumference - (circumference * (animate ? 87 : 0)) / 100

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 text-left w-full">
      <div className="flex items-center gap-4 mb-4">
        {/* Score ring */}
        <div className="relative flex-shrink-0">
          <svg width="88" height="88" className="-rotate-90">
            <circle cx="44" cy="44" r="36" stroke="#f3f4f6" strokeWidth="8" fill="none" />
            <circle cx="44" cy="44" r="36" stroke="url(#scoreGrad)" strokeWidth="8" fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 1.6s cubic-bezier(0.4,0,0.2,1)" }} />
            <defs>
              <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-black text-indigo-600">{score}%</span>
            <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">Fit</span>
          </div>
        </div>
        <div>
          <div className="font-black text-gray-900 text-sm mb-1">Strong Match!</div>
          <div className="text-[11px] text-gray-500 leading-relaxed">Your profile is a strong fit for this Data Science role.</div>
          <div className="flex gap-2 mt-2">
            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-full">7 matched</span>
            <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[10px] font-bold rounded-full">3 gaps</span>
          </div>
        </div>
      </div>
      {/* Skill match bars */}
      <div className="space-y-2">
        {[
          { skill: "Python", pct: 100, color: "bg-green-400" },
          { skill: "Time-Series Forecasting", pct: 92, color: "bg-indigo-400" },
          { skill: "Power BI", pct: 85, color: "bg-violet-400" },
          { skill: "Docker", pct: 20, color: "bg-red-300" },
        ].map(({ skill, pct, color }) => (
          <div key={skill}>
            <div className="flex justify-between text-[10px] mb-1">
              <span className="text-gray-600 font-semibold">{skill}</span>
              <span className={`font-bold ${pct > 60 ? "text-green-600" : "text-red-500"}`}>{pct}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full ${color} rounded-full transition-all duration-1000`}
                style={{ width: animate ? `${pct}%` : "0%" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Mock JD Paste ──
function MockJDPane() {
  const text = "We're looking for a Data Scientist with experience in Python, time-series forecasting, and machine learning. The ideal candidate has worked with SARIMA/Prophet models, LightGBM, and data visualization tools like Power BI..."
  const [visible, setVisible] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setVisible(v => {
      if (v >= text.length) { clearInterval(t); return v }
      return v + 3
    }), 18)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 text-left w-full">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full bg-red-400" />
        <div className="w-2 h-2 rounded-full bg-amber-400" />
        <div className="w-2 h-2 rounded-full bg-green-400" />
        <span className="ml-2 text-[10px] text-gray-400 font-mono">job_description.txt</span>
      </div>
      <div className="text-[11px] text-gray-600 leading-relaxed font-mono min-h-[72px]">
        {text.slice(0, visible)}
        <span className="animate-pulse text-indigo-400">|</span>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
        <span className="text-[10px] text-gray-400">Extracting skills...</span>
        <div className="flex gap-1">
          {["Python", "SARIMA", "LightGBM", "Power BI"].slice(0, visible > 100 ? 4 : visible > 60 ? 2 : 0).map(s => (
            <span key={s} className="px-1.5 py-0.5 bg-amber-50 text-amber-700 text-[9px] font-bold rounded border border-amber-100 animate-fade-in">{s}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const [statsVisible, setStatsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true) },
      { threshold: 0.3 }
    )
    const el = document.getElementById("stats-section")
    if (el) observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const c1 = useCounter(94, 1800, statsVisible)
  const c2 = useCounter(12000, 2000, statsVisible)
  const c3 = useCounter(3, 1000, statsVisible)

  return (
    <div className="min-h-screen bg-[#f8f7ff] text-gray-900">
      <Navbar />

      {/* ══════════════════════════════════════
                HERO
            ══════════════════════════════════════ */}
      <section className="relative pt-28 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-gradient-to-b from-indigo-100/60 via-violet-50/40 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-32 right-0 w-64 h-64 bg-violet-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-48 left-0 w-48 h-48 bg-indigo-200/30 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto">
          {/* Badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-indigo-100 text-indigo-700 text-sm font-semibold shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
              AI-powered · Real-time matching · ATS optimized
            </div>
          </div>

          {/* Headline */}
          <div className="text-center max-w-4xl mx-auto mb-8">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-6">
              <span className="text-gray-900">Your resume,</span>
              <br />
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-500 bg-clip-text text-transparent">
                  perfectly matched.
                </span>
                <svg className="absolute -bottom-2 left-0 w-full" height="6" viewBox="0 0 400 6" fill="none">
                  <path d="M0 3 Q100 0 200 3 Q300 6 400 3" stroke="url(#uline)" strokeWidth="3" strokeLinecap="round" fill="none" />
                  <defs>
                    <linearGradient id="uline" x1="0" y1="0" x2="400" y2="0">
                      <stop stopColor="#6366f1" /><stop offset="1" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
              Upload your resume, paste any job description — HireSense AI extracts, compares, and tells you exactly how to close the gap in seconds.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
            <Link href="/signup"
              className="group flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5 transition-all text-sm">
              Start Analyzing Free
              <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link href="/#how-it-works"
              className="flex items-center gap-2 px-7 py-3.5 bg-white text-gray-700 font-semibold rounded-2xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all text-sm shadow-sm">
              See how it works
            </Link>
          </div>

          {/* ── LIVE PRODUCT PREVIEW ── */}
          <div className="relative max-w-5xl mx-auto">
            {/* Glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 via-violet-500/10 to-indigo-500/20 rounded-[3rem] blur-2xl" />

            <div className="relative bg-white/80 backdrop-blur border border-white rounded-[2rem] shadow-2xl shadow-indigo-100/50 p-3 sm:p-4">
              {/* Mock browser chrome */}
              <div className="flex items-center gap-2 px-3 py-2 mb-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 mx-3 h-6 bg-white rounded-lg border border-gray-200 flex items-center px-3 gap-2">
                  <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="text-[11px] text-gray-400 font-mono">app.hiresense.ai/analyze</span>
                </div>
              </div>

              {/* Mock UI grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {/* Left: Resume card */}
                <div className="space-y-2">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-[9px]">1</span>
                    Your Resume
                  </div>
                  <MockResumeCard />
                </div>

                {/* Middle: JD paste */}
                <div className="space-y-2">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-[9px]">2</span>
                    Job Description
                  </div>
                  <MockJDPane />
                  {/* Analyze button mock */}
                  <div className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl text-white text-sm font-bold text-center shadow-md shadow-indigo-200">
                    ✦ Run AI Analysis
                  </div>
                </div>

                {/* Right: Results */}
                <div className="space-y-2">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1 flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded bg-green-100 text-green-600 flex items-center justify-center font-black text-[9px]">3</span>
                    AI Results
                  </div>
                  <MockMatchResult />
                </div>
              </div>

              {/* Bottom status bar */}
              <div className="mt-3 px-3 py-2 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[11px] text-gray-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  Analysis complete · 1.2s
                </div>
                <div className="flex gap-2">
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100 cursor-pointer hover:bg-indigo-100 transition-colors">Tailor Resume →</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
                STATS
            ══════════════════════════════════════ */}
      <section id="stats-section" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { value: c1, suffix: "%", label: "Average fit score improvement", color: "text-indigo-600" },
            { value: c2.toLocaleString(), suffix: "+", label: "Resumes analyzed", color: "text-violet-600" },
            { value: c3, suffix: "s", label: "Average analysis time", color: "text-emerald-600" },
          ].map(({ value, suffix, label, color }, i) => (
            <div key={i} className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm p-7 text-center group hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className={`text-4xl font-black mb-2 ${color}`}>{value}{suffix}</div>
              <div className="text-sm text-gray-500 font-medium">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════
                HOW IT WORKS
            ══════════════════════════════════════ */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full">How it works</span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-4 mb-3">Three steps to your dream job</h2>
            <p className="text-gray-500 max-w-xl mx-auto">No fluff, no guesswork — just precise AI analysis that tells you exactly where you stand and what to do next.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-10 left-[calc(16.6%+16px)] right-[calc(16.6%+16px)] h-px bg-gradient-to-r from-indigo-200 via-violet-300 to-indigo-200" />

            {[
              {
                step: "01",
                title: "Upload Your Resume",
                desc: "Drop your PDF — our AI extracts every skill, role, and achievement with 95%+ accuracy.",
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                ),
                color: "bg-indigo-50 text-indigo-600"
              },
              {
                step: "02",
                title: "Paste Job Description",
                desc: "Copy any JD from LinkedIn, Naukri, or anywhere — we extract what employers actually want.",
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
                color: "bg-violet-50 text-violet-600"
              },
              {
                step: "03",
                title: "Get Your AI Report",
                desc: "Instant fit score, skill gap analysis, personalized learning roadmap, and a tailored resume.",
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
                color: "bg-emerald-50 text-emerald-600"
              },
            ].map(({ step, title, desc, icon, color }, i) => (
              <div key={i} className="relative bg-white rounded-[2rem] border border-gray-100 p-7 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group">
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                    {icon}
                  </div>
                  <span className="text-3xl font-black text-gray-100 group-hover:text-gray-200 transition-colors mt-1">{step}</span>
                </div>
                <h3 className="text-lg font-black text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
                FEATURES
            ══════════════════════════════════════ */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#f8f7ff]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full">Features</span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-4 mb-3">Everything you need to win</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Built by engineers who understand both AI and hiring.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { emoji: "⚡", title: "Instant Fit Score", desc: "Semantic AI matching goes beyond keywords — understands context, synonyms, and domain relevance.", bg: "bg-amber-50", border: "border-amber-100" },
              { emoji: "🎯", title: "Skill Gap Analysis", desc: "Know exactly which skills are missing, with confidence scores for each gap identified.", bg: "bg-red-50", border: "border-red-100" },
              { emoji: "🗺️", title: "AI Learning Roadmap", desc: "Personalized 3-step paths to acquire each missing skill — no generic advice.", bg: "bg-green-50", border: "border-green-100" },
              { emoji: "✨", title: "Resume Tailoring", desc: "AI rewrites your resume to match each JD using strong action verbs and ATS keywords.", bg: "bg-indigo-50", border: "border-indigo-100" },
              { emoji: "🎨", title: "3 PDF Templates", desc: "Classic ATS, Modern Split, and Minimal Serif — all export-ready in one click.", bg: "bg-violet-50", border: "border-violet-100" },
              { emoji: "🔒", title: "Secure & Private", desc: "Your resume data is tied to your account only — never shared, never sold.", bg: "bg-slate-50", border: "border-slate-100" },
            ].map((f, i) => (
              <div key={i} className={`${f.bg} rounded-[1.5rem] border ${f.border} p-6 hover:-translate-y-0.5 hover:shadow-md transition-all`}>
                <div className="text-2xl mb-3">{f.emoji}</div>
                <h3 className="font-black text-gray-900 mb-2 text-[15px]">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
                CTA BANNER
            ══════════════════════════════════════ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 rounded-[2.5rem] p-12 overflow-hidden shadow-2xl shadow-indigo-200">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl" />
            <div className="absolute bottom-0 left-1/3 w-40 h-40 bg-violet-400/20 rounded-full translate-y-1/2 blur-2xl" />
            <div className="relative">
              <div className="text-white/80 text-sm font-semibold mb-3 uppercase tracking-widest">Start for free today</div>
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">Ready to land your dream job?</h2>
              <p className="text-indigo-200 mb-8 max-w-sm mx-auto">Join thousands of job seekers using AI to beat ATS systems and land more interviews.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/signup"
                  className="px-8 py-3.5 bg-white text-indigo-700 font-black rounded-2xl hover:bg-indigo-50 transition-all shadow-lg hover:-translate-y-0.5 text-sm">
                  Analyze My Resume Now →
                </Link>
                <Link href="/login"
                  className="px-8 py-3.5 bg-white/10 text-white font-semibold rounded-2xl hover:bg-white/20 transition-all backdrop-blur text-sm border border-white/20">
                  I have an account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
                FOOTER
            ══════════════════════════════════════ */}
      <footer className="py-10 border-t border-gray-100 bg-[#f8f7ff]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-black text-sm">H</span>
            </div>
            <span className="font-black text-gray-900">Hire<span className="text-indigo-600">Sense</span></span>
          </div>
          <p className="text-gray-400 text-sm">© 2025 HireSense AI. All rights reserved.</p>
          <div className="flex items-center gap-6">
            {["Privacy", "Terms", "Contact"].map(l => (
              <Link key={l} href="#" className="text-gray-400 hover:text-indigo-600 transition-colors text-sm font-medium">{l}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}