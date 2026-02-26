"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import ProtectedLayout from "@/components/ProtectedLayout"
import ResumeEditor from "@/components/ResumeEditor"
import Link from "next/link"

export default function TailoredResumesPage() {
    const [resumes, setResumes] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [editingResume, setEditingResume] = useState<any | null>(null)
    const [saving, setSaving] = useState(false)
    const [pdfLoading, setPdfLoading] = useState(false)

    useEffect(() => {
        fetchResumes()
    }, [])

    const fetchResumes = async () => {
        setLoading(true)
        try {
            const res = await api.get("/ai/tailored-resumes")
            if (res.ok) {
                setResumes(await res.json())
            }
        } catch (err) {
            console.error("Failed to fetch tailored resumes:", err)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this tailored resume?")) return
        try {
            const res = await api.delete(`/ai/tailored-resumes/${id}`)
            if (res.ok) {
                setResumes(resumes.filter(r => r._id !== id))
            } else {
                alert("Failed to delete.")
            }
        } catch (err) {
            console.error("Delete failed:", err)
            alert("Error deleting resume.")
        }
    }

    const handleUpdate = async () => {
        if (!editingResume) return
        setSaving(true)
        try {
            const res = await api.put(`/ai/tailored-resumes/${editingResume._id}`, editingResume.resume_data)
            if (res.ok) {
                alert("Changes saved!")
                setEditingResume(null)
                fetchResumes()
            } else {
                alert("Failed to save changes.")
            }
        } catch (err) {
            console.error("Update failed:", err)
            alert("Error updating resume.")
        } finally {
            setSaving(false)
        }
    }

    const handleDownloadPDF = async (data: any) => {
        setPdfLoading(true)
        try {
            const blob = await api.blob("/ai/generate-pdf", {
                resume_data: data
            })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `Tailored_Resume_${data.name || "User"}.pdf`
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

    if (editingResume) {
        return (
            <ProtectedLayout>
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setEditingResume(null)}
                            className="text-indigo-600 font-bold hover:underline"
                        >
                            ← Back to list
                        </button>
                        <h1 className="text-2xl font-black text-gray-900">Editing Tailored Resume</h1>
                    </div>

                    <ResumeEditor
                        data={editingResume.resume_data}
                        onSave={(newData) => setEditingResume({ ...editingResume, resume_data: newData })}
                        onDownload={() => handleDownloadPDF(editingResume.resume_data)}
                        onSavePersist={handleUpdate}
                        isSaving={saving}
                    />
                </div>
            </ProtectedLayout>
        )
    }

    return (
        <ProtectedLayout>
            <div className="max-w-6xl mx-auto space-y-12 animate-fade-in pb-20">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full mb-4 inline-block">Vault</span>
                        <h1 className="text-4xl sm:text-5xl font-black text-white">My Tailored Resumes</h1>
                        <p className="text-white/45 text-lg mt-2">Manage and export all your AI-optimized resumes.</p>
                    </div>
                    <Link
                        href="/tailor"
                        className="px-8 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 hover:-translate-y-1 active:scale-95 flex items-center gap-2 group"
                    >
                        <span className="text-xl group-hover:rotate-90 transition-transform">+</span>
                        Create New
                    </Link>
                </header>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-4">
                        <div className="w-16 h-16 border-4 border-white/5 border-t-indigo-500 rounded-full animate-spin" />
                        <p className="text-white/40 font-bold uppercase tracking-widest text-xs animate-pulse">Accessing Secure Storage...</p>
                    </div>
                ) : resumes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {resumes.map((resume) => (
                            <div key={resume._id} className="bg-white/5 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/10 shadow-2xl hover:border-indigo-500/30 transition-all group relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />
                                <div className="relative z-10 space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div className="w-14 h-14 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400 shadow-inner">
                                            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(resume._id)}
                                            className="p-3 text-white/20 hover:text-red-400 bg-white/5 hover:bg-red-500/10 rounded-xl transition-all"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-black text-white group-hover:text-indigo-400 transition-colors truncate mb-1">
                                            {resume.resume_data?.name || "Untitled Resume"}
                                        </h3>
                                        <p className="text-xs text-white/40 font-bold uppercase tracking-widest flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                            Updated {new Date(resume.updated_at).toLocaleDateString()}
                                        </p>
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            onClick={() => setEditingResume(resume)}
                                            className="flex-1 py-3 bg-white/5 text-white font-black rounded-2xl hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all text-sm"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDownloadPDF(resume.resume_data)}
                                            disabled={pdfLoading}
                                            className="flex-1 py-3 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all text-sm shadow-xl shadow-indigo-500/20"
                                        >
                                            {pdfLoading ? "..." : "PDF"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-32 bg-white/5 rounded-[4rem] border-2 border-dashed border-white/10 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        <div className="relative z-10">
                            <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-8 text-white/20 shadow-2xl">
                                <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="text-3xl font-black text-white mb-3">Your vault is empty</h3>
                            <p className="text-white/45 font-medium mb-10 max-w-sm mx-auto">Optimize your first resume and save it here for instant access whenever you need it.</p>
                            <Link
                                href="/tailor"
                                className="inline-flex items-center gap-3 px-10 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 active:scale-95"
                            >
                                Start Tailoring <span className="text-xl">→</span>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedLayout>
    )
}
