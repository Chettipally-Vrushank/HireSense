"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import PillNav from "@/components/PillNav"

export default function SignupPage() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const resp = await api.post("/auth/signup", { email, password })
            if (!resp.ok) {
                const errData = await resp.json()
                throw new Error(errData.detail || "Registration failed")
            }
            setSuccess(true)
            setTimeout(() => router.push("/login"), 2000)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const navItems = [
        { label: "Analyze", href: "/analyze" },
        { label: "Tailor Resume", href: "/tailor" },
        { label: "My Resumes", href: "/resumes" },
        { label: "Tailored", href: "/tailored" },
        { label: "My Portfolio", href: "/portfolio" },
    ]

    const logoEl = (
        <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-indigo-700 font-black text-sm leading-none">H</span>
            </div>
            <span className="text-white font-black text-[15px] tracking-tight">Hire<span className="text-indigo-300">Sense</span></span>
        </div>
    )

    return (
        <div className="min-h-screen bg-[#0e0b1a] text-white flex flex-col overflow-x-hidden">
            <PillNav
                logoElement={logoEl}
                items={navItems}
                baseColor="#1a1530"
                pillColor="#5227FF"
                pillTextColor="#ffffff"
                hoveredPillTextColor="#ffffff"
                theme="dark"
            />
            <div className="flex-1 flex items-center justify-center p-6 relative">
                {/* Background Blobs */}
                <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />

                <div className="max-w-md w-full bg-white/5 backdrop-blur-xl rounded-[3rem] shadow-2xl border border-white/10 p-10 sm:p-14 relative z-10">
                    <div className="text-center mb-12">
                        <div className="inline-block px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs font-black text-emerald-400 uppercase tracking-widest mb-4">
                            New Account
                        </div>
                        <h2 className="text-4xl font-black text-white mb-2 tracking-tight">Create Account</h2>
                        <p className="text-white/40 text-sm font-medium">Join the next generation of job seekers</p>
                    </div>

                    {success ? (
                        <div className="text-center py-12">
                            <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-3xl flex items-center justify-center mx-auto mb-6 text-3xl shadow-inner border border-emerald-500/30">
                                ✓
                            </div>
                            <h3 className="text-2xl font-black text-white mb-2">Registration Successful!</h3>
                            <p className="text-white/40 text-sm">Synchronizing your credentials...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSignup} className="space-y-8">
                            <div>
                                <label className="block text-[11px] font-black text-white/30 uppercase tracking-[0.2em] mb-3 px-1">Email </label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="anisha@example.com"
                                    className="w-full px-6 py-4 rounded-2xl border border-white/5 bg-white/5 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-white font-bold placeholder:text-white/10"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-black text-white/30 uppercase tracking-[0.2em] mb-3 px-1">Password</label>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="At least 8 characters"
                                    className="w-full px-6 py-4 rounded-2xl border border-white/5 bg-white/5 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-white font-bold placeholder:text-white/10"
                                />
                            </div>

                            {error && <p className="text-xs font-black text-red-400 text-center uppercase tracking-wider bg-red-400/10 py-3 rounded-xl border border-red-400/20">{error}</p>}

                            <button
                                disabled={loading}
                                className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-xs"
                            >
                                {loading ? "Initializing..." : "Get Started Free"}
                            </button>

                            <p className="text-center text-[11px] font-bold text-white/30 uppercase tracking-widest">
                                Existing User?{" "}
                                <Link href="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                                    Login
                                </Link>
                            </p>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
