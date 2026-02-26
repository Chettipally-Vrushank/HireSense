"use client"

import { useState, useRef } from "react"

export function ResumeUpload({ onFileSelect }: { onFileSelect: (file: File) => void }) {
    const [dragActive, setDragActive] = useState(false)
    const [fileName, setFileName] = useState<string | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") setDragActive(true)
        else if (e.type === "dragleave") setDragActive(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0]
            setFileName(file.name)
            onFileSelect(file)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            setFileName(file.name)
            onFileSelect(file)
        }
    }

    return (
        <div
            className={`relative group border-2 border-dashed rounded-[2rem] p-10 transition-all flex flex-col items-center justify-center text-center cursor-pointer ${dragActive ? "border-indigo-500 bg-indigo-500/10" : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20"
                }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
        >
            <input ref={inputRef} type="file" accept=".pdf" className="hidden" onChange={handleChange} />
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 shadow-lg ${fileName ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-white/10 text-indigo-400 border border-white/10"}`}>
                {fileName ? (
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                ) : (
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                )}
            </div>
            <p className="text-lg font-black text-white mb-1">{fileName || "Upload Resume PDF"}</p>
            <p className="text-white/40 font-semibold text-sm">Drag and drop or click to browse</p>
        </div>
    )
}

export function MatchResult({ result, onGenerateRecs, recLoading }: { result: any, onGenerateRecs: () => void, recLoading: boolean }) {
    const score = result?.fit_score || 0
    const colorClass = score > 70 ? "text-emerald-400" : score > 40 ? "text-amber-400" : "text-red-400"
    const bgClass = score > 70 ? "bg-emerald-400" : score > 40 ? "bg-amber-400" : "bg-red-400"

    return (
        <div className="bg-white/5 backdrop-blur-md rounded-[2.5rem] p-8 sm:p-10 border border-white/10 shadow-2xl animate-slide-up">
            <div className="flex flex-col md:flex-row items-center gap-10 md:gap-14 mb-10">
                <div className="relative w-44 h-44 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="88" cy="88" r="76" stroke="rgba(255,255,255,0.05)" strokeWidth="12" fill="transparent" />
                        <circle
                            cx="88" cy="88" r="76" stroke="currentColor" strokeWidth="12" fill="transparent"
                            strokeDasharray={478} strokeDashoffset={478 - (478 * score) / 100}
                            strokeLinecap="round" className={`${colorClass} transition-all duration-1000 ease-out`}
                            style={{ filter: "drop-shadow(0 0 8px currentColor)" }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-5xl font-black tracking-tighter ${colorClass}`}>{score}%</span>
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Match Fit</span>
                    </div>
                </div>

                <div className="flex-1 space-y-6 text-center md:text-left">
                    <div>
                        <h3 className="text-3xl font-black text-white mb-3">Analysis Result</h3>
                        <p className="text-white/45 font-medium leading-relaxed max-w-md">Our AI analyzed your experience against the job requirements. Here's your compatibility breakdown.</p>
                    </div>
                    {!result.recommendations && (
                        <button
                            onClick={onGenerateRecs}
                            disabled={recLoading}
                            className="px-10 py-3.5 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 disabled:opacity-50 flex items-center gap-3 mx-auto md:mx-0"
                        >
                            {recLoading ? (
                                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing Gaps...</>
                            ) : (
                                <>🎯 Generate AI Roadmap</>
                            )}
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/5">
                <div className="bg-emerald-500/5 rounded-3xl p-7 border border-emerald-500/10">
                    <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
                        <span className="block w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"></span> Matched Skills
                    </h4>
                    <div className="flex flex-wrap gap-2.5">
                        {result.matched_skills?.map((s: string, i: number) => (
                            <span key={i} className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-xl text-xs font-bold shadow-sm">{s}</span>
                        ))}
                    </div>
                </div>

                <div className="bg-red-500/5 rounded-3xl p-7 border border-red-500/10">
                    <h4 className="text-[10px] font-black text-red-400 uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
                        <span className="block w-2 h-2 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.6)]"></span> Missing Skills
                    </h4>
                    <div className="flex flex-wrap gap-2.5">
                        {result.missing_skills?.map((s: string, i: number) => (
                            <span key={i} className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-300 rounded-xl text-xs font-bold shadow-sm">{s}</span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
