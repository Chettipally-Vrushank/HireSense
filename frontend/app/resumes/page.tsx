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
        return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    }

    return (
        <ProtectedLayout>
            {/* Toast */}
            {toast && (
                <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl text-sm font-bold shadow-xl transition-all animate-slide-up
                    ${toast.type === "success"
                        ? "bg-green-600 text-white shadow-green-200"
                        : "bg-red-500 text-white shadow-red-200"}`}>
                    {toast.type === "success" ? "✓ " : "✕ "}{toast.message}
                </div>
            )}

            <div className="max-w-5xl mx-auto space-y-10">

                {/* Header */}
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 mb-1">My Resumes</h1>
                        <p className="text-gray-500 font-medium">
                            {resumes.length > 0
                                ? `${resumes.length} resume${resumes.length > 1 ? "s" : ""} uploaded`
                                : "Upload your first resume to get started"}
                        </p>
                    </div>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50"
                    >
                        {uploading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                </svg>
                                Upload Resume
                            </>
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

                {/* Upload Drop Zone — shown when no resumes or always */}
                <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`cursor-pointer border-2 border-dashed rounded-[2rem] p-10 flex flex-col items-center justify-center text-center transition-all
                        ${dragActive
                            ? "border-indigo-500 bg-indigo-50 scale-[1.01]"
                            : "border-gray-200 bg-gray-50/50 hover:border-indigo-300 hover:bg-indigo-50/30"}`}
                >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all
                        ${dragActive ? "bg-indigo-100 text-indigo-600" : "bg-white text-gray-400 shadow-sm"}`}>
                        {uploading ? (
                            <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                        ) : (
                            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                        )}
                    </div>
                    <p className="font-bold text-gray-700 mb-1">
                        {uploading ? "Processing your resume..." : dragActive ? "Drop it here!" : "Drag & drop your PDF here"}
                    </p>
                    <p className="text-sm text-gray-400 font-medium">or click to browse · PDF only</p>
                </div>

                {/* Resume List */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
                    </div>
                ) : resumes.length > 0 ? (
                    <div className="space-y-4">
                        {resumes.map((resume, index) => {
                            const name = resume.parsed_data?.name || "Unnamed Resume"
                            const skillCount = resume.extracted_skills?.length || 0
                            const skills = resume.extracted_skills?.slice(0, 5) || []
                            const remaining = (resume.extracted_skills?.length || 0) - 5
                            const isDeleting = deletingId === resume._id

                            return (
                                <div
                                    key={resume._id}
                                    className="group bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/60 hover:border-indigo-100 transition-all duration-300 overflow-hidden"
                                >
                                    <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">

                                        {/* Avatar */}
                                        <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-200">
                                            {getInitials(resume.parsed_data?.name)}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-3 mb-2">
                                                <div>
                                                    <h3 className="text-lg font-black text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
                                                        {name}
                                                    </h3>
                                                    <p className="text-xs text-gray-400 font-medium mt-0.5 flex items-center gap-2">
                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        Uploaded {formatDate(resume.uploaded_at)}
                                                        <span className="w-1 h-1 rounded-full bg-gray-300 inline-block" />
                                                        <span className="text-indigo-500 font-bold">{skillCount} skills</span>
                                                    </p>
                                                </div>

                                                {/* Resume number badge */}
                                                <span className="flex-shrink-0 text-xs font-black text-gray-300 bg-gray-50 rounded-xl px-2.5 py-1">
                                                    #{resumes.length - index}
                                                </span>
                                            </div>

                                            {/* Skills preview */}
                                            {skills.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5 mt-2">
                                                    {skills.map((skill, i) => (
                                                        <span key={i} className="px-2.5 py-0.5 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-lg border border-indigo-100">
                                                            {skill}
                                                        </span>
                                                    ))}
                                                    {remaining > 0 && (
                                                        <span className="px-2.5 py-0.5 bg-gray-50 text-gray-500 text-xs font-bold rounded-lg border border-gray-100">
                                                            +{remaining} more
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex items-center gap-2 flex-shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200">
                                            {/* Analyse */}
                                            <Link
                                                href={`/analyze?id=${resume._id}`}
                                                className="flex items-center gap-1.5 px-4 py-2 bg-gray-50 hover:bg-indigo-50 text-gray-600 hover:text-indigo-600 font-bold rounded-xl transition-all text-sm border border-gray-100 hover:border-indigo-200"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                </svg>
                                                Analyse
                                            </Link>

                                            {/* Tailor */}
                                            <Link
                                                href={`/tailor?id=${resume._id}`}
                                                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all text-sm shadow-md shadow-indigo-100"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                                Tailor
                                            </Link>

                                            {/* Delete */}
                                            <button
                                                onClick={() => handleDelete(resume._id)}
                                                disabled={isDeleting}
                                                className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100 disabled:opacity-50"
                                                title="Delete resume"
                                            >
                                                {isDeleting ? (
                                                    <div className="w-4 h-4 border-2 border-red-200 border-t-red-500 rounded-full animate-spin" />
                                                ) : (
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Bottom action bar — always visible on mobile, hover on desktop */}
                                    <div className="sm:hidden border-t border-gray-50 px-6 py-3 flex gap-2">
                                        <Link href={`/analyze?id=${resume._id}`}
                                            className="flex-1 py-2 text-center text-sm font-bold text-gray-600 bg-gray-50 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                                            Analyse
                                        </Link>
                                        <Link href={`/tailor?id=${resume._id}`}
                                            className="flex-1 py-2 text-center text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all">
                                            Tailor
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(resume._id)}
                                            className="px-3 py-2 text-gray-400 hover:text-red-500 bg-gray-50 rounded-xl hover:bg-red-50 transition-all text-sm font-bold">
                                            Del
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 text-gray-200 shadow-inner">
                            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-2">No resumes yet</h3>
                        <p className="text-gray-500 font-medium mb-8 max-w-xs mx-auto">
                            Upload your first resume to start analyzing and tailoring it for any job.
                        </p>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="text-indigo-600 font-black text-lg hover:underline"
                        >
                            Upload now →
                        </button>
                    </div>
                )}
            </div>
        </ProtectedLayout>
    )
}