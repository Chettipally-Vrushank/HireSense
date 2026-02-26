"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { api } from "@/lib/api"
import ProtectedLayout from "@/components/ProtectedLayout"

const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Remote", "Internship"]
const NOTICE_PERIODS = ["Immediately", "1 week", "2 weeks", "1 month", "2 months", "3 months"]
const EXPERIENCE_LEVELS = ["0–1 years", "1–2 years", "2–4 years", "4–7 years", "7–10 years", "10+ years"]

type Profile = {
    full_name?: string
    phone?: string
    location?: string
    linkedin?: string
    github?: string
    portfolio?: string
    current_role?: string
    years_experience?: string
    target_roles?: string[]
    target_industries?: string[]
    preferred_locations?: string[]
    employment_type?: string[]
    career_summary?: string
    key_skills?: string[]
    certifications?: string[]
    languages?: string[]
    salary_expectation?: string
    notice_period?: string
}

function Tag({ label, onRemove }: { label: string; onRemove: () => void }) {
    return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 text-indigo-300 text-[11px] font-black uppercase tracking-wider rounded-lg border border-indigo-500/20">
            {label}
            <button onClick={onRemove} className="ml-1 text-indigo-500 hover:text-white transition-colors">×</button>
        </span>
    )
}

function TagInput({ value = [], onChange, placeholder }: {
    value: string[]; onChange: (v: string[]) => void; placeholder: string
}) {
    const [input, setInput] = useState("")
    const add = () => {
        const v = input.trim()
        if (v && !value.includes(v)) onChange([...value, v])
        setInput("")
    }
    return (
        <div className="space-y-2">
            <div className="flex gap-2">
                <input
                    className="flex-1 px-5 py-3 rounded-2xl border border-white/5 bg-white/5 focus:border-indigo-500/50 outline-none text-sm text-white font-medium transition-all"
                    placeholder={placeholder}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); add() } }}
                />
                <button onClick={add} type="button"
                    className="px-6 py-2 bg-white/5 text-white font-black rounded-2xl hover:bg-white/10 border border-white/5 transition-all text-sm">
                    + Add
                </button>
            </div>
            {value.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {value.map((v, i) => <Tag key={i} label={v} onRemove={() => onChange(value.filter((_, j) => j !== i))} />)}
                </div>
            )}
        </div>
    )
}

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
    return (
        <div className="bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10 shadow-2xl p-8 space-y-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />
            <div className="flex items-center gap-4 relative z-10">
                <span className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center shadow-inner">{icon}</span>
                <h2 className="text-xl font-black text-white uppercase tracking-tight">{title}</h2>
            </div>
            <div className="relative z-10">
                {children}
            </div>
        </div>
    )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-2.5">
            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] px-2">{label}</label>
            {children}
        </div>
    )
}

function Input({ value, onChange, placeholder, type = "text" }: {
    value: string; onChange: (v: string) => void; placeholder?: string; type?: string
}) {
    return (
        <input type={type}
            className="w-full px-6 py-4 rounded-2xl border border-white/5 bg-white/5 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none text-sm text-white font-bold transition-all placeholder:text-white/10"
            placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} />
    )
}

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null)
    const [resumes, setResumes] = useState<any[]>([])
    const [profile, setProfile] = useState<Profile>({})
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [activeTab, setActiveTab] = useState<"profile" | "career" | "preferences">("profile")

    const completionScore = () => {
        const fields = [
            profile.full_name, profile.phone, profile.location,
            profile.current_role, profile.years_experience, profile.career_summary,
            profile.target_roles?.length, profile.key_skills?.length,
            profile.employment_type?.length, profile.notice_period
        ]
        const filled = fields.filter(Boolean).length
        return Math.round((filled / fields.length) * 100)
    }

    useEffect(() => {
        async function fetchAll() {
            try {
                const [userRes, resumesRes, profileRes] = await Promise.all([
                    api.get("/auth/me"),
                    api.get("/ai/resumes"),
                    api.get("/ai/profile")
                ])
                if (userRes.ok) setUser(await userRes.json())
                if (resumesRes.ok) setResumes(await resumesRes.json())
                if (profileRes.ok) {
                    const p = await profileRes.json()
                    setProfile(p || {})
                }
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchAll()
    }, [])

    const handleSave = async () => {
        setSaving(true)
        try {
            const res = await api.put("/ai/profile", profile)
            if (res.ok) {
                setSaved(true)
                setTimeout(() => setSaved(false), 2500)
            }
        } catch (err) {
            console.error("Save failed:", err)
        } finally {
            setSaving(false)
        }
    }

    const set = (key: keyof Profile) => (val: any) => setProfile(p => ({ ...p, [key]: val }))
    const completion = completionScore()
    const initials = (profile.full_name || user?.email || "U").slice(0, 2).toUpperCase()

    const toggleEmploymentType = (type: string) => {
        const current = profile.employment_type || []
        set("employment_type")(
            current.includes(type) ? current.filter(t => t !== type) : [...current, type]
        )
    }

    return (
        <ProtectedLayout>
            <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">

                {/* Hero Header */}
                <div className="relative bg-gradient-to-br from-[#1a1530] to-[#0e0b1a] rounded-[3rem] p-10 text-white overflow-hidden shadow-2xl border border-white/5 group">
                    <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-indigo-600/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-[100px] border border-white/5" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-600/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-[80px]" />

                    <div className="relative flex flex-col lg:flex-row items-center gap-10">
                        {/* Avatar */}
                        <div className="w-28 h-28 rounded-3xl bg-white/5 backdrop-blur-xl flex items-center justify-center text-4xl font-black text-white border border-white/20 shadow-2xl relative group-hover:scale-105 transition-transform">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-violet-500 opacity-20 rounded-3xl" />
                            {initials}
                        </div>

                        <div className="flex-1 text-center lg:text-left">
                            <span className="text-xs font-black uppercase tracking-[0.3em] text-indigo-400 mb-2 block">Command Center</span>
                            <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-2">
                                {profile.full_name || user?.email?.split("@")[0] || "HireSense User"}
                            </h1>
                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                                {profile.current_role && (
                                    <span className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-sm font-bold text-white/60">{profile.current_role}</span>
                                )}
                                {profile.location && (
                                    <span className="flex items-center gap-2 text-white/40 text-sm font-medium">
                                        <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        </svg>
                                        {profile.location}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Stats Widgets */}
                        <div className="flex gap-4 w-full lg:w-auto">
                            <div className="flex-1 lg:w-36 aspect-square bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10 p-6 flex flex-col items-center justify-center hover:bg-white/10 transition-all border-b-4 border-b-indigo-500/50 shadow-lg shadow-indigo-500/10">
                                <span className="text-3xl font-black mb-1">{resumes.length}</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 text-center">Library</span>
                            </div>
                            <div className="flex-1 lg:w-36 aspect-square bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10 p-6 flex flex-col items-center justify-center hover:bg-white/10 transition-all border-b-4 border-b-emerald-500/50 shadow-lg shadow-emerald-500/10">
                                <span className="text-3xl font-black mb-1">{completion}%</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 text-center">Profile</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 relative">
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-3">
                            <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-1000" style={{ width: `${completion}%` }} />
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/30 px-1">
                            <span>System Reliability: High</span>
                            <span className="text-emerald-400">{completion}% Optimized</span>
                        </div>
                    </div>

                    {/* Quick Launch */}
                    <div className="relative flex flex-wrap gap-4 mt-10">
                        <Link href="/analyze" className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-black rounded-2xl text-sm hover:from-indigo-700 hover:to-violet-700 transition-all shadow-xl shadow-indigo-500/20 hover:-translate-y-0.5">AI Analysis</Link>
                        <Link href="/tailor" className="px-8 py-3 bg-white/5 text-white font-black rounded-2xl text-sm hover:bg-white/10 border border-white/10 transition-all hover:-translate-y-0.5">Tailor Resume</Link>
                        <Link href="/resumes" className="px-8 py-3 bg-white/5 text-white font-black rounded-2xl text-sm hover:bg-white/10 border border-white/10 transition-all hover:-translate-y-0.5">My Resumes</Link>
                        <Link href="/tailored" className="px-8 py-3 bg-white/5 text-white font-black rounded-2xl text-sm hover:bg-white/10 border border-white/10 transition-all hover:-translate-y-0.5">Tailored Resumes</Link>
                    </div>
                </div>

                {/* Tab Bar */}
                <div className="flex gap-1 bg-white/5 border border-white/10 rounded-2xl p-1.5 w-fit backdrop-blur-md">
                    {(["profile", "career", "preferences"] as const).map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`px-8 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all
                                ${activeTab === tab
                                    ? "bg-white text-indigo-900 shadow-xl scale-105"
                                    : "text-white/40 hover:text-white/70"}`}>
                            {tab}
                        </button>
                    ))}
                </div>

                {/* ─── TAB: PERSONAL INFO ─── */}
                {activeTab === "profile" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Section title="Personal Information" icon="👤">
                            <Field label="Full Name">
                                <Input value={profile.full_name || ""} onChange={set("full_name")} placeholder="Govindula Acharya Abhisht" />
                            </Field>
                            <Field label="Phone">
                                <Input value={profile.phone || ""} onChange={set("phone")} placeholder="+91 9490114718" />
                            </Field>
                            <Field label="Location">
                                <Input value={profile.location || ""} onChange={set("location")} placeholder="Hyderabad, Telangana" />
                            </Field>
                        </Section>

                        <Section title="Online Presence" icon="🔗">
                            <Field label="LinkedIn URL">
                                <Input value={profile.linkedin || ""} onChange={set("linkedin")} placeholder="linkedin.com/in/yourname" />
                            </Field>
                            <Field label="GitHub URL">
                                <Input value={profile.github || ""} onChange={set("github")} placeholder="github.com/yourname" />
                            </Field>
                            <Field label="Portfolio / Website">
                                <Input value={profile.portfolio || ""} onChange={set("portfolio")} placeholder="yourportfolio.com" />
                            </Field>
                        </Section>

                        <div className="md:col-span-2">
                            <Section title="Languages" icon="🌐">
                                <TagInput value={profile.languages || []} onChange={set("languages")} placeholder="Add language (e.g. English, Hindi)..." />
                            </Section>
                        </div>
                    </div>
                )}

                {/* ─── TAB: CAREER ─── */}
                {activeTab === "career" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Section title="Current Status" icon="💼">
                            <Field label="Current Role / Title">
                                <Input value={profile.current_role || ""} onChange={set("current_role")} placeholder="e.g. Data Science Intern" />
                            </Field>
                            <Field label="Years of Experience">
                                <select
                                    className="w-full px-6 py-4 rounded-2xl border border-white/5 bg-white/5 focus:border-indigo-500 outline-none text-sm text-white font-bold"
                                    value={profile.years_experience || ""}
                                    onChange={e => set("years_experience")(e.target.value)}>
                                    <option value="" className="bg-[#0e0b1a]">Select level</option>
                                    {EXPERIENCE_LEVELS.map(l => <option key={l} value={l} className="bg-[#0e0b1a]">{l}</option>)}
                                </select>
                            </Field>
                            <Field label="Notice Period">
                                <select
                                    className="w-full px-6 py-4 rounded-2xl border border-white/5 bg-white/5 focus:border-indigo-500 outline-none text-sm text-white font-bold"
                                    value={profile.notice_period || ""}
                                    onChange={e => set("notice_period")(e.target.value)}>
                                    <option value="" className="bg-[#0e0b1a]">Select notice period</option>
                                    {NOTICE_PERIODS.map(n => <option key={n} value={n} className="bg-[#0e0b1a]">{n}</option>)}
                                </select>
                            </Field>
                            <Field label="Salary Expectation">
                                <Input value={profile.salary_expectation || ""} onChange={set("salary_expectation")} placeholder="e.g. ₹8–12 LPA or $80k–$100k" />
                            </Field>
                        </Section>

                        <Section title="Career Goals" icon="🎯">
                            <Field label="Target Roles">
                                <TagInput value={profile.target_roles || []} onChange={set("target_roles")} placeholder="Add role (e.g. ML Engineer)..." />
                            </Field>
                            <Field label="Target Industries">
                                <TagInput value={profile.target_industries || []} onChange={set("target_industries")} placeholder="Add industry (e.g. FinTech, EdTech)..." />
                            </Field>
                        </Section>

                        <div className="md:col-span-2">
                            <Section title="Professional Summary" icon="📝">
                                <Field label="Career Summary (used to enrich tailored resumes)">
                                    <textarea
                                        className="w-full px-8 py-6 rounded-[2.5rem] border border-white/5 bg-white/5 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none text-sm text-white/90 font-medium resize-none transition-all leading-relaxed"
                                        rows={6}
                                        placeholder="Write a 2–3 sentence professional summary that highlights your strengths, experience, and what you're looking for..."
                                        value={profile.career_summary || ""}
                                        onChange={e => set("career_summary")(e.target.value)}
                                    />
                                </Field>
                            </Section>
                        </div>

                        <div className="md:col-span-2">
                            <Section title="Skills & Certifications" icon="⚡">
                                <Field label="Key Skills (boosts AI tailoring accuracy)">
                                    <TagInput value={profile.key_skills || []} onChange={set("key_skills")} placeholder="Add skill (e.g. Python, SARIMA, Power BI)..." />
                                </Field>
                                <Field label="Certifications">
                                    <TagInput value={profile.certifications || []} onChange={set("certifications")} placeholder="Add certification (e.g. AWS Solutions Architect)..." />
                                </Field>
                            </Section>
                        </div>
                    </div>
                )}

                {/* ─── TAB: PREFERENCES ─── */}
                {activeTab === "preferences" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Section title="Work Preferences" icon="🏢">
                            <Field label="Employment Type">
                                <div className="flex flex-wrap gap-2">
                                    {EMPLOYMENT_TYPES.map(type => (
                                        <button key={type} onClick={() => toggleEmploymentType(type)} type="button"
                                            className={`px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border
                                                ${(profile.employment_type || []).includes(type)
                                                    ? "bg-indigo-600 text-white border-indigo-500 shadow-xl shadow-indigo-500/20 scale-105"
                                                    : "bg-white/5 text-white/40 border-white/5 hover:border-white/20 hover:text-white"}`}>
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </Field>
                        </Section>

                        <Section title="Location Preferences" icon="📍">
                            <Field label="Preferred Work Locations">
                                <TagInput value={profile.preferred_locations || []} onChange={set("preferred_locations")} placeholder="Add city (e.g. Bangalore, Remote)..." />
                            </Field>
                        </Section>

                        {/* Profile completeness tips */}
                        <div className="md:col-span-2 bg-gradient-to-br from-indigo-500/10 to-violet-500/10 rounded-[3rem] border border-white/10 p-10 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                            <h3 className="font-black text-white text-xl mb-6 flex items-center gap-3 relative z-10">
                                <span className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-xl shadow-inner">💡</span>
                                AI Optimization Insights
                            </h3>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                                {[
                                    ["Professional Summary", "Used as the core template for your AI-generated executive summary.", !!profile.career_summary],
                                    ["Target Role Definitions", "Aligns the semantic engine with specific industry terminology.", !!(profile.target_roles?.length)],
                                    ["Skill Mapping", "Forces the AI to prioritize these specific keywords in matches.", !!(profile.key_skills?.length)],
                                    ["Credential Verification", "Surfaces specific certifications that match JD requirements.", !!(profile.certifications?.length)],
                                ].map(([field, tip, done]) => (
                                    <li key={field as string} className="flex items-start gap-4 p-5 bg-black/20 rounded-[1.5rem] border border-white/5 hover:border-white/10 transition-all">
                                        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black mt-1
                                            ${done ? "bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]" : "bg-white/5 text-white/30 border border-white/10"}`}>
                                            {done ? "✓" : "○"}
                                        </div>
                                        <div>
                                            <p className="font-black text-white/80 text-sm mb-1 uppercase tracking-tight">{field as string}</p>
                                            <p className="text-xs text-white/40 leading-relaxed font-medium">{tip as string}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {/* Save Button */}
                <div className="flex justify-end pb-10">
                    <button onClick={handleSave} disabled={saving}
                        className={`flex items-center gap-3 px-12 py-4 font-black rounded-[1.5rem] transition-all shadow-2xl uppercase tracking-[0.2em] text-[11px]
                            ${saved
                                ? "bg-emerald-600 text-white shadow-emerald-500/20"
                                : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-500/20 hover:-translate-y-1 active:scale-95 disabled:opacity-50"}`}>
                        {saving ? (
                            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Synchronizing...</>
                        ) : saved ? (
                            <>✓ Vault Updated</>
                        ) : (
                            <>Save System Profile</>
                        )}
                    </button>
                </div>
            </div>
        </ProtectedLayout>
    )
}