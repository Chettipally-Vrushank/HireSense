"use client"

import { useState } from "react"
import { api } from "@/lib/api"
import ProtectedLayout from "@/components/ProtectedLayout"
import { ResumeUpload, MatchResult } from "@/components/AnalysisUI"

export default function AnalyzePage() {
    const [file, setFile] = useState<File | null>(null)
    const [jdText, setJdText] = useState("")
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)
    const [recLoading, setRecLoading] = useState(false)
    const [recommendations, setRecommendations] = useState<any>(null)

    const handleAnalyze = async () => {
        if (!file || !jdText) return
        setLoading(true)
        setResult(null)
        setRecommendations(null)

        try {
            const formData = new FormData()
            formData.append("file", file)
            const parseRes = await api.upload("/ai/parse-resume-pdf", formData)
            if (!parseRes.ok) {
                const errorData = await parseRes.json();
                throw new Error(errorData.detail || "Failed to parse resume");
            }
            const resumeData = await parseRes.json()

            const matchRes = await api.post("/ai/match", {
                jd_text: jdText,
                resume_text: resumeData.original_text
            })
            if (!matchRes.ok) {
                const errorData = await matchRes.json();
                throw new Error(errorData.detail || "Matching failed");
            }
            const matchData = await matchRes.json()
            setResult(matchData)
        } catch (err) {
            console.error("Analysis failed:", err)
            alert("Something went wrong during analysis.")
        } finally {
            setLoading(false)
        }
    }

    const handleFetchRecs = async () => {
        if (!result?.missing_skills?.length) return
        setRecLoading(true)
        try {
            const res = await api.post("/ai/gap-analysis", {
                missing_skills: result.missing_skills
            })
            const data = await res.json()
            setRecommendations(data.skills)
        } catch (err) {
            console.error("Failed to fetch recommendations:", err)
        } finally {
            setRecLoading(false)
        }
    }

    return (
        <ProtectedLayout>
            <div className="max-w-5xl mx-auto space-y-12 animate-fade-in">
                <header className="text-center">
                    <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">AI Analysis</span>
                    <h1 className="text-4xl sm:text-5xl font-black text-white mt-4 mb-3">Analyze Your Resume</h1>
                    <p className="text-white/45 text-lg max-w-xl mx-auto leading-relaxed">Compare your profile against any job posting with our advanced semantic matcher.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-3">
                            <span className="w-9 h-9 bg-white/5 border border-white/10 text-indigo-400 rounded-xl flex items-center justify-center text-sm font-black">1</span>
                            Your Resume
                        </h2>
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-[2.5rem] p-1 overflow-hidden shadow-2xl">
                            <ResumeUpload onFileSelect={setFile} />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-3">
                            <span className="w-9 h-9 bg-white/5 border border-white/10 text-indigo-400 rounded-xl flex items-center justify-center text-sm font-black">2</span>
                            Job Description
                        </h2>
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-[2.5rem] p-6 shadow-2xl">
                            <textarea
                                className="w-full h-[220px] px-6 py-5 rounded-2xl border border-white/10 bg-white/5 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-none text-sm leading-relaxed text-white font-medium placeholder:text-white/20"
                                placeholder="Paste the job requirements here..."
                                value={jdText}
                                onChange={(e) => setJdText(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-center pt-4">
                    <button
                        onClick={handleAnalyze}
                        disabled={loading || !file || !jdText}
                        className="px-14 py-5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-lg font-bold rounded-[2rem] hover:from-indigo-700 hover:to-violet-700 transition-all shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-1 disabled:opacity-30 disabled:cursor-not-allowed group relative overflow-hidden"
                    >
                        <span className="relative z-10 flex items-center gap-3">
                            {loading ? "Analyzing Profile..." : "Run AI Analysis"}
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                        </span>
                    </button>
                </div>

                {result && (
                    <div className="pt-8">
                        <MatchResult
                            result={result}
                            onGenerateRecs={handleFetchRecs}
                            recLoading={recLoading}
                        />
                    </div>
                )}

                {recommendations && (
                    <div className="space-y-10 py-12 animate-slide-up">
                        <div className="text-center">
                            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">Personalized Roadmap</span>
                            <h2 className="text-3xl sm:text-4xl font-black text-white mt-4 mb-2">How to Bridge the Gap</h2>
                            <p className="text-white/45 font-medium">Your customized step-by-step learning path.</p>
                        </div>
                        <div className="grid grid-cols-1 gap-8">
                            {recommendations.map((rec: any, i: number) => (
                                <div key={i} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[2.5rem] p-8 sm:p-10 shadow-2xl group hover:border-indigo-500/30 transition-all">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                                        <div className="flex items-center gap-5">
                                            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-3xl">🎯</div>
                                            <div>
                                                <span className="px-3 py-1 bg-indigo-500/10 text-indigo-300 text-[10px] font-black uppercase tracking-widest rounded-lg mb-2 inline-block border border-indigo-500/20">Recommended Skill</span>
                                                <h3 className="text-2xl font-black text-white">{rec.skill_name}</h3>
                                            </div>
                                        </div>
                                        <div className="px-5 py-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                                            <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block mb-1">Importance</span>
                                            <span className="text-sm font-black text-amber-300 flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                                                {rec.importance}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="bg-black/20 rounded-3xl p-8 border border-white/5">
                                        <h4 className="text-xs font-black text-white/30 uppercase tracking-[0.2em] mb-6">Learning roadmap</h4>
                                        <div className="relative space-y-6">
                                            <div className="absolute left-[11px] top-2 bottom-2 w-px bg-white/5" />
                                            {rec.roadmap?.map((step: string, j: number) => (
                                                <div key={j} className="flex gap-6 items-start relative group/step">
                                                    <span className="flex-shrink-0 w-6 h-6 bg-[#1a1530] border border-indigo-500/30 rounded-full flex items-center justify-center text-xs font-black text-indigo-300 shadow-lg shadow-indigo-500/10 group-hover/step:scale-110 transition-transform relative z-10">{j + 1}</span>
                                                    <span className="text-white/60 text-sm font-semibold leading-relaxed group-hover/step:text-white transition-colors pt-0.5">{step}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </ProtectedLayout>
    )
}
