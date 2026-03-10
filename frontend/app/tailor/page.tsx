"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { api } from "@/lib/api"
import ProtectedLayout from "@/components/ProtectedLayout"
import { ResumeUpload } from "@/components/AnalysisUI"

// ─────────────────────────────────────────────
// TEMPLATE DEFINITIONS
// ─────────────────────────────────────────────
type ResumeData = {
    name?: string; email?: string; phone?: string; summary?: string
    skills?: string[]
    experience?: { company: string; role: string; duration: string; bullets: string[] }[]
    projects?: { title: string; description: string }[]
    education?: { degree: string; institution: string; year: string }[]
}

const TEMPLATES = [
    {
        id: "classic",
        name: "Classic ATS",
        description: "Clean, single-column. Maximum ATS compatibility.",
        accent: "bg-gray-900",
        preview: (
            <div className="w-full h-full bg-white p-3 text-[6px] leading-tight font-mono">
                <div className="border-b-2 border-gray-900 pb-1 mb-1">
                    <div className="font-bold text-[8px]">FULL NAME</div>
                    <div className="text-gray-500">email · phone · location</div>
                </div>
                <div className="font-bold uppercase tracking-widest mb-0.5">Experience</div>
                {[1, 2].map(i => <div key={i} className="mb-1"><div className="flex justify-between"><span className="font-bold">Company {i}</span><span className="text-gray-400">2022–2024</span></div><div className="text-gray-600">Role Title</div><div className="text-gray-400 ml-1">• Bullet point description</div></div>)}
                <div className="font-bold uppercase tracking-widest mb-0.5">Skills</div>
                <div className="text-gray-600">Python · React · SQL · AWS</div>
            </div>
        )
    },
    {
        id: "modern",
        name: "Modern Split",
        description: "Two-column layout with colored sidebar.",
        accent: "bg-indigo-600",
        preview: (
            <div className="w-full h-full flex text-[6px] leading-tight">
                <div className="w-1/3 bg-indigo-700 text-white p-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-400 mx-auto mb-1" />
                    <div className="text-center font-bold text-[7px] mb-2">NAME</div>
                    <div className="font-bold uppercase text-indigo-300 mb-0.5">Skills</div>
                    {["Python", "React", "SQL", "AWS"].map(s => <div key={s} className="text-indigo-100 mb-0.5">• {s}</div>)}
                    <div className="font-bold uppercase text-indigo-300 mt-1 mb-0.5">Contact</div>
                    <div className="text-indigo-200">email@me.com</div>
                </div>
                <div className="flex-1 bg-white p-2">
                    <div className="font-bold uppercase tracking-widest text-indigo-700 mb-1">Experience</div>
                    {[1, 2].map(i => <div key={i} className="mb-1"><div className="font-bold">Company {i}</div><div className="text-gray-500">Role · 2022–24</div><div className="text-gray-400">• Key achievement</div></div>)}
                    <div className="font-bold uppercase tracking-widest text-indigo-700 mt-1 mb-0.5">Education</div>
                    <div className="text-gray-600">B.Tech CSE · 2027</div>
                </div>
            </div>
        )
    },
    {
        id: "minimal",
        name: "Minimal Serif",
        description: "Editorial style with generous whitespace.",
        accent: "bg-amber-600",
        preview: (
            <div className="w-full h-full bg-white p-3 text-[6px] leading-relaxed">
                <div className="text-center mb-2">
                    <div className="text-[10px] font-bold tracking-[0.2em] uppercase">Full Name</div>
                    <div className="text-gray-400 text-[5px] tracking-widest">email · phone · linkedin</div>
                    <div className="w-8 border-b border-amber-400 mx-auto mt-1" />
                </div>
                <div className="text-gray-500 text-center mb-2 italic">"Professional summary goes here"</div>
                <div className="text-[7px] font-bold tracking-widest uppercase border-b border-gray-200 mb-1">Work Experience</div>
                {[1, 2].map(i => <div key={i} className="mb-1.5"><div className="flex justify-between items-baseline"><span className="font-bold">Role Title {i}</span><span className="text-gray-400">2022–24</span></div><div className="text-amber-700 italic">Company Name</div><div className="text-gray-500">• Notable achievement description</div></div>)}
            </div>
        )
    }
]

// ─────────────────────────────────────────────
// RESUME EDITOR COMPONENT
// ─────────────────────────────────────────────
function ResumeEditor({ data, onChange }: { data: ResumeData; onChange: (d: ResumeData) => void }) {
    const set = (key: keyof ResumeData) => (val: any) => onChange({ ...data, [key]: val })

    return (
        <div className="space-y-6">
            {/* Contact */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />
                <h3 className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em] mb-6 px-1 relative z-10">Contact Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
                    {(["name", "email", "phone"] as const).map(f => (
                        <div key={f}>
                            <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest block mb-2 px-1">{f}</label>
                            <input className="w-full px-5 py-3 rounded-2xl border border-white/5 bg-white/5 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none text-sm text-white font-bold transition-all placeholder:text-white/10"
                                value={(data as any)[f] || ""} onChange={e => set(f)(e.target.value)} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Summary */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />
                <h3 className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em] mb-6 px-1 relative z-10">Professional Summary</h3>
                <textarea rows={4}
                    className="w-full px-6 py-5 rounded-3xl border border-white/5 bg-white/5 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none text-sm text-white font-bold resize-none transition-all placeholder:text-white/10 relative z-10"
                    value={data.summary || ""} onChange={e => set("summary")(e.target.value)} />
            </div>

            {/* Skills */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />
                <h3 className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em] mb-6 px-1 relative z-10">Technical Skills</h3>
                <div className="space-y-3 relative z-10">
                    {(data.skills || []).map((skill, i) => (
                        <div key={i} className="flex gap-3 items-center group/skill">
                            <input className="flex-1 px-5 py-3 rounded-2xl border border-white/5 bg-white/5 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none text-sm text-white font-bold"
                                value={skill}
                                onChange={e => {
                                    const s = [...(data.skills || [])]
                                    s[i] = e.target.value
                                    set("skills")(s)
                                }} />
                            <button onClick={() => set("skills")((data.skills || []).filter((_, j) => j !== i))}
                                className="w-10 h-10 flex items-center justify-center rounded-xl text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-all">×</button>
                        </div>
                    ))}
                    <button onClick={() => set("skills")([...(data.skills || []), ""])}
                        className="text-xs font-black text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest">+ Add Intelligence Node</button>
                </div>
            </div>

            {/* Experience */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />
                <h3 className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em] mb-6 px-1 relative z-10">Professional Experience</h3>
                <div className="space-y-6 relative z-10">
                    {(data.experience || []).map((exp, i) => (
                        <div key={i} className="border border-white/5 rounded-3xl p-6 space-y-4 bg-white/5 relative group/exp">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {(["company", "role", "duration"] as const).map(f => (
                                    <div key={f}>
                                        <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest block mb-2 px-1">{f}</label>
                                        <input className="w-full px-5 py-3 rounded-2xl border border-white/5 bg-white/5 focus:border-indigo-400 outline-none text-sm text-white font-bold"
                                            value={exp[f] || ""}
                                            onChange={e => {
                                                const exps = [...(data.experience || [])]
                                                exps[i] = { ...exps[i], [f]: e.target.value }
                                                set("experience")(exps)
                                            }} />
                                    </div>
                                ))}
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest block mb-3 px-1">Performance Bullets</label>
                                <div className="space-y-3">
                                    {(exp.bullets || []).map((b, j) => (
                                        <div key={j} className="flex gap-3 items-start group/bullet">
                                            <span className="text-indigo-500 mt-3 text-xs opacity-50">•</span>
                                            <input className="flex-1 px-5 py-2.5 rounded-2xl border border-white/5 bg-white/5 focus:border-indigo-400 outline-none text-sm text-white/80 font-medium"
                                                value={b}
                                                onChange={e => {
                                                    const exps = [...(data.experience || [])]
                                                    const bullets = [...(exps[i].bullets || [])]
                                                    bullets[j] = e.target.value
                                                    exps[i] = { ...exps[i], bullets }
                                                    set("experience")(exps)
                                                }} />
                                            <button onClick={() => {
                                                const exps = [...(data.experience || [])]
                                                exps[i] = { ...exps[i], bullets: exps[i].bullets.filter((_, k) => k !== j) }
                                                set("experience")(exps)
                                            }} className="w-9 h-9 mt-0.5 flex items-center justify-center rounded-xl text-white/10 hover:text-red-400 hover:bg-red-500/10 transition-all">×</button>
                                        </div>
                                    ))}
                                </div>
                                <button onClick={() => {
                                    const exps = [...(data.experience || [])]
                                    exps[i] = { ...exps[i], bullets: [...(exps[i].bullets || []), ""] }
                                    set("experience")(exps)
                                }} className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 transition-colors uppercase mt-4 tracking-widest ml-1">+ Add Strategic Bullet</button>
                            </div>
                            <button onClick={() => set("experience")((data.experience || []).filter((_, j) => j !== i))}
                                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-white/10 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover/exp:opacity-100">×</button>
                        </div>
                    ))}
                    <button onClick={() => set("experience")([...(data.experience || []), { company: "", role: "", duration: "", bullets: [""] }])}
                        className="text-xs font-black text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest">+ Insert Career Block</button>
                </div>
            </div>

            {/* Projects */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />
                <h3 className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em] mb-6 px-1 relative z-10">Strategic Projects</h3>
                <div className="space-y-6 relative z-10">
                    {(data.projects || []).map((proj, i) => (
                        <div key={i} className="border border-white/5 rounded-3xl p-6 space-y-4 bg-white/5 relative group/proj">
                            <div>
                                <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest block mb-2 px-1">Identity</label>
                                <input className="w-full px-5 py-3 rounded-2xl border border-white/5 bg-white/5 focus:border-indigo-400 outline-none text-sm text-white font-bold"
                                    value={proj.title || ""}
                                    onChange={e => {
                                        const ps = [...(data.projects || [])]
                                        ps[i] = { ...ps[i], title: e.target.value }
                                        set("projects")(ps)
                                    }} />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest block mb-2 px-1">Description</label>
                                <textarea rows={3}
                                    className="w-full px-6 py-4 rounded-2xl border border-white/5 bg-white/5 focus:border-indigo-400 outline-none text-sm text-white/70 font-medium resize-none"
                                    value={proj.description || ""}
                                    onChange={e => {
                                        const ps = [...(data.projects || [])]
                                        ps[i] = { ...ps[i], description: e.target.value }
                                        set("projects")(ps)
                                    }} />
                            </div>
                            <button onClick={() => set("projects")((data.projects || []).filter((_, j) => j !== i))}
                                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-white/10 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover/proj:opacity-100">×</button>
                        </div>
                    ))}
                    <button onClick={() => set("projects")([...(data.projects || []), { title: "", description: "" }])}
                        className="text-xs font-black text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest">+ Deploy New Project</button>
                </div>
            </div>

            {/* Education */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />
                <h3 className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em] mb-6 px-1 relative z-10">Academic Foundation</h3>
                <div className="space-y-4 relative z-10">
                    {(data.education || []).map((edu, i) => (
                        <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 border border-white/5 rounded-3xl bg-white/5 relative group/edu">
                            {(["degree", "institution", "year"] as const).map(f => (
                                <div key={f}>
                                    <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest block mb-2 px-1">{f}</label>
                                    <input className="w-full px-5 py-3 rounded-2xl border border-white/5 bg-white/5 focus:border-indigo-400 outline-none text-sm text-white font-bold"
                                        value={edu[f] || ""}
                                        onChange={e => {
                                            const eds = [...(data.education || [])]
                                            eds[i] = { ...eds[i], [f]: e.target.value }
                                            set("education")(eds)
                                        }} />
                                </div>
                            ))}
                            <button onClick={() => set("education")((data.education || []).filter((_, j) => j !== i))}
                                className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-lg text-white/10 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover/edu:opacity-100">×</button>
                        </div>
                    ))}
                    <button onClick={() => set("education")([...(data.education || []), { degree: "", institution: "", year: "" }])}
                        className="text-xs font-black text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest">+ Add Educational Node</button>
                </div>
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────
// MAIN TAILOR PAGE
// ─────────────────────────────────────────────
export default function TailorPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white">Loading...</div>}>
            <TailorContent />
        </Suspense>
    )
}

function TailorContent() {
    const searchParams = useSearchParams()
    const [file, setFile] = useState<File | null>(null)
    const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null)
    const [jdText, setJdText] = useState("")
    const [loading, setLoading] = useState(false)
    const [tailoredData, setTailoredData] = useState<ResumeData | null>(null)
    const [selectedTemplate, setSelectedTemplate] = useState("classic")
    const [activeView, setActiveView] = useState<"template" | "edit">("template")
    const [pdfLoading, setPdfLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    useEffect(() => {
        const id = searchParams.get("id")
        if (id) setSelectedResumeId(id)
    }, [searchParams])

    const handleTailor = async () => {
        if ((!file && !selectedResumeId) || !jdText) return
        setLoading(true)
        setTailoredData(null)

        try {
            let resumeId = selectedResumeId
            if (!resumeId && file) {
                const formData = new FormData()
                formData.append("file", file)
                const uploadRes = await api.upload("/ai/parse-resume-pdf", formData)
                const info = await uploadRes.json()
                resumeId = info.id
                setSelectedResumeId(resumeId)
            }
            if (!resumeId) throw new Error("No resume ID")
            const res = await api.post("/ai/tailor-resume", { resume_id: resumeId, job_description: jdText })
            if (res.ok) {
                setTailoredData(await res.json())
                setActiveView("template")
            } else {
                alert("Failed to tailor resume.")
            }
        } catch (err) {
            console.error(err)
            alert("Something went wrong.")
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        if (!tailoredData) return
        setSaving(true)
        try {
            const res = await api.post("/ai/tailored-resumes", {
                resume_data: tailoredData,
                original_resume_id: selectedResumeId
            })
            if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2500) }
            else alert("Failed to save.")
        } catch (err) { alert("Error saving.") }
        finally { setSaving(false) }
    }

    const handleDownloadPDF = async () => {
        if (!tailoredData) return
        setPdfLoading(true)
        try {
            const blob = await api.blob("/ai/generate-pdf", {
                resume_data: { ...tailoredData, template: selectedTemplate }
            })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `Tailored_Resume_${tailoredData.name || "User"}.pdf`
            document.body.appendChild(a); a.click(); a.remove()
        } catch (err) {
            alert("PDF generation failed.")
        } finally {
            setPdfLoading(false)
        }
    }

    return (
        <ProtectedLayout>
            <div className="max-w-5xl mx-auto space-y-10">

                {/* Header */}
                <header className="text-center">
                    <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">AI Optimization</span>
                    <h1 className="text-4xl sm:text-5xl font-black text-white mt-4 mb-3">AI Resume Tailor</h1>
                    <p className="text-white/45 text-lg font-medium max-w-xl mx-auto leading-relaxed">
                        Upload your profile, paste the job requirements, and let our AI create the perfect match.
                    </p>
                </header>

                {!tailoredData ? (
                    /* ── STEP 1 & 2: Input ── */
                    <div className="space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Resume */}
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                                    <span className="w-9 h-9 bg-white/5 border border-white/10 text-indigo-400 rounded-xl flex items-center justify-center text-sm font-black">1</span>
                                    {selectedResumeId ? "Resume Selected" : "Your Resume"}
                                </h2>
                                {selectedResumeId ? (
                                    <div className="bg-indigo-500/5 backdrop-blur-md border border-indigo-500/20 rounded-[2.5rem] p-8 flex items-center justify-between shadow-2xl">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-indigo-400 border border-white/5 shadow-inner">
                                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="font-black text-white text-base">Stored Identity</p>
                                                <p className="text-xs text-indigo-300/50 font-black uppercase tracking-widest">Active Resume Selected</p>
                                            </div>
                                        </div>
                                        <button onClick={() => setSelectedResumeId(null)}
                                            className="text-[10px] font-black text-red-400 hover:text-red-300 uppercase tracking-widest py-2 px-4 bg-red-400/10 rounded-xl border border-red-400/20 transition-all">Reset</button>
                                    </div>
                                ) : (
                                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-[2.5rem] p-1 overflow-hidden shadow-2xl">
                                        <ResumeUpload onFileSelect={setFile} />
                                    </div>
                                )}
                            </div>

                            {/* JD */}
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                                    <span className="w-9 h-9 bg-white/5 border border-white/10 text-indigo-400 rounded-xl flex items-center justify-center text-sm font-black">2</span>
                                    Job Requirements
                                </h2>
                                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-[2.5rem] p-6 shadow-2xl">
                                    <textarea
                                        className="w-full h-[220px] px-6 py-5 rounded-2xl border border-white/10 bg-white/5 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-none text-sm leading-relaxed text-white font-medium placeholder:text-white/20"
                                        placeholder="Paste the target job description here..."
                                        value={jdText} onChange={e => setJdText(e.target.value)} />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center pt-4">
                            <button onClick={handleTailor}
                                disabled={loading || (!file && !selectedResumeId) || !jdText}
                                className="px-14 py-5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-lg font-bold rounded-[2rem] hover:from-indigo-700 hover:to-violet-700 transition-all shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-1 disabled:opacity-30 disabled:cursor-not-allowed group relative overflow-hidden">
                                <span className="relative z-10 flex items-center gap-3">
                                    {loading ? (
                                        "Synchronizing..."
                                    ) : (
                                        <>
                                            Tailor Resume Now
                                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </>
                                    )}
                                </span>
                            </button>
                        </div>
                    </div>
                ) : (
                    /* ── RESULT: Template + Editor ── */
                    <div className="space-y-8 animate-fade-in">

                        {/* Top Action Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-4 bg-white rounded-[2rem] border border-gray-100 shadow-sm px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-green-100 text-green-600 rounded-xl flex items-center justify-center text-lg">✓</div>
                                <div>
                                    <p className="font-black text-gray-900 text-sm">Resume tailored successfully</p>
                                    <p className="text-xs text-gray-400 font-medium">Select template · Edit · Export</p>
                                </div>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                <button onClick={() => setTailoredData(null)}
                                    className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 rounded-xl hover:bg-gray-50 transition-all">
                                    ← New JD
                                </button>
                                <button onClick={handleSave} disabled={saving}
                                    className={`px-4 py-2 text-sm font-bold rounded-xl border-2 transition-all
                                        ${saved ? "border-green-400 text-green-600 bg-green-50" : "border-indigo-600 text-indigo-600 hover:bg-indigo-50"}`}>
                                    {saving ? "Saving..." : saved ? "✓ Saved!" : "Save for Later"}
                                </button>
                                <button onClick={handleDownloadPDF} disabled={pdfLoading}
                                    className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 disabled:opacity-50 flex items-center gap-2">
                                    {pdfLoading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating...</> : "⬇ Export PDF"}
                                </button>
                            </div>
                        </div>

                        {/* View Toggle */}
                        <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 w-fit">
                            {(["template", "edit"] as const).map(view => (
                                <button key={view} onClick={() => setActiveView(view)}
                                    className={`px-5 py-2 rounded-xl text-sm font-bold capitalize transition-all
                                        ${activeView === view ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                                    {view === "template" ? "🎨 Choose Template" : "✏️ Edit Content"}
                                </button>
                            ))}
                        </div>

                        {/* ── TEMPLATE PICKER ── */}
                        {activeView === "template" && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                    {TEMPLATES.map(tmpl => (
                                        <button key={tmpl.id} onClick={() => setSelectedTemplate(tmpl.id)}
                                            className={`group relative rounded-[2rem] border-2 overflow-hidden transition-all text-left
                                                ${selectedTemplate === tmpl.id
                                                    ? "border-indigo-600 shadow-xl shadow-indigo-100 scale-[1.02]"
                                                    : "border-gray-200 hover:border-indigo-300 hover:shadow-lg"}`}>

                                            {/* Template preview */}
                                            <div className="h-52 bg-gray-50 overflow-hidden">
                                                {tmpl.preview}
                                            </div>

                                            {/* Selected badge */}
                                            {selectedTemplate === tmpl.id && (
                                                <div className="absolute top-3 right-3 w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-black shadow-lg">
                                                    ✓
                                                </div>
                                            )}

                                            <div className="p-4 border-t border-gray-100 bg-white">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`w-3 h-3 rounded-full ${tmpl.accent}`} />
                                                    <span className="font-black text-gray-900 text-sm">{tmpl.name}</span>
                                                </div>
                                                <p className="text-xs text-gray-500 font-medium">{tmpl.description}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                {/* Preview pane for selected template */}
                                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="font-black text-gray-900">
                                            Preview — {TEMPLATES.find(t => t.id === selectedTemplate)?.name}
                                        </h3>
                                        <span className="text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
                                            Switch to Edit tab to modify content
                                        </span>
                                    </div>
                                    <ResumePreview data={tailoredData} template={selectedTemplate} />
                                </div>
                            </div>
                        )}

                        {/* ── EDITOR ── */}
                        {activeView === "edit" && (
                            <div className="space-y-4">
                                <div className="bg-amber-50 border border-amber-100 rounded-2xl px-5 py-3 flex items-center gap-3 text-sm text-amber-800 font-medium">
                                    <span className="text-base">✏️</span>
                                    Edit any field below. Changes update the preview and PDF export automatically.
                                </div>
                                <ResumeEditor data={tailoredData} onChange={setTailoredData} />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </ProtectedLayout>
    )
}

// ─────────────────────────────────────────────
// RESUME PREVIEW — renders 3 templates
// ─────────────────────────────────────────────
function ResumePreview({ data, template }: { data: ResumeData; template: string }) {
    if (template === "classic") return <ClassicPreview data={data} />
    if (template === "modern") return <ModernPreview data={data} />
    return <MinimalPreview data={data} />
}

function ClassicPreview({ data }: { data: ResumeData }) {
    return (
        <div className="font-mono text-xs leading-relaxed max-w-2xl mx-auto border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gray-900 text-white px-8 py-5 text-center">
                <h2 className="text-xl font-black tracking-widest uppercase">{data.name || "Full Name"}</h2>
                <p className="text-gray-300 text-xs mt-1">{data.email} · {data.phone}</p>
            </div>
            <div className="p-6 space-y-4 bg-white">
                {data.summary && <div><div className="font-black text-gray-500 uppercase tracking-widest text-[10px] mb-1 pb-0.5 border-b border-gray-200">Summary</div><p className="text-gray-700 text-xs leading-relaxed">{data.summary}</p></div>}
                {data.skills?.length ? <div><div className="font-black text-gray-500 uppercase tracking-widest text-[10px] mb-1 pb-0.5 border-b border-gray-200">Skills</div><p className="text-gray-700 text-xs">{data.skills.join(" · ")}</p></div> : null}
                {data.experience?.length ? <div><div className="font-black text-gray-500 uppercase tracking-widest text-[10px] mb-2 pb-0.5 border-b border-gray-200">Experience</div>{data.experience.map((e, i) => <div key={i} className="mb-2"><div className="flex justify-between font-black text-gray-900"><span>{e.company}</span><span className="text-gray-400">{e.duration}</span></div><div className="text-gray-600 italic">{e.role}</div>{e.bullets?.map((b, j) => <div key={j} className="text-gray-600 ml-2">• {b}</div>)}</div>)}</div> : null}
                {data.education?.length ? <div><div className="font-black text-gray-500 uppercase tracking-widest text-[10px] mb-2 pb-0.5 border-b border-gray-200">Education</div>{data.education.map((e, i) => <div key={i} className="flex justify-between"><span className="font-black text-gray-900">{e.institution}</span><span className="text-gray-500">{e.degree} · {e.year}</span></div>)}</div> : null}
            </div>
        </div>
    )
}

function ModernPreview({ data }: { data: ResumeData }) {
    return (
        <div className="text-xs max-w-2xl mx-auto flex rounded-xl overflow-hidden border border-gray-200">
            <div className="w-1/3 bg-indigo-700 text-white p-5 space-y-4">
                <div className="w-14 h-14 rounded-full bg-indigo-500 flex items-center justify-center text-2xl font-black mx-auto">
                    {(data.name || "?")[0]}
                </div>
                <div className="text-center font-black text-sm">{data.name}</div>
                {data.email && <div className="text-indigo-200 text-[10px] break-all">{data.email}</div>}
                {data.phone && <div className="text-indigo-200 text-[10px]">{data.phone}</div>}
                {data.skills?.length ? <div><div className="font-black uppercase tracking-widest text-[9px] text-indigo-300 mb-1">Skills</div>{data.skills.map((s, i) => <div key={i} className="text-indigo-100 text-[10px] mb-0.5">• {s}</div>)}</div> : null}
                {data.education?.length ? <div><div className="font-black uppercase tracking-widest text-[9px] text-indigo-300 mb-1">Education</div>{data.education.map((e, i) => <div key={i} className="mb-1 text-[10px]"><div className="font-black text-white">{e.degree}</div><div className="text-indigo-200">{e.institution} · {e.year}</div></div>)}</div> : null}
            </div>
            <div className="flex-1 bg-white p-5 space-y-4">
                {data.summary && <div><div className="font-black text-indigo-700 text-[10px] uppercase tracking-widest mb-1">Profile</div><p className="text-gray-700 leading-relaxed text-[10px]">{data.summary}</p></div>}
                {data.experience?.length ? <div><div className="font-black text-indigo-700 text-[10px] uppercase tracking-widest mb-2">Experience</div>{data.experience.map((e, i) => <div key={i} className="mb-2"><div className="flex justify-between font-black text-gray-900 text-[11px]"><span>{e.company}</span><span className="text-gray-400 text-[10px]">{e.duration}</span></div><div className="text-indigo-600 italic text-[10px]">{e.role}</div>{e.bullets?.map((b, j) => <div key={j} className="text-gray-600 text-[10px] ml-2">• {b}</div>)}</div>)}</div> : null}
                {data.projects?.length ? <div><div className="font-black text-indigo-700 text-[10px] uppercase tracking-widest mb-2">Projects</div>{data.projects.map((p, i) => <div key={i} className="mb-1"><div className="font-black text-gray-900 text-[11px]">{p.title}</div><div className="text-gray-600 text-[10px]">{p.description}</div></div>)}</div> : null}
            </div>
        </div>
    )
}

function MinimalPreview({ data }: { data: ResumeData }) {
    return (
        <div className="text-xs max-w-2xl mx-auto bg-white border border-gray-100 rounded-xl overflow-hidden p-8 space-y-5">
            <div className="text-center pb-4 border-b-2 border-amber-400">
                <h2 className="text-2xl font-black tracking-[0.15em] uppercase text-gray-900">{data.name}</h2>
                <p className="text-gray-400 text-[10px] tracking-widest mt-1">{data.email} · {data.phone}</p>
            </div>
            {data.summary && <p className="text-gray-600 text-center italic leading-relaxed text-[11px]">"{data.summary}"</p>}
            {data.skills?.length ? <div><div className="text-[10px] font-black uppercase tracking-widest text-amber-700 border-b border-gray-100 pb-1 mb-2">Technical Skills</div><p className="text-gray-600 text-[10px] leading-loose">{data.skills.join("  ·  ")}</p></div> : null}
            {data.experience?.length ? <div><div className="text-[10px] font-black uppercase tracking-widest text-amber-700 border-b border-gray-100 pb-1 mb-2">Experience</div>{data.experience.map((e, i) => <div key={i} className="mb-3"><div className="flex justify-between items-baseline"><span className="font-black text-gray-900 text-[11px]">{e.role}</span><span className="text-gray-400 text-[9px]">{e.duration}</span></div><div className="text-amber-700 italic text-[10px] mb-1">{e.company}</div>{e.bullets?.map((b, j) => <div key={j} className="text-gray-600 ml-3 text-[10px]">• {b}</div>)}</div>)}</div> : null}
            {data.education?.length ? <div><div className="text-[10px] font-black uppercase tracking-widest text-amber-700 border-b border-gray-100 pb-1 mb-2">Education</div>{data.education.map((e, i) => <div key={i} className="flex justify-between"><span className="font-black text-gray-900 text-[11px]">{e.degree} — {e.institution}</span><span className="text-gray-400 text-[9px]">{e.year}</span></div>)}</div> : null}
        </div>
    )
}