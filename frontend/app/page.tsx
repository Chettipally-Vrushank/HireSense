"use client"

import Link from "next/link"
import Navbar from "@/components/Navbar"

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-medium mb-8 animate-fade-in">
            <span className="flex h-2 w-2 rounded-full bg-indigo-600"></span>
            Now supporting Google OAuth 2.0
          </div>
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
            Stop Guessing. <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-500">
              Land Your Dream Job.
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-gray-600 mb-10 leading-relaxed">
            Revolutionize your career with AI-powered resume analysis. Match your skills to any job description and get a personalized roadmap to success.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 hover:scale-105"
            >
              Analyze Your Resume Now
            </Link>
            <Link
              href="/#features"
              className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 font-bold rounded-2xl border border-gray-200 hover:bg-gray-50 transition-all"
            >
              View Features
            </Link>
          </div>

          <div className="mt-20 relative max-w-5xl mx-auto">
            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-[3rem] blur-3xl opacity-10 animate-pulse"></div>
            <div className="relative bg-white border border-gray-100 rounded-[2.5rem] shadow-2xl overflow-hidden p-2">
              <div className="bg-gray-50 rounded-[2rem] p-8 sm:p-12 aspect-[16/9] flex items-center justify-center border border-gray-100">
                {/* Placeholder for Product Preview */}
                <div className="text-center">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm mb-4 mx-auto flex items-center justify-center">
                    <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-400 font-medium tracking-widest uppercase text-xs">AI Matcher Interface Preview</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything You Need to Succeed</h2>
            <p className="text-gray-600 max-w-xl mx-auto">Built by career experts and AI researchers to give you the competitive edge in today's job market.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Instant AI Matching",
                description: "Get a compatibility score between your resume and any JD in seconds with zero latency.",
                icon: "⚡",
                color: "bg-amber-50 text-amber-600"
              },
              {
                title: "Skill Gap Analysis",
                description: "Identify exactly what's missing from your application to pass the ATS and land interviews.",
                icon: "🎯",
                color: "bg-indigo-50 text-indigo-600"
              },
              {
                title: "Personalized Roadmap",
                description: "Get a step-by-step learning path to acquire missing skills and bolster your resume.",
                icon: "🗺️",
                color: "bg-green-50 text-green-600"
              }
            ].map((feature, i) => (
              <div key={i} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
                <div className={`w-14 h-14 ${feature.color} text-2xl rounded-2xl flex items-center justify-center mb-6`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">H</div>
            <span className="font-bold text-gray-900">HireSense</span>
          </div>
          <p className="text-gray-400 text-sm">© 2024 HireSense AI. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-gray-400 hover:text-indigo-600 transition-colors text-sm">Privacy</Link>
            <Link href="#" className="text-gray-400 hover:text-indigo-600 transition-colors text-sm">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
