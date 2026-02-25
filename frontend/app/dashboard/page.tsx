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
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-100">
            {label}
            <button onClick={onRemove} className="ml-0.5 text-indigo-400 hover:text-indigo-700 transition-colors">×</button>
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
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 outline-none text-sm text-gray-800 font-medium transition-all"
                    placeholder={placeholder}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); add() } }}
                />
                <button onClick={add} type="button"
                    className="px-3 py-2.5 bg-indigo-50 text-indigo-600 font-bold rounded-xl hover:bg-indigo-100 transition-all text-sm">
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
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-7 space-y-5">
            <div className="flex items-center gap-3 mb-1">
                <span className="text-xl">{icon}</span>
                <h2 className="text-lg font-black text-gray-900">{title}</h2>
            </div>
            {children}
        </div>
    )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</label>
            {children}
        </div>
    )
}

function Input({ value, onChange, placeholder, type = "text" }: {
    value: string; onChange: (v: string) => void; placeholder?: string; type?: string
}) {
    return (
        <input type={type}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 outline-none text-sm text-gray-800 font-medium transition-all"
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
                <div className="relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 rounded-[2.5rem] p-8 text-white overflow-hidden shadow-2xl shadow-indigo-200">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl" />
                    <div className="absolute bottom-0 left-1/3 w-40 h-40 bg-violet-400/20 rounded-full translate-y-1/2 blur-2xl" />
                    <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
                        {/* Avatar */}
                        <div className="w-20 h-20 rounded-[1.5rem] bg-white/20 backdrop-blur flex items-center justify-center text-3xl font-black text-white border-2 border-white/30 flex-shrink-0">
                            {initials}
                        </div>
                        <div className="flex-1">
                            <p className="text-indigo-200 text-sm font-semibold mb-0.5">Welcome back</p>
                            <h1 className="text-3xl font-black tracking-tight">
                                {profile.full_name || user?.email?.split("@")[0] || "Hey there!"}
                            </h1>
                            {profile.current_role && (
                                <p className="text-indigo-200 font-medium mt-1">{profile.current_role}</p>
                            )}
                            {profile.location && (
                                <p className="text-indigo-300 text-sm mt-0.5 flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    </svg>
                                    {profile.location}
                                </p>
                            )}
                        </div>
                        {/* Stats */}
                        <div className="flex gap-4 flex-shrink-0">
                            <div className="text-center bg-white/10 backdrop-blur rounded-2xl px-5 py-3">
                                <p className="text-2xl font-black">{resumes.length}</p>
                                <p className="text-indigo-200 text-xs font-semibold uppercase tracking-wider">Resumes</p>
                            </div>
                            <div className="text-center bg-white/10 backdrop-blur rounded-2xl px-5 py-3">
                                <p className="text-2xl font-black">{completion}%</p>
                                <p className="text-indigo-200 text-xs font-semibold uppercase tracking-wider">Profile</p>
                            </div>
                        </div>
                    </div>

                    {/* Completion bar */}
                    <div className="relative mt-6">
                        <div className="flex justify-between text-xs text-indigo-200 font-semibold mb-2">
                            <span>Profile completion</span>
                            <span>{completion}%</span>
                        </div>
                        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                            <div className="h-full bg-white rounded-full transition-all duration-700"
                                style={{ width: `${completion}%` }} />
                        </div>
                        {completion < 100 && (
                            <p className="text-indigo-200 text-xs mt-2">
                                Complete your profile to get better AI-tailored resumes ✨
                            </p>
                        )}
                    </div>

                    {/* Quick links */}
                    <div className="relative flex gap-3 mt-6 flex-wrap">
                        <Link href="/analyze"
                            className="px-4 py-2 bg-white text-indigo-600 font-bold rounded-xl text-sm hover:bg-indigo-50 transition-all shadow-sm">
                            Run Analysis
                        </Link>
                        <Link href="/tailor"
                            className="px-4 py-2 bg-white/20 text-white font-bold rounded-xl text-sm hover:bg-white/30 transition-all backdrop-blur">
                            Tailor Resume
                        </Link>
                        <Link href="/resumes"
                            className="px-4 py-2 bg-white/20 text-white font-bold rounded-xl text-sm hover:bg-white/30 transition-all backdrop-blur">
                            My Resumes
                        </Link>
                    </div>
                </div>

                {/* Tab Bar */}
                <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 w-fit">
                    {(["profile", "career", "preferences"] as const).map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`px-5 py-2 rounded-xl text-sm font-bold capitalize transition-all
                                ${activeTab === tab
                                    ? "bg-white text-indigo-600 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"}`}>
                            {tab === "profile" ? "👤 Personal" : tab === "career" ? "💼 Career" : "🎯 Preferences"}
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
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:border-indigo-400 outline-none text-sm text-gray-800 font-medium"
                                    value={profile.years_experience || ""}
                                    onChange={e => set("years_experience")(e.target.value)}>
                                    <option value="">Select level</option>
                                    {EXPERIENCE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                                </select>
                            </Field>
                            <Field label="Notice Period">
                                <select
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:border-indigo-400 outline-none text-sm text-gray-800 font-medium"
                                    value={profile.notice_period || ""}
                                    onChange={e => set("notice_period")(e.target.value)}>
                                    <option value="">Select notice period</option>
                                    {NOTICE_PERIODS.map(n => <option key={n} value={n}>{n}</option>)}
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
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 outline-none text-sm text-gray-800 font-medium resize-none transition-all"
                                        rows={5}
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
                                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border
                                                ${(profile.employment_type || []).includes(type)
                                                    ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100"
                                                    : "bg-gray-50 text-gray-600 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50"}`}>
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
                        <div className="md:col-span-2 bg-gradient-to-br from-amber-50 to-orange-50 rounded-[2rem] border border-amber-100 p-7">
                            <h3 className="font-black text-amber-900 mb-4 flex items-center gap-2">
                                <span>💡</span> How your profile improves AI tailoring
                            </h3>
                            <ul className="space-y-2.5 text-sm text-amber-800 font-medium">
                                {[
                                    ["Career Summary", "Used directly in the tailored resume summary section", !!profile.career_summary],
                                    ["Target Roles", "Helps AI align resume tone and keywords to your goals", !!(profile.target_roles?.length)],
                                    ["Key Skills", "Ensures AI doesn't miss skills you consider important", !!(profile.key_skills?.length)],
                                    ["Employment Type", "AI can add relevant keywords (e.g. 'remote-first' mindset)", !!(profile.employment_type?.length)],
                                    ["Certifications", "AI surfaces certifications when relevant to the JD", !!(profile.certifications?.length)],
                                ].map(([field, tip, done]) => (
                                    <li key={field as string} className="flex items-start gap-2.5">
                                        <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-black mt-0.5
                                            ${done ? "bg-green-500 text-white" : "bg-amber-200 text-amber-600"}`}>
                                            {done ? "✓" : "○"}
                                        </span>
                                        <span><strong>{field as string}</strong> — {tip as string}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {/* Save Button */}
                <div className="flex justify-end pb-4">
                    <button onClick={handleSave} disabled={saving}
                        className={`flex items-center gap-2 px-8 py-3.5 font-bold rounded-2xl transition-all shadow-lg text-sm
                            ${saved
                                ? "bg-green-500 text-white shadow-green-200"
                                : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200 disabled:opacity-50"}`}>
                        {saving ? (
                            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                        ) : saved ? (
                            <><span>✓</span> Profile Saved!</>
                        ) : (
                            <><span>💾</span> Save Profile</>
                        )}
                    </button>
                </div>
            </div>
        </ProtectedLayout>
    )
}