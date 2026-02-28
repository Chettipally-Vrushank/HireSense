"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { setToken } from "@/lib/auth"
import PillNav from "@/components/PillNav"

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null

    useEffect(() => {
        const token = searchParams?.get("token")
        if (token) {
            setToken(token)
            router.push("/dashboard")
        }
    }, [searchParams, router])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const resp = await api.post("/auth/login", { email, password })
            if (!resp.ok) {
                const errData = await resp.json()
                throw new Error(errData.detail || "Login failed")
            }
            const data = await resp.json()
            setToken(data.access_token)
            router.push("/dashboard")
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleLogin = () => {
        // Redirect to Google Login
        // Note: The backend should return a redirect URL or handle standard OAuth flow
        // For now, redirecting to the standard backend endpoint
        // standard flow: open popup or redirect
        window.location.href = "http://localhost:8000/auth/google/login"
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
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />

                <div className="max-w-md w-full bg-white/5 backdrop-blur-xl rounded-[3rem] shadow-2xl border border-white/10 p-10 sm:p-14 relative z-10">
                    <div className="text-center mb-12">
                        <div className="inline-block px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs font-black text-indigo-400 uppercase tracking-widest mb-4">
                            Sign In
                        </div>
                        <h2 className="text-4xl font-black text-white mb-2 tracking-tight">Welcome Back</h2>
                        <p className="text-white/40 text-sm font-medium">Log in to your account</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-8">
                        <div>
                            <label className="block text-[11px] font-black text-white/30 uppercase tracking-[0.2em] mb-3 px-1">Email Address</label>
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
                                placeholder="••••••••"
                                className="w-full px-6 py-4 rounded-2xl border border-white/5 bg-white/5 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-white font-bold placeholder:text-white/10"
                            />
                        </div>

                        {error && <p className="text-xs font-black text-red-400 text-center uppercase tracking-wider bg-red-400/10 py-3 rounded-xl border border-red-400/20">{error}</p>}

                        <button
                            disabled={loading}
                            className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-xs"
                        >
                            {loading ? "Authenticating..." : "Sign In"}
                        </button>
                    </form>

                    <div className="my-10 flex items-center gap-4 text-white/10">
                        <div className="flex-1 h-px bg-white/10"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest">Or continue with</span>
                        <div className="flex-1 h-px bg-white/10"></div>
                    </div>

                    <button
                        onClick={handleGoogleLogin}
                        className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/10 transition-all font-black text-white/80 text-xs uppercase tracking-widest"
                    >
                        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        Continue with Google
                    </button>

                    <p className="mt-10 text-center text-[11px] font-bold text-white/30 uppercase tracking-widest">
                        Don't have an account?{" "}
                        <Link href="/signup" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                            Sign Up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
