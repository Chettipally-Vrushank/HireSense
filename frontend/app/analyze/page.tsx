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
            const resumeData = await parseRes.json()

            const matchRes = await api.post("/ai/match", {
                jd_skills: jdText.split(/[\n,]+/).map(s => s.trim()).filter(s => s),
                resume_skills: resumeData.skills
            })
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
            <div className="max-w-4xl mx-auto space-y-12">
                <header className="text-center">
                    <h1 className="text-4xl font-black text-gray-900 mb-4">Analyze Resume</h1>
                    <p className="text-gray-500 text-lg">Compare your profile against any job posting in seconds.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-sm font-black">1</span>
                            Upload Resume
                        </h2>
                        <ResumeUpload onFileSelect={setFile} />
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-sm font-black">2</span>
                            Job Description
                        </h2>
                        <textarea
                            className="w-full h-48 px-6 py-5 rounded-[2rem] border border-gray-200 bg-gray-50/50 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all resize-none text-sm leading-relaxed text-gray-900 font-medium"
                            placeholder="Paste the job requirements here..."
                            value={jdText}
                            onChange={(e) => setJdText(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex justify-center">
                    <button
                        onClick={handleAnalyze}
                        disabled={loading || !file || !jdText}
                        className="px-12 py-5 bg-gray-900 text-white text-lg font-bold rounded-[2rem] hover:bg-black transition-all shadow-2xl shadow-gray-300 disabled:opacity-30 disabled:cursor-not-allowed group relative overflow-hidden"
                    >
                        <span className="relative z-10 flex items-center gap-3">
                            {loading ? "Analyzing Profile..." : "Run AI Analysis"}
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                        </span>
                    </button>
                </div>

                {result && (
                    <MatchResult
                        result={result}
                        onGenerateRecs={handleFetchRecs}
                        recLoading={recLoading}
                    />
                )}

                {recommendations && (
                    <div className="space-y-8 animate-slide-up">
                        <div className="text-center">
                            <h2 className="text-3xl font-black text-gray-900 mb-2">Your AI Learning Path</h2>
                            <p className="text-gray-600 font-medium">Step-by-step roadmap to bridge your skill gaps.</p>
                        </div>
                        <div className="grid grid-cols-1 gap-6">
                            {recommendations.map((rec: any, i: number) => (
                                <div key={i} className="bg-white rounded-[2rem] p-8 border border-indigo-100 shadow-xl shadow-indigo-100/20 group hover:border-indigo-400 transition-colors">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                                        <div>
                                            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-black uppercase tracking-widest rounded-lg mb-2 inline-block">Recommended Skill</span>
                                            <h3 className="text-2xl font-bold text-gray-900">{rec.skill_name}</h3>
                                        </div>
                                        <div className="px-4 py-2 bg-amber-50 rounded-xl">
                                            <span className="text-xs font-bold text-amber-800 uppercase tracking-widest block">Importance</span>
                                            <span className="text-sm font-black text-amber-600">{rec.importance}</span>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 rounded-2xl p-6">
                                        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Learning roadmap</h4>
                                        <ul className="space-y-4">
                                            {rec.roadmap?.map((step: string, j: number) => (
                                                <li key={j} className="flex gap-4 items-start">
                                                    <span className="flex-shrink-0 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-700">{j + 1}</span>
                                                    <span className="text-gray-800 text-sm font-medium leading-relaxed">{step}</span>
                                                </li>
                                            ))}
                                        </ul>
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
