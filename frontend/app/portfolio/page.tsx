"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import ProtectedLayout from "@/components/ProtectedLayout"

type Theme = "minimal" | "modern"
type ContentType = "profile" | "full"

interface PortfolioForm {
    username: string
    theme: Theme
    content_type: ContentType
    name: string
    email: string
    phone: string
    summary: string
    linkedin: string
    github: string
    website: string
    skills: string[]
    experience: { company: string; role: string; duration: string; bullets: string[] }[]
    projects: { title: string; description: string }[]
    education: { degree: string; institution: string; year: string }[]
}

const EMPTY_FORM: PortfolioForm = {
    username: "",
    theme: "modern",
    content_type: "full",
    name: "", email: "", phone: "", summary: "",
    linkedin: "", github: "", website: "",
    skills: [], experience: [], projects: [], education: []
}

export default function PortfolioBuilderPage() {
    const [step, setStep] = useState<"setup" | "content" | "publish">("setup")
    const [form, setForm] = useState<PortfolioForm>(EMPTY_FORM)
    const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken">("idle")
    const [saving, setSaving] = useState(false)
    const [published, setPublished] = useState<string | null>(null)
    const [profileLoaded, setProfileLoaded] = useState(false)
    const [skillInput, setSkillInput] = useState("")

    // Load profile data from dashboard on mount
    useEffect(() => {
        async function loadProfile() {
            try {
                const res = await api.get("/ai/profile")
                if (res.ok) {
                    const p = await res.json()
                    setForm(prev => ({
                        ...prev,
                        name: p.full_name || prev.name,
                        email: p.email || prev.email,
                        phone: p.phone || prev.phone,
                        summary: p.summary || prev.summary,
                        linkedin: p.linkedin || prev.linkedin,
                        github: p.github || prev.github,
                        website: p.website || prev.website,
                        skills: p.skills || prev.skills,
                        experience: p.experience || prev.experience,
                        education: p.education || prev.education,
                    }))
                    setProfileLoaded(true)
                }
            } catch { }
            // Also try to load existing portfolio
            try {
                const pRes = await api.get("/ai/portfolio/me")
                if (pRes.ok) {
                    const port = await pRes.json()
                    setForm(prev => ({ ...prev, ...port }))
                    setPublished(port.username)
                }
            } catch { }
        }
        loadProfile()
    }, [])

    // Username availability check (debounced)
    useEffect(() => {
        if (!form.username || form.username.length < 3) { setUsernameStatus("idle"); return }
        setUsernameStatus("checking")
        const t = setTimeout(async () => {
            try {
                const res = await api.get(`/ai/portfolio/check-username?username=${encodeURIComponent(form.username)}`)
                if (res.ok) {
                    const d = await res.json()
                    setUsernameStatus(d.available ? "available" : "taken")
                }
            } catch { setUsernameStatus("idle") }
        }, 500)
        return () => clearTimeout(t)
    }, [form.username])

    const update = (key: keyof PortfolioForm, val: any) => setForm(prev => ({ ...prev, [key]: val }))

    const addSkill = () => {
        const s = skillInput.trim()
        if (s && !form.skills.includes(s)) { update("skills", [...form.skills, s]) }
        setSkillInput("")
    }

    const addExperience = () => update("experience", [...form.experience, { company: "", role: "", duration: "", bullets: [""] }])
    const addProject = () => update("projects", [...form.projects, { title: "", description: "" }])
    const addEducation = () => update("education", [...form.education, { degree: "", institution: "", year: "" }])

    const handlePublish = async () => {
        if (usernameStatus === "taken" || !form.username) return
        setSaving(true)
        try {
            const res = await api.post("/ai/portfolio", form)
            if (res.ok) {
                const d = await res.json()
                setPublished(d.username)
                setStep("publish")
            } else {
                const err = await res.json()
                alert(err.detail || "Failed to publish portfolio")
            }
        } catch (e) {
            console.error(e)
            alert("Something went wrong")
        } finally {
            setSaving(false)
        }
    }

    // ─── STEP: SETUP ───────────────────────────────────────────────────────
    if (step === "setup") return (
        <ProtectedLayout>
            <div className="max-w-2xl mx-auto space-y-10">
                <header className="text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-widest mb-4">
                        New Feature
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 mb-3">Build Your Portfolio</h1>
                    <p className="text-gray-500 text-lg">Create a shareable professional portfolio page from your HireSense profile.</p>
                </header>

                {profileLoaded && (
                    <div className="flex items-center gap-3 px-5 py-3.5 bg-green-50 border border-green-100 rounded-2xl">
                        <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        <span className="text-sm font-medium text-green-700">Profile data loaded from your dashboard</span>
                    </div>
                )}

                {/* Username */}
                <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm space-y-4">
                    <h2 className="text-lg font-black text-gray-900">Your Portfolio URL</h2>
                    <div className="flex items-center gap-0 bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-50 transition-all">
                        <span className="px-4 py-3.5 text-sm text-gray-400 font-mono border-r border-gray-200 bg-gray-100 whitespace-nowrap">hiresense.ai/portfolio/</span>
                        <input
                            className="flex-1 px-4 py-3.5 bg-transparent outline-none text-sm font-mono text-gray-900"
                            placeholder="your-name"
                            value={form.username}
                            onChange={e => update("username", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                        />
                        <div className="px-4">
                            {usernameStatus === "checking" && <div className="w-4 h-4 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />}
                            {usernameStatus === "available" && <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>}
                            {usernameStatus === "taken" && <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>}
                        </div>
                    </div>
                    {usernameStatus === "taken" && <p className="text-xs text-red-500 font-medium">This username is already taken. Try another.</p>}
                    {usernameStatus === "available" && <p className="text-xs text-green-600 font-medium">✓ Available!</p>}
                </div>

                {/* Design */}
                <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm space-y-4">
                    <h2 className="text-lg font-black text-gray-900">Design Theme</h2>
                    <div className="grid grid-cols-2 gap-4">
                        {([
                            { id: "minimal", label: "Minimal Professional", desc: "Cream & ink, editorial typography", preview: "bg-[#faf7f2]", text: "text-[#1a1714]", border: "border-[#e8e2d9]" },
                            { id: "modern", label: "Modern Creative", desc: "Dark glass, vibrant gradients", preview: "bg-[#080b14]", text: "text-white", border: "border-indigo-500" }
                        ] as const).map(t => (
                            <button
                                key={t.id}
                                onClick={() => update("theme", t.id)}
                                className={`relative rounded-2xl border-2 overflow-hidden transition-all ${form.theme === t.id ? "border-indigo-600 shadow-lg shadow-indigo-100" : "border-gray-100 hover:border-gray-200"}`}
                            >
                                <div className={`${t.preview} h-24 flex items-center justify-center`}>
                                    <div className={`text-center ${t.text}`}>
                                        <div className="text-xs font-bold opacity-50 mb-1">Your Name</div>
                                        <div className="text-[10px] opacity-30">Skills · Experience · Projects</div>
                                    </div>
                                </div>
                                <div className="p-3 text-left">
                                    <div className="text-sm font-bold text-gray-900">{t.label}</div>
                                    <div className="text-xs text-gray-500 mt-0.5">{t.desc}</div>
                                </div>
                                {form.theme === t.id && (
                                    <div className="absolute top-2 right-2 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content type */}
                <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm space-y-4">
                    <h2 className="text-lg font-black text-gray-900">Content</h2>
                    <div className="grid grid-cols-2 gap-4">
                        {([
                            { id: "profile", label: "Profile Only", desc: "Name, skills, contacts, experience" },
                            { id: "full", label: "Profile + Résumé", desc: "Everything including projects & education" }
                        ] as const).map(c => (
                            <button
                                key={c.id}
                                onClick={() => update("content_type", c.id)}
                                className={`text-left p-5 rounded-2xl border-2 transition-all ${form.content_type === c.id ? "border-indigo-600 bg-indigo-50" : "border-gray-100 hover:border-gray-200"}`}
                            >
                                <div className="text-sm font-bold text-gray-900 mb-1">{c.label}</div>
                                <div className="text-xs text-gray-500">{c.desc}</div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={() => setStep("content")}
                        disabled={!form.username || usernameStatus === "taken" || usernameStatus === "checking"}
                        className="px-8 py-3.5 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                    >
                        Next: Edit Content
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                    </button>
                </div>
            </div>
        </ProtectedLayout>
    )

    // ─── STEP: CONTENT ─────────────────────────────────────────────────────
    if (step === "content") return (
        <ProtectedLayout>
            <div className="max-w-2xl mx-auto space-y-8">
                <div className="flex items-center gap-4">
                    <button onClick={() => setStep("setup")} className="text-indigo-600 font-bold hover:underline">← Back</button>
                    <h1 className="text-2xl font-black text-gray-900">Edit Content</h1>
                </div>

                {/* Personal info */}
                <Section title="Personal Info">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Full Name" value={form.name} onChange={v => update("name", v)} />
                        <Field label="Email" value={form.email} onChange={v => update("email", v)} />
                        <Field label="Phone" value={form.phone} onChange={v => update("phone", v)} />
                        <Field label="LinkedIn URL" value={form.linkedin} onChange={v => update("linkedin", v)} />
                        <Field label="GitHub URL" value={form.github} onChange={v => update("github", v)} />
                        <Field label="Website" value={form.website} onChange={v => update("website", v)} />
                    </div>
                    <div className="mt-4">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Professional Summary</label>
                        <textarea
                            className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:border-indigo-400 outline-none resize-none text-sm text-gray-900 font-medium"
                            rows={3}
                            value={form.summary}
                            onChange={e => update("summary", e.target.value)}
                            placeholder="A brief professional summary..."
                        />
                    </div>
                </Section>

                {/* Skills */}
                <Section title="Skills">
                    <div className="flex gap-2 mb-3">
                        <input
                            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50 focus:border-indigo-400 outline-none text-sm"
                            placeholder="Add a skill (press Enter)"
                            value={skillInput}
                            onChange={e => setSkillInput(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSkill() } }}
                        />
                        <button onClick={addSkill} className="px-4 py-2.5 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-700">Add</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {form.skills.map((s, i) => (
                            <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-sm font-medium rounded-xl">
                                {s}
                                <button onClick={() => update("skills", form.skills.filter((_, j) => j !== i))} className="text-gray-300 hover:text-red-500 transition-colors">×</button>
                            </span>
                        ))}
                    </div>
                </Section>

                {/* Experience */}
                <Section title="Experience">
                    {form.experience.map((exp, i) => (
                        <div key={i} className="p-5 bg-gray-50 rounded-2xl border border-gray-100 mb-3 space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <Field label="Role" value={exp.role} onChange={v => { const e = [...form.experience]; e[i] = { ...e[i], role: v }; update("experience", e) }} />
                                <Field label="Company" value={exp.company} onChange={v => { const e = [...form.experience]; e[i] = { ...e[i], company: v }; update("experience", e) }} />
                                <Field label="Duration" value={exp.duration} onChange={v => { const e = [...form.experience]; e[i] = { ...e[i], duration: v }; update("experience", e) }} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Bullet Points</label>
                                {exp.bullets.map((b, j) => (
                                    <input key={j} className="w-full px-3 py-2 mb-1.5 rounded-lg border border-gray-100 bg-white text-sm outline-none focus:border-indigo-400" value={b}
                                        onChange={e => { const ex = [...form.experience]; ex[i].bullets[j] = e.target.value; update("experience", ex) }} />
                                ))}
                                <button onClick={() => { const ex = [...form.experience]; ex[i].bullets.push(""); update("experience", ex) }} className="text-xs text-indigo-600 font-bold hover:underline">+ Add bullet</button>
                            </div>
                            <button onClick={() => update("experience", form.experience.filter((_, j) => j !== i))} className="text-xs text-red-400 font-bold hover:text-red-600">Remove</button>
                        </div>
                    ))}
                    <button onClick={addExperience} className="text-sm text-indigo-600 font-bold hover:underline">+ Add Experience</button>
                </Section>

                {form.content_type === "full" && (
                    <>
                        {/* Projects */}
                        <Section title="Projects">
                            {form.projects.map((p, i) => (
                                <div key={i} className="p-5 bg-gray-50 rounded-2xl border border-gray-100 mb-3 space-y-3">
                                    <Field label="Project Title" value={p.title} onChange={v => { const pr = [...form.projects]; pr[i] = { ...pr[i], title: v }; update("projects", pr) }} />
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Description</label>
                                        <textarea className="w-full px-3 py-2 rounded-lg border border-gray-100 bg-white text-sm outline-none focus:border-indigo-400 resize-none" rows={2}
                                            value={p.description} onChange={e => { const pr = [...form.projects]; pr[i] = { ...pr[i], description: e.target.value }; update("projects", pr) }} />
                                    </div>
                                    <button onClick={() => update("projects", form.projects.filter((_, j) => j !== i))} className="text-xs text-red-400 font-bold hover:text-red-600">Remove</button>
                                </div>
                            ))}
                            <button onClick={addProject} className="text-sm text-indigo-600 font-bold hover:underline">+ Add Project</button>
                        </Section>

                        {/* Education */}
                        <Section title="Education">
                            {form.education.map((edu, i) => (
                                <div key={i} className="p-5 bg-gray-50 rounded-2xl border border-gray-100 mb-3 space-y-3">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <Field label="Degree" value={edu.degree} onChange={v => { const ed = [...form.education]; ed[i] = { ...ed[i], degree: v }; update("education", ed) }} />
                                        <Field label="Institution" value={edu.institution} onChange={v => { const ed = [...form.education]; ed[i] = { ...ed[i], institution: v }; update("education", ed) }} />
                                        <Field label="Year" value={edu.year} onChange={v => { const ed = [...form.education]; ed[i] = { ...ed[i], year: v }; update("education", ed) }} />
                                    </div>
                                    <button onClick={() => update("education", form.education.filter((_, j) => j !== i))} className="text-xs text-red-400 font-bold hover:text-red-600">Remove</button>
                                </div>
                            ))}
                            <button onClick={addEducation} className="text-sm text-indigo-600 font-bold hover:underline">+ Add Education</button>
                        </Section>
                    </>
                )}

                <div className="flex justify-between items-center pt-2">
                    <button onClick={() => setStep("setup")} className="text-gray-500 font-bold hover:text-gray-700">← Back</button>
                    <button
                        onClick={handlePublish}
                        disabled={saving}
                        className="px-8 py-3.5 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 disabled:opacity-50 shadow-lg shadow-indigo-200 flex items-center gap-2 transition-all"
                    >
                        {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Publishing…</> : <>🚀 Publish Portfolio</>}
                    </button>
                </div>
            </div>
        </ProtectedLayout>
    )

    // ─── STEP: PUBLISHED ───────────────────────────────────────────────────
    return (
        <ProtectedLayout>
            <div className="max-w-xl mx-auto text-center space-y-8 py-16">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto text-3xl">🎉</div>
                <div>
                    <h1 className="text-3xl font-black text-gray-900 mb-2">Your Portfolio is Live!</h1>
                    <p className="text-gray-500">Share this link with recruiters, add it to your resume, or post it on LinkedIn.</p>
                </div>

                <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-left">
                        <svg className="w-5 h-5 text-indigo-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                        <span className="flex-1 text-sm font-mono text-gray-700 truncate">hiresense.ai/portfolio/{published}</span>
                        <button
                            onClick={() => navigator.clipboard.writeText(`hiresense.ai/portfolio/${published}`)}
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 whitespace-nowrap"
                        >Copy</button>
                    </div>
                    <div className="flex gap-3">
                        <a
                            href={`/portfolio/${published}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-3 bg-gray-900 text-white font-bold text-sm rounded-2xl hover:bg-black transition-all text-center"
                        >
                            Preview Portfolio ↗
                        </a>
                        <button
                            onClick={() => setStep("content")}
                            className="flex-1 py-3 border-2 border-gray-200 text-gray-700 font-bold text-sm rounded-2xl hover:border-gray-300 transition-all"
                        >
                            Edit Portfolio
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center text-sm">
                    {[
                        { label: "Add to LinkedIn", action: () => { }, icon: "💼" },
                        { label: "Download PDF", action: () => { }, icon: "📄" },
                        { label: "Share", action: () => navigator.share?.({ url: `https://hiresense.ai/portfolio/${published}`, title: `${form.name}'s Portfolio` }), icon: "🔗" }
                    ].map((a, i) => (
                        <button key={i} onClick={a.action} className="flex flex-col items-center gap-2 p-4 bg-white border border-gray-100 rounded-2xl hover:border-indigo-100 transition-all">
                            <span className="text-2xl">{a.icon}</span>
                            <span className="text-xs font-bold text-gray-600">{a.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </ProtectedLayout>
    )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="bg-white rounded-[2rem] border border-gray-100 p-7 shadow-sm space-y-4">
            <h2 className="text-lg font-black text-gray-900">{title}</h2>
            {children}
        </div>
    )
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
    return (
        <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</label>
            <input
                className="w-full px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 outline-none transition-all text-sm text-gray-900 font-medium"
                value={value}
                onChange={e => onChange(e.target.value)}
            />
        </div>
    )
}