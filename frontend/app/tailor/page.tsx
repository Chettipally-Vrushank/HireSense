"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { api } from "@/lib/api"
import ProtectedLayout from "@/components/ProtectedLayout"
import { ResumeUpload } from "@/components/AnalysisUI"
import ResumeEditor from "@/components/ResumeEditor"

export default function TailorPage() {
    const searchParams = useSearchParams()
    const [file, setFile] = useState<File | null>(null)
    const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null)
    const [jdText, setJdText] = useState("")
    const [loading, setLoading] = useState(false)
    const [tailoredData, setTailoredData] = useState<any>(null)
    const [pdfLoading, setPdfLoading] = useState(false)

    useEffect(() => {
        const id = searchParams.get("id")
        if (id) {
            setSelectedResumeId(id)
        }
    }, [searchParams])

    const handleTailor = async () => {
        if ((!file && !selectedResumeId) || !jdText) return
        setLoading(true)
        setTailoredData(null)

        try {
            let resumeId = selectedResumeId

            if (!resumeId && file) {
                // 1. Upload and parse resume to get a resume_id
                const formData = new FormData()
                formData.append("file", file)
                const uploadRes = await api.upload("/ai/parse-resume-pdf", formData)
                const resumeInfo = await uploadRes.json()
                resumeId = resumeInfo.id
            }

            if (!resumeId) throw new Error("Could not determine resume ID")

            // In our current backend, parse-resume-pdf might not return an ID yet 
            // if it just calls parse_resume. Let's assume we need to save it or use a separate flow.
            // Wait, my implemented backend /ai/parse-resume-pdf doesn't save to DB.
            // But I implemented save_resume in the repo.

            // Let's check my main.py implementation again.
            // Actually, I should have a separate endpoint or modify the current one.
            // For now, I'll use the ID if returned, or modify main.py to save it.

            // Re-evaluating backend: I need /ai/tailor-resume to take resume_id.
            // So I need an endpoint to save the resume first.

            const tailorRes = await api.post("/ai/tailor-resume", {
                resume_id: resumeId,
                job_description: jdText
            })

            if (tailorRes.ok) {
                const data = await tailorRes.json()
                setTailoredData(data)
            } else {
                alert("Failed to tailor resume.")
            }
        } catch (err) {
            console.error("Tailoring failed:", err)
            alert("Something went wrong.")
        } finally {
            setLoading(false)
        }
    }

    const handleDownloadPDF = async () => {
        if (!tailoredData) return
        setPdfLoading(true)
        try {
            const blob = await api.blob("/ai/generate-pdf", {
                resume_data: tailoredData
            })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `Tailored_Resume_${tailoredData.name || "User"}.pdf`
            document.body.appendChild(a)
            a.click()
            a.remove()
        } catch (err) {
            console.error("PDF download failed:", err)
            alert("Failed to generate PDF.")
        } finally {
            setPdfLoading(false)
        }
    }

    return (
        <ProtectedLayout>
            <div className="max-w-4xl mx-auto space-y-12">
                <header className="text-center">
                    <h1 className="text-4xl font-black text-gray-900 mb-4">AI Resume Tailor</h1>
                    <p className="text-gray-500 text-lg">Automatically rewrite your resume to match any job description.</p>
                </header>

                {!tailoredData ? (
                    <div className="space-y-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-sm font-black">1</span>
                                    {selectedResumeId ? "Resume Selected" : "Upload Original Resume"}
                                </h2>
                                {selectedResumeId ? (
                                    <div className="bg-gray-50 border border-indigo-100 rounded-[2rem] p-8 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-gray-100">
                                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">Stored Resume Selected</p>
                                                <p className="text-xs text-gray-600 font-medium">Using the resume selected from your dashboard.</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setSelectedResumeId(null)}
                                            className="text-xs font-bold text-red-500 hover:text-red-700 underline"
                                        >
                                            Change
                                        </button>
                                    </div>
                                ) : (
                                    <ResumeUpload onFileSelect={setFile} />
                                )}
                            </div>

                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-sm font-black">2</span>
                                    Target Job Description
                                </h2>
                                <textarea
                                    className="w-full h-48 px-6 py-5 rounded-[2rem] border border-gray-200 bg-gray-50/50 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all resize-none text-sm leading-relaxed text-gray-900 font-medium"
                                    placeholder="Paste the job description you're applying for..."
                                    value={jdText}
                                    onChange={(e) => setJdText(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <button
                                onClick={handleTailor}
                                disabled={loading || (!file && !selectedResumeId) || !jdText}
                                className="px-12 py-5 bg-gray-900 text-white text-lg font-bold rounded-[2rem] hover:bg-black transition-all shadow-2xl shadow-gray-300 disabled:opacity-30 disabled:cursor-not-allowed group relative overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center gap-3">
                                    {loading ? "Generating Magic..." : "Tailor My Resume"}
                                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                                </span>
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8">
                        <ResumeEditor
                            data={tailoredData}
                            onSave={setTailoredData}
                            onDownload={handleDownloadPDF}
                        />
                        <div className="flex justify-center">
                            <button
                                onClick={() => setTailoredData(null)}
                                className="text-gray-500 font-bold hover:text-gray-700 transition-colors"
                            >
                                ← Start over with new JD
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedLayout>
    )
}
