"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { api } from "@/lib/api"
import ProtectedLayout from "@/components/ProtectedLayout"

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null)
    const [resumes, setResumes] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            try {
                const [userResp, resumesResp] = await Promise.all([
                    api.get("/auth/me"),
                    api.get("/ai/resumes")
                ])

                if (userResp.ok) setUser(await userResp.json())
                if (resumesResp.ok) setResumes(await resumesResp.json())

            } catch (err) {
                console.error("Failed to fetch dashboard data:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    return (
        <ProtectedLayout>
            <div className="space-y-8 animate-fade-in">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Welcome back, <span className="text-indigo-600">{user?.email?.split('@')[0] || 'User'}</span>!
                        </h1>
                        <p className="text-gray-600 font-medium mt-1">Ready to optimize your career path today?</p>
                    </div>
                    <Link
                        href="/analyze"
                        className="w-full md:w-auto px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 text-center"
                    >
                        New Analysis
                    </Link>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Recent Activity</h2>
                            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider">
                                {resumes.length} total
                            </span>
                        </div>

                        {resumes.length > 0 ? (
                            <div className="space-y-4">
                                {resumes.map((resume) => (
                                    <div key={resume._id} className="group flex items-center justify-between p-4 bg-gray-50/50 hover:bg-white hover:border-indigo-100 border border-transparent rounded-2xl transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm border border-gray-100">
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                                    {resume.parsed_data?.name || "Uploaded Resume"}
                                                </h3>
                                                <p className="text-xs text-gray-600 font-medium">
                                                    {new Date(resume.uploaded_at).toLocaleDateString()} • {resume.extracted_skills?.length || 0} skills identified
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Link
                                                href={`/tailor?id=${resume._id}`}
                                                className="px-4 py-2 bg-white border border-gray-200 text-xs font-bold rounded-xl hover:border-indigo-500 hover:text-indigo-600 transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                Tailor Now
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300 transform rotate-12">
                                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">No analyses yet</h3>
                                <p className="text-gray-600 font-medium max-w-xs mx-auto mb-6">Upload your first resume and match it against a job description to see results here.</p>
                                <Link href="/analyze" className="text-indigo-600 font-bold hover:underline">
                                    Get started →
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2rem] p-8 text-white shadow-xl shadow-indigo-200 relative overflow-hidden">
                        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                        <h2 className="text-xl font-bold mb-4 relative z-10">Pro Tip</h2>
                        <p className="text-indigo-50/90 leading-relaxed mb-6 relative z-10">
                            Keywords are king. Our AI analyzes not just words, but the semantic context of your experience.
                        </p>
                        <button className="bg-white/20 hover:bg-white/30 transition-all rounded-xl px-4 py-2 text-sm font-bold backdrop-blur-md">
                            Read Career Guide
                        </button>
                    </div>
                </div>
            </div>
        </ProtectedLayout>
    )
}
