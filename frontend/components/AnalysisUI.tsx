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
            className={`relative group border-2 border-dashed rounded-[2rem] p-10 transition-all flex flex-col items-center justify-center text-center ${dragActive ? "border-indigo-600 bg-indigo-50/50" : "border-gray-200 bg-gray-50/50 hover:bg-gray-50 hover:border-indigo-400"
                }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
        >
            <input ref={inputRef} type="file" accept=".pdf" className="hidden" onChange={handleChange} />
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${fileName ? "bg-green-100 text-green-600" : "bg-white text-indigo-600 shadow-sm"}`}>
                {fileName ? (
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                ) : (
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                )}
            </div>
            <p className="text-lg font-bold text-gray-900 mb-1">{fileName || "Upload Resume PDF"}</p>
            <p className="text-gray-600 font-medium text-sm">Drag and drop or click to browse</p>
        </div>
    )
}

export function MatchResult({ result, onGenerateRecs, recLoading }: { result: any, onGenerateRecs: () => void, recLoading: boolean }) {
    const score = result?.fit_score || 0
    const colorClass = score > 70 ? "text-green-600" : score > 40 ? "text-amber-600" : "text-red-600"
    const bgClass = score > 70 ? "bg-green-600" : score > 40 ? "bg-amber-600" : "bg-red-600"

    return (
        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl shadow-gray-200/50 animate-slide-up">
            <div className="flex flex-col md:flex-row items-center gap-12 mb-10">
                <div className="relative w-40 h-40 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-100" />
                        <circle
                            cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent"
                            strokeDasharray={440} strokeDashoffset={440 - (440 * score) / 100}
                            strokeLinecap="round" className={colorClass}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-4xl font-black ${colorClass}`}>{score}%</span>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Fit Score</span>
                    </div>
                </div>

                <div className="flex-1 space-y-6 text-center md:text-left">
                    <div>
                        <h3 className="text-2xl font-black text-gray-900 mb-2">Analysis Complete!</h3>
                        <p className="text-gray-600 font-medium leading-relaxed">We've compared your profile against the job requirements. Here's how you stack up.</p>
                    </div>
                    {!result.recommendations && (
                        <button
                            onClick={onGenerateRecs}
                            disabled={recLoading}
                            className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50"
                        >
                            {recLoading ? "Analyzing Gaps..." : "🎯 Generate AI Roadmap"}
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-green-50/50 rounded-3xl p-6 border border-green-100/50">
                    <h4 className="text-sm font-bold text-green-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="block w-2 h-2 rounded-full bg-green-500"></span> Matched Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {result.matched_skills?.map((s: string, i: number) => (
                            <span key={i} className="px-4 py-2 bg-white border border-green-200 text-green-700 rounded-xl text-sm font-bold shadow-sm whitespace-nowrap">{s}</span>
                        ))}
                    </div>
                </div>

                <div className="bg-red-50/50 rounded-3xl p-6 border border-red-100/50">
                    <h4 className="text-sm font-bold text-red-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="block w-2 h-2 rounded-full bg-red-500"></span> Missing Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {result.missing_skills?.map((s: string, i: number) => (
                            <span key={i} className="px-4 py-2 bg-white border border-red-200 text-red-700 rounded-xl text-sm font-bold shadow-sm whitespace-nowrap">{s}</span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
