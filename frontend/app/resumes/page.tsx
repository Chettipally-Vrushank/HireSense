"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import ProtectedLayout from "@/components/ProtectedLayout"

type Resume = {
    _id: string
    parsed_data?: { name?: string }
    extracted_skills?: string[]
    uploaded_at: string
    original_text?: string
}

export default function MyResumesPage() {
    const router = useRouter()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [resumes, setResumes] = useState<Resume[]>([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [dragActive, setDragActive] = useState(false)
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

    useEffect(() => {
        fetchResumes()
    }, [])

    const showToast = (message: string, type: "success" | "error") => {
        setToast({ message, type })
        setTimeout(() => setToast(null), 3500)
    }

    const fetchResumes = async () => {
        setLoading(true)
        try {
            const res = await api.get("/ai/resumes")
            if (res.ok) setResumes(await res.json())
        } catch (err) {
            console.error("Failed to fetch resumes:", err)
            showToast("Failed to load resumes.", "error")
        } finally {
            setLoading(false)
        }
    }

    const handleUpload = async (file: File) => {
        if (!file || file.type !== "application/pdf") {
            showToast("Please upload a PDF file.", "error")
            return
        }
        setUploading(true)
        try {
            const formData = new FormData()
            formData.append("file", file)
            const res = await api.upload("/ai/parse-resume-pdf", formData)
            if (res.ok) {
                showToast("Resume uploaded successfully!", "success")
                await fetchResumes()
            } else {
                const err = await res.json()
                showToast(err.detail || "Upload failed.", "error")
            }
        } catch (err) {
            console.error("Upload error:", err)
            showToast("Something went wrong during upload.", "error")
        } finally {
            setUploading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this resume? This cannot be undone.")) return
        setDeletingId(id)
        try {
            const res = await api.delete(`/ai/resumes/${id}`)
            if (res.ok) {
                setResumes(prev => prev.filter(r => r._id !== id))
                showToast("Resume deleted.", "success")
            } else {
                showToast("Failed to delete resume.", "error")
            }
        } catch (err) {
            console.error("Delete error:", err)
            showToast("Error deleting resume.", "error")
        } finally {
            setDeletingId(null)
        }
    }

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
        const file = e.dataTransfer.files?.[0]
        if (file) handleUpload(file)
    }

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr)
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    }

    const getInitials = (name?: string) => {
        if (!name) return "?"
        return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 1)
    }

    return (
        <ProtectedLayout>
            <div className="max-w-6xl mx-auto space-y-12 animate-fade-in pb-20">

                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full mb-4 inline-block">Library</span>
                        <h1 className="text-4xl sm:text-5xl font-black text-white">Original Resumes</h1>
                        <p className="text-white/45 text-lg mt-2 font-medium">
                            {resumes.length > 0
                                ? `Managing ${resumes.length} profile${resumes.length > 1 ? "s" : ""} for analysis.`
                                : "Upload your master resume as a starting point."}
                        </p>
                    </div>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="px-8 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 hover:-translate-y-1 active:scale-95 flex items-center gap-3 disabled:opacity-50"
                    >
                        {uploading ? (
                            <><div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
                        ) : (
                            <><span className="text-xl">+</span> Upload New</>
                        )}
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = "" }}
                    />
                </header>

                {/* Upload Drop Zone */}
                <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`cursor-pointer border-2 border-dashed rounded-[3rem] p-14 flex flex-col items-center justify-center text-center transition-all relative overflow-hidden group
                        ${dragActive
                            ? "border-indigo-500 bg-indigo-500/10 scale-[1.01]"
                            : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"}`}
                >
                    <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mb-6 transition-all relative z-10
                        ${dragActive ? "bg-indigo-500 text-white shadow-2xl" : "bg-white/10 text-white/30 border border-white/10 shadow-lg"}`}>
                        {uploading ? (
                            <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <svg className="w-9 h-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                        )}
                    </div>
                    <p className="text-xl font-black text-white mb-2 relative z-10">
                        {uploading ? "Analyzing document structure..." : dragActive ? "Release to upload" : "Import Master Resume"}
                    </p>
                    <p className="text-white/40 font-bold uppercase tracking-widest text-xs relative z-10">Drag PDF here or click to browse</p>
                </div>

                {/* Resume List */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-4">
                        <div className="w-16 h-16 border-4 border-white/5 border-t-indigo-500 rounded-full animate-spin" />
                        <p className="text-white/40 font-bold uppercase tracking-widest text-xs animate-pulse">Scanning Archive...</p>
                    </div>
                ) : resumes.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6">
                        {resumes.map((resume, index) => {
                            const name = resume.parsed_data?.name || "Unnamed Document"
                            const skillCount = resume.extracted_skills?.length || 0
                            const skills = resume.extracted_skills?.slice(0, 6) || []
                            const remaining = (resume.extracted_skills?.length || 0) - 6
                            const isDeleting = deletingId === resume._id

                            return (
                                <div
                                    key={resume._id}
                                    className="group bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 shadow-2xl hover:border-indigo-500/30 transition-all duration-300 overflow-hidden relative"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-transparent pointer-events-none" />
                                    <div className="p-8 flex flex-col sm:flex-row items-start sm:items-center gap-8 relative z-10">
                                        <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-3xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-indigo-500/20">
                                            {getInitials(name)}
                                        </div>

                                        <div className="flex-1 min-w-0 space-y-4">
                                            <div className="flex items-start justify-between gap-6">
                                                <div>
                                                    <h3 className="text-2xl font-black text-white group-hover:text-indigo-400 transition-colors truncate">
                                                        {name}
                                                    </h3>
                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-bold uppercase tracking-widest mt-2">
                                                        <span className="text-indigo-400 flex items-center gap-1.5">
                                                            <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                                                            PDF DOCUMENT
                                                        </span>
                                                        <span className="text-white/30 flex items-center gap-1.5">
                                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                            {formatDate(resume.uploaded_at)}
                                                        </span>
                                                        <span className="text-emerald-400/80 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                                                            {skillCount} SKILLS EXTRACTED
                                                        </span>
                                                    </div>
                                                </div>
                                                <span className="hidden sm:flex flex-shrink-0 text-[10px] font-black text-white/10 border border-white/5 rounded-xl px-3 py-1.5 bg-white/5 items-center">
                                                    ID: #{resume._id.slice(-4).toUpperCase()}
                                                </span>
                                            </div>

                                            {skills.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {skills.map((skill, i) => (
                                                        <span key={i} className="px-3 py-1.5 bg-black/20 border border-white/5 text-white/50 text-[10px] font-black uppercase tracking-widest rounded-xl group-hover:text-indigo-300 group-hover:border-indigo-500/20 transition-all">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                    {remaining > 0 && (
                                                        <span className="px-3 py-1.5 bg-white/5 text-white/20 text-[10px] font-black uppercase tracking-widest rounded-xl">
                                                            +{remaining} MORE
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-3 w-full sm:w-auto pt-4 sm:pt-0 border-t border-white/5 sm:border-0">
                                            <Link
                                                href={`/analyze?id=${resume._id}`}
                                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-black rounded-[1.25rem] transition-all text-sm border border-white/5"
                                            >
                                                Analyse
                                            </Link>
                                            <Link
                                                href={`/tailor?id=${resume._id}`}
                                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-[1.25rem] transition-all text-sm shadow-xl shadow-indigo-500/20"
                                            >
                                                Tailor
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(resume._id)}
                                                disabled={isDeleting}
                                                className="w-11 h-11 flex items-center justify-center rounded-[1.25rem] text-white/20 hover:text-red-400 bg-white/5 hover:bg-red-500/10 transition-all border border-white/5 hover:border-red-500/20 disabled:opacity-50"
                                            >
                                                {isDeleting ? (
                                                    <div className="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                                                ) : (
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="text-center py-32 bg-white/5 rounded-[4rem] border-2 border-dashed border-white/10 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        <div className="relative z-10">
                            <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-8 text-white/20 shadow-2xl">
                                <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="text-3xl font-black text-white mb-3">No master resumes yet</h3>
                            <p className="text-white/45 font-medium mb-10 max-w-sm mx-auto">Upload your master resume as a starting point for AI analysis and tailoring.</p>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="inline-flex items-center gap-3 px-10 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 active:scale-95"
                            >
                                Upload Master <span className="text-xl">→</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedLayout>
    )
}