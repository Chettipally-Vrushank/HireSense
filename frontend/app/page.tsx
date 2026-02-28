"use client"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import PillNav from "../components/PillNav"
import DotGrid from "../components/DotGrid"
import { Timeline } from "../components/ui/timeline"
import { getToken, logout } from "@/lib/auth"
import { api } from "@/lib/api"
import { ContainerScroll } from "../components/ui/container-scroll-animation"

function useScrollReveal(opts: IntersectionObserverInit = {}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { threshold: 0.12, ...opts })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return { ref, visible }
}

function useCounter(target: number, duration = 1800, start = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!start) return
    let st: number
    const run = (ts: number) => { if (!st) st = ts; const p = Math.min((ts - st) / duration, 1); setCount(Math.floor((1 - Math.pow(1 - p, 3)) * target)); if (p < 1) requestAnimationFrame(run) }
    requestAnimationFrame(run)
  }, [target, duration, start])
  return count
}

function MockResumeCard() {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 text-left w-full">
      <div className="flex items-start gap-3 mb-4 pb-4 border-b border-gray-100">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-black text-sm flex-shrink-0">GA</div>
        <div className="flex-1 min-w-0"><div className="font-black text-gray-900 text-sm">Govindula Abhisht</div><div className="text-xs text-gray-400 mt-0.5">govindula@email.com · +91 94901 14718</div></div>
        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full flex-shrink-0">✓ Parsed</span>
      </div>
      <div className="mb-3">
        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">Extracted Skills · 14 found</div>
        <div className="flex flex-wrap gap-1.5">
          {["Python", "SARIMA", "LightGBM", "FastAPI", "Power BI", "SQL", "Pandas", "Scikit-learn"].map(s => (
            <span key={s} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-lg border border-indigo-100">{s}</span>
          ))}
          <span className="px-2 py-0.5 bg-gray-50 text-gray-400 text-[10px] font-bold rounded-lg border border-gray-100">+6 more</span>
        </div>
      </div>
      <div>
        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">Experience</div>
        <div className="space-y-1.5">
          {[{ role: "Data Science Intern", company: "Analytics Co.", year: "2024" }, { role: "ML Engineer", company: "TechStartup", year: "2023" }].map((e, i) => (
            <div key={i} className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-300 flex-shrink-0" /><span className="text-[11px] font-semibold text-gray-700">{e.role}</span><span className="text-[10px] text-gray-400">· {e.company}</span><span className="ml-auto text-[10px] text-gray-300">{e.year}</span></div>
          ))}
        </div>
      </div>
    </div>
  )
}

function MockJDPane() {
  const text = "We're looking for a Data Scientist with expertise in Python, time-series forecasting, and ML. The ideal candidate has hands-on experience with SARIMA/Prophet models, LightGBM, and data visualization using Power BI..."
  const [v, setV] = useState(0)
  useEffect(() => { const t = setInterval(() => setV(x => x >= text.length ? x : x + 3), 20); return () => clearInterval(t) }, [])
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 text-left w-full">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full bg-red-400" /><div className="w-2 h-2 rounded-full bg-amber-400" /><div className="w-2 h-2 rounded-full bg-green-400" />
        <span className="ml-2 text-[10px] text-gray-400 font-mono">job_description.txt</span>
      </div>
      <div className="text-[11px] text-gray-600 leading-relaxed font-mono min-h-[72px]">{text.slice(0, v)}<span className="animate-pulse text-indigo-400">|</span></div>
      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
        <span className="text-[10px] text-gray-400">Extracting skills...</span>
        <div className="flex gap-1">{["Python", "SARIMA", "LightGBM", "Power BI"].slice(0, v > 120 ? 4 : v > 80 ? 2 : 0).map(s => (
          <span key={s} className="px-1.5 py-0.5 bg-amber-50 text-amber-700 text-[9px] font-bold rounded border border-amber-100">{s}</span>
        ))}</div>
      </div>
    </div>
  )
}

function MockMatchResult() {
  const [go, setGo] = useState(false)
  useEffect(() => { const t = setTimeout(() => setGo(true), 700); return () => clearTimeout(t) }, [])
  const score = useCounter(87, 1600, go)
  const circ = 2 * Math.PI * 36
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 text-left w-full">
      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-shrink-0">
          <svg width="88" height="88" className="-rotate-90">
            <circle cx="44" cy="44" r="36" stroke="#f3f4f6" strokeWidth="8" fill="none" />
            <circle cx="44" cy="44" r="36" stroke="url(#sg)" strokeWidth="8" fill="none" strokeDasharray={circ} strokeDashoffset={circ - (circ * (go ? 87 : 0)) / 100} strokeLinecap="round" style={{ transition: "stroke-dashoffset 1.6s cubic-bezier(0.4,0,0.2,1)" }} />
            <defs><linearGradient id="sg" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#6366f1" /><stop offset="100%" stopColor="#8b5cf6" /></linearGradient></defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-xl font-black text-indigo-600">{score}%</span><span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">Fit</span></div>
        </div>
        <div>
          <div className="font-black text-gray-900 text-sm mb-1">Strong Match!</div>
          <div className="text-[11px] text-gray-500 leading-relaxed">Great fit for this Data Science role.</div>
          <div className="flex gap-2 mt-2"><span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-full">7 matched</span><span className="px-2 py-0.5 bg-red-50 text-red-600 text-[10px] font-bold rounded-full">3 gaps</span></div>
        </div>
      </div>
      <div className="space-y-2">
        {[{ skill: "Python", pct: 100, color: "bg-green-400" }, { skill: "Time-Series", pct: 92, color: "bg-indigo-400" }, { skill: "Power BI", pct: 85, color: "bg-violet-400" }, { skill: "Docker", pct: 20, color: "bg-red-300" }].map(({ skill, pct, color }) => (
          <div key={skill}>
            <div className="flex justify-between text-[10px] mb-1"><span className="text-gray-600 font-semibold">{skill}</span><span className={`font-bold ${pct > 60 ? "text-green-600" : "text-red-500"}`}>{pct}%</span></div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width: go ? `${pct}%` : "0%" }} /></div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState("")

  useEffect(() => {
    const token = getToken()
    setIsLoggedIn(!!token)
    if (token) {
      api.get("/auth/me").then(r => { if (r.ok) r.json().then(d => setUserName(d.full_name || d.email?.split("@")[0] || "")) }).catch(() => { })
    }
  }, [])

  const navItems = [
    { label: "Analyze", href: "/analyze" },
    { label: "Tailor Resume", href: "/tailor" },
    { label: "My Resumes", href: "/resumes" },
    { label: "Tailored", href: "/tailored" },
    { label: "My Portfolio", href: "/portfolio" },
  ]

  const howReveal = useScrollReveal()
  const statsReveal = useScrollReveal({ threshold: 0.3 })
  const featReveal = useScrollReveal()

  const c1 = useCounter(94, 1800, statsReveal.visible)
  const c2 = useCounter(12000, 2000, statsReveal.visible)
  const c3 = useCounter(3, 1000, statsReveal.visible)

  const logoEl = (
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center shadow-sm">
        <span className="text-indigo-700 font-black text-sm leading-none">H</span>
      </div>
      <span className="text-white font-black text-[15px] tracking-tight">Hire<span className="text-indigo-300">Sense</span></span>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0e0b1a] text-white overflow-x-hidden relative">
      <div className="fixed inset-0 z-0 bg-[#070510]">
        <DotGrid dotSize={5} gap={15} baseColor="#271E37" activeColor="#5227FF" proximity={120} shockRadius={250} shockStrength={5} resistance={750} returnDuration={1.5} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 55% at 50% 50%,rgba(14,11,26,0.2) 0%,rgba(14,11,26,0.9) 100%)" }} />
      </div>

      {/* PillNav */}
      <PillNav
        logoElement={logoEl}
        items={navItems}
        baseColor="#1a1530"
        pillColor="#5227FF"
        pillTextColor="#ffffff"
        hoveredPillTextColor="#ffffff"
        theme="dark"
        initialLoadAnimation={true}
      />

      {/* Auth buttons top-right */}
      <div className="fixed top-4 right-4 z-[60] flex items-center gap-2">
        {isLoggedIn ? (
          <>
            <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white/80 hover:text-white bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-all backdrop-blur-md">
              <span className="w-5 h-5 rounded-md bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-[10px] font-black">
                {userName ? userName[0].toUpperCase() : "U"}
              </span>
              <span className="max-w-[100px] truncate">{userName || "Dashboard"}</span>
            </Link>
            <button onClick={logout} className="px-4 py-2 text-sm font-semibold text-white/40 hover:text-red-400 bg-white/5 hover:bg-red-500/10 rounded-full border border-white/5 hover:border-red-500/10 transition-all">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="px-4 py-2 text-sm font-semibold text-white/60 hover:text-white transition-all">Sign In</Link>
            <Link href="/signup" className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full shadow-lg shadow-indigo-500/30 hover:-translate-y-px transition-all">Get Started</Link>
          </>
        )}
      </div>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-24 pb-16 overflow-hidden z-10">

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-white/60 mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            AI-powered · Real-time matching · ATS optimized
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-6">
            <span className="text-white">Your resume,</span><br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-300 bg-clip-text text-transparent">perfectly matched.</span>
          </h1>
          <p className="text-lg sm:text-xl text-white/55 max-w-2xl mx-auto leading-relaxed mb-10">
            Upload your resume, paste any job description — HireSense AI extracts, compares, and tells you exactly how to close the gap in seconds.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/signup" className="group flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 transition-all text-sm">
              Start Analyzing Free
              <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </Link>
            <Link href="#how-it-works" className="flex items-center gap-2 px-7 py-3.5 bg-white/5 text-white/70 font-semibold rounded-2xl border border-white/10 hover:bg-white/10 transition-all text-sm backdrop-blur-sm">See how it works</Link>
          </div>
          <div className="mt-16 flex flex-col items-center text-white/25 animate-bounce">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
      </section>

      {/* ── PRODUCT PREVIEW ── */}
      <section className="px-4 sm:px-6 lg:px-8 w-full -mt-20 pointer-events-none">
        <div className="flex flex-col overflow-hidden max-w-7xl mx-auto pointer-events-auto">
          <ContainerScroll
            titleComponent={
              <div className="text-center mb-10">
                <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">Live Preview</span>
                <h2 className="text-3xl sm:text-5xl font-black text-white mt-4 mb-2">See it in action</h2>
                <p className="text-white/40 text-lg">Exactly what you'll see after uploading your resume</p>
              </div>
            }
          >
            <div className="relative h-full bg-[#0e0b1a] p-3 flex flex-col">
              <div className="flex items-center gap-2 px-3 py-2 mb-3 bg-white/5 rounded-xl border border-white/10 flex-shrink-0">
                <div className="flex gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500/60" /><div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" /><div className="w-2.5 h-2.5 rounded-full bg-green-500/60" /></div>
                <div className="flex-1 mx-3 h-6 bg-white/5 rounded-lg border border-white/10 flex items-center px-3 gap-2">
                  <svg className="w-3 h-3 text-white/25" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  <span className="text-[11px] text-white/25 font-mono">app.hiresense.ai/analyze</span>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 flex-1 overflow-y-auto pr-1 pb-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
                {[{ label: "Your Resume", num: "1", comp: <MockResumeCard />, extra: null },
                { label: "Job Description", num: "2", comp: <MockJDPane />, extra: <div className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl text-white text-sm font-bold text-center shadow-md shadow-indigo-500/30">✦ Run AI Analysis</div> },
                { label: "AI Results", num: "3", comp: <MockMatchResult />, extra: null }
                ].map(({ label, num, comp, extra }) => (
                  <div key={num} className="space-y-2">
                    <div className="text-[10px] font-bold text-white/35 uppercase tracking-widest px-1 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded bg-indigo-500/25 text-indigo-300 flex items-center justify-center font-black text-[9px]">{num}</span>{label}
                    </div>
                    {comp}{extra}
                  </div>
                ))}
              </div>
              <div className="mt-3 px-3 py-2 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2 text-[11px] text-white/35"><span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />Analysis complete · 1.2s</div>
                <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-lg">Tailor Resume →</span>
              </div>
            </div>
          </ContainerScroll>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 pointer-events-none">
        <div ref={statsReveal.ref} className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-5 pointer-events-auto">
          {[{ v: c1, s: "%", l: "Average fit score improvement", c: "text-indigo-400", d: "" },
          { v: c2.toLocaleString(), s: "+", l: "Resumes analyzed", c: "text-violet-400", d: "delay-100" },
          { v: c3, s: "s", l: "Average analysis time", c: "text-emerald-400", d: "delay-200" }
          ].map(({ v, s, l, c, d }, i) => (
            <div key={i} className={`bg-white/5 border border-white/10 rounded-[1.5rem] p-7 text-center transition-all duration-700 ${d} ${statsReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} hover:bg-white/8 hover:-translate-y-0.5`}>
              <div className={`text-4xl font-black mb-2 ${c}`}>{v}{s}</div>
              <div className="text-sm text-white/45 font-medium">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 pointer-events-none">
        <div ref={howReveal.ref} className="max-w-5xl mx-auto pointer-events-auto">
          <div className={`text-center mb-14 transition-all duration-700 ${howReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">How it works</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-4 mb-3">Three steps to your dream job</h2>
            <p className="text-white/45 max-w-xl mx-auto">No fluff, no guesswork — precise AI that tells you exactly where you stand.</p>
          </div>
          <div className={`transition-all duration-1000 ${howReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}>
            <Timeline
              data={[
                {
                  title: "STEP 1",
                  subtitle: "Upload Report",
                  content: (
                    <p className="text-white/45 text-lg leading-relaxed max-w-lg mb-10">
                      Drop your PDF — our AI securely extracts every key information, skill, role, and achievement with 95%+ accuracy.
                    </p>
                  )
                },
                {
                  title: "STEP 2",
                  subtitle: "AI Analysis",
                  content: (
                    <p className="text-white/45 text-lg leading-relaxed max-w-lg mb-10">
                      Advanced AI analyzes your report/resume, flags missing endpoints, identifies trends, and compares keywords against industry requirements.
                    </p>
                  )
                },
                {
                  title: "STEP 3",
                  subtitle: "Get Insights",
                  content: (
                    <p className="text-white/45 text-lg leading-relaxed max-w-lg mb-10">
                      Receive personalized insights, recommendations, and skill roadmaps. See exactly how your resume matches your dream job in plain actional steps.
                    </p>
                  )
                }
              ]}
            />
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 pointer-events-none">
        <div ref={featReveal.ref} className="max-w-5xl mx-auto pointer-events-auto">
          <div className={`text-center mb-14 transition-all duration-700 ${featReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">Features</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-4 mb-3">Everything you need to win</h2>
            <p className="text-white/45 max-w-xl mx-auto">Built by engineers who understand both AI and hiring.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { e: "⚡", t: "Instant Fit Score", d: "Semantic AI matching beyond keywords — understands context, synonyms, and domain relevance.", delay: "delay-0" },
              { e: "🎯", t: "Skill Gap Analysis", d: "Know exactly which skills are missing, with confidence scores for each gap.", delay: "delay-75" },
              { e: "🗺️", t: "AI Learning Roadmap", d: "Personalized 3-step paths to acquire each missing skill — no generic advice.", delay: "delay-150" },
              { e: "✨", t: "Resume Tailoring", d: "AI rewrites your resume using strong action verbs and ATS keywords.", delay: "delay-[225ms]" },
              { e: "🎨", t: "3 PDF Templates", d: "Classic ATS, Modern Split, and Minimal Serif — export-ready in one click.", delay: "delay-300" },
              { e: "🔒", t: "Secure & Private", d: "Your resume data is tied to your account only — never shared, never sold.", delay: "delay-[375ms]" },
            ].map((f, i) => (
              <div key={i} className={`bg-white/5 border border-white/10 rounded-[1.5rem] p-6 transition-all duration-700 ${f.delay} ${featReveal.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} hover:bg-white/8 hover:-translate-y-0.5 hover:border-indigo-500/25`}>
                <div className="text-2xl mb-3">{f.e}</div>
                <h3 className="font-black text-white mb-2 text-[15px]">{f.t}</h3>
                <p className="text-white/45 text-sm leading-relaxed">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 pointer-events-none">
        <div className="max-w-3xl mx-auto pointer-events-auto">
          <div className="relative bg-gradient-to-br from-indigo-600/90 via-indigo-700/90 to-violet-700/90 rounded-[2.5rem] p-12 overflow-hidden border border-indigo-500/30 shadow-2xl shadow-indigo-500/20 text-center">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl" />
            <div className="absolute bottom-0 left-1/3 w-40 h-40 bg-violet-400/10 rounded-full translate-y-1/2 blur-2xl" />
            <div className="relative">
              <div className="text-white/65 text-sm font-semibold mb-3 uppercase tracking-widest">Start for free today</div>
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">Ready to land your dream job?</h2>
              <p className="text-indigo-200/75 mb-8 max-w-sm mx-auto">Join thousands of job seekers using AI to beat ATS systems and land more interviews.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/signup" className="px-8 py-3.5 bg-white text-indigo-700 font-black rounded-2xl hover:bg-indigo-50 transition-all shadow-lg hover:-translate-y-0.5 text-sm">Analyze My Resume Now →</Link>
                <Link href="/login" className="px-8 py-3.5 bg-white/10 text-white font-semibold rounded-2xl hover:bg-white/20 transition-all backdrop-blur text-sm border border-white/20">I have an account</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-10 border-t border-white/5 pointer-events-none relative z-10 bg-[#0e0b1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6 pointer-events-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center"><span className="text-white font-black text-sm">H</span></div>
            <span className="font-black text-white">Hire<span className="text-indigo-400">Sense</span></span>
          </div>
          <p className="text-white/25 text-sm">© 2025 HireSense AI. All rights reserved.</p>
          <div className="flex items-center gap-6">{["Privacy", "Terms", "Contact"].map(l => (<Link key={l} href="#" className="text-white/25 hover:text-white/60 transition-colors text-sm font-medium">{l}</Link>))}</div>
        </div>
      </footer>
    </div>
  )
}