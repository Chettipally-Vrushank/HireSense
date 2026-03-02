"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { setToken } from "@/lib/auth"
import Navbar from "@/components/Navbar"

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null

    useEffect(() => {
        const token = searchParams?.get("token")
        if (token) { setToken(token); router.push("/dashboard") }
    }, [])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true); setError("")
        try {
            const resp = await api.post("/auth/login", { email, password })
            if (!resp.ok) { const err = await resp.json(); throw new Error(err.detail || "Login failed") }
            const data = await resp.json()
            setToken(data.access_token)
            router.push("/dashboard")
        } catch (err: any) { setError(err.message) }
        finally { setLoading(false) }
    }

    const inputStyle = {
        width: "100%", padding: "14px 20px", borderRadius: 16,
        background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
        color: "rgba(255,255,255,0.9)", fontSize: 14, outline: "none",
        fontFamily: "'DM Sans', sans-serif",
        transition: "border-color 0.2s, box-shadow 0.2s",
    }

    return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#080808", fontFamily: "'DM Sans', sans-serif" }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');`}</style>
            <div style={{ position: "fixed", inset: 0, background: "radial-gradient(ellipse 50% 40% at 50% 30%,rgba(99,102,241,0.08),transparent)", pointerEvents: "none" }} />
            <Navbar />

            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, position: "relative", zIndex: 1 }}>
                <div style={{ width: "100%", maxWidth: 440, animation: "fadeUp .6s ease both" }}>
                    <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
                    <div style={{ borderRadius: 28, padding: "40px 36px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(20px)" }}>

                        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)", color: "#a5b4fc", fontSize: 11, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", padding: "5px 14px", borderRadius: 999, marginBottom: 20 }}>Welcome back</div>

                        <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 28, fontWeight: 800, letterSpacing: "-.03em", color: "rgba(255,255,255,0.92)", marginBottom: 6 }}>Sign in to HireSense</h1>
                        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginBottom: 28 }}>Continue your career optimization journey</p>

                        {/* Google */}
                        <button onClick={() => { window.location.href = "http://localhost:8000/auth/google/login" }}
                            style={{ width: "100%", padding: "13px 20px", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontSize: 14, fontWeight: 500, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.75)", cursor: "pointer", marginBottom: 24, fontFamily: "'DM Sans',sans-serif" }}>
                            <svg width="18" height="18" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.58z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Continue with Google
                        </button>

                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
                            <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em", color: "rgba(255,255,255,0.2)" }}>or</span>
                            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
                        </div>

                        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                            <div>
                                <label style={{ display: "block", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em", color: "rgba(255,255,255,0.35)", marginBottom: 8 }}>Email</label>
                                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={inputStyle}
                                    onFocus={e => { e.target.style.borderColor = "rgba(99,102,241,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)" }}
                                    onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none" }} />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em", color: "rgba(255,255,255,0.35)", marginBottom: 8 }}>Password</label>
                                <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={inputStyle}
                                    onFocus={e => { e.target.style.borderColor = "rgba(99,102,241,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)" }}
                                    onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none" }} />
                            </div>

                            {error && (
                                <div style={{ padding: "12px 16px", borderRadius: 14, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#fca5a5", fontSize: 13 }}>{error}</div>
                            )}

                            <button type="submit" disabled={loading} style={{ padding: "14px 20px", borderRadius: 16, fontWeight: 600, fontSize: 14, color: "#fff", background: loading ? "rgba(99,102,241,0.4)" : "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: loading ? "none" : "0 0 30px rgba(99,102,241,0.25)", border: "none", cursor: loading ? "not-allowed" : "pointer", fontFamily: "'DM Sans',sans-serif", marginTop: 4 }}>
                                {loading ? "Signing in…" : "Sign In"}
                            </button>
                        </form>

                        <p style={{ marginTop: 24, textAlign: "center", fontSize: 13, color: "rgba(255,255,255,0.3)" }}>
                            No account?{" "}
                            <Link href="/signup" style={{ color: "#a5b4fc", fontWeight: 600, textDecoration: "none" }}>Create one free →</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}