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
            <div className="max-w-5xl mx-auto space-y-12">
                <header className="flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 mb-2">My Tailored Resumes</h1>
                        <p className="text-gray-600 font-medium">Manage and export all your AI-optimized resumes.</p>
                    </div>
                    <Link
                        href="/tailor"
                        className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg"
                    >
                        + New Tailored Resume
                    </Link>
                </header>

                {loading ? (
                    <div className="flex justify-center py-24">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                ) : resumes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {resumes.map((resume) => (
                            <div key={resume._id} className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-xl shadow-gray-200/50 hover:border-indigo-100 transition-all group">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(resume._id)}
                                            className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>

                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
                                            {resume.resume_data?.name || "Untitled Resume"}
                                        </h3>
                                        <p className="text-sm text-gray-500 font-medium">
                                            Last updated: {new Date(resume.updated_at).toLocaleDateString()}
                                        </p>
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                        <button
                                            onClick={() => setEditingResume(resume)}
                                            className="flex-1 py-2 bg-gray-50 text-gray-700 font-bold rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all text-sm"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDownloadPDF(resume.resume_data)}
                                            disabled={pdfLoading}
                                            className="flex-1 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all text-sm shadow-md shadow-indigo-100"
                                        >
                                            PDF
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300 shadow-inner">
                            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">No tailored resumes yet</h3>
                        <p className="text-gray-600 font-medium mb-8 max-w-sm mx-auto">Generate your first AI-optimized resume and save it here for easy access.</p>
                        <Link
                            href="/tailor"
                            className="text-indigo-600 font-black text-lg hover:underline"
                        >
                            Get started now →
                        </Link>
                    </div>
                )}
            </div>
        </ProtectedLayout>
    )
}
