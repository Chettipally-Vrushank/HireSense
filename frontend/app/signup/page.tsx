"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import Navbar from "@/components/Navbar"

export default function SignupPage() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true); setError("")
        try {
            const resp = await api.post("/auth/signup", { email, password })
            if (!resp.ok) { const err = await resp.json(); throw new Error(err.detail || "Registration failed") }
            setSuccess(true)
            setTimeout(() => router.push("/login"), 2000)
        } catch (err: any) { setError(err.message) }
        finally { setLoading(false) }
    }

    const inputStyle = {
        width: "100%", padding: "14px 20px", borderRadius: 16,
        background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
        color: "rgba(255,255,255,0.9)", fontSize: 14, outline: "none",
        fontFamily: "'DM Sans', sans-serif", transition: "border-color 0.2s, box-shadow 0.2s",
    }

    return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#080808", fontFamily: "'DM Sans', sans-serif" }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap'); @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
            <div style={{ position: "fixed", inset: 0, background: "radial-gradient(ellipse 50% 40% at 50% 30%,rgba(99,102,241,0.08),transparent)", pointerEvents: "none" }} />
            <Navbar />

            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, position: "relative", zIndex: 1 }}>
                <div style={{ width: "100%", maxWidth: 440, animation: "fadeUp .6s ease both" }}>
                    <div style={{ borderRadius: 28, padding: "40px 36px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(20px)" }}>

                        {success ? (
                            <div style={{ textAlign: "center", padding: "20px 0" }}>
                                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.25)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 28 }}>✓</div>
                                <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 24, fontWeight: 800, marginBottom: 8 }}>You're in!</h2>
                                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>Redirecting you to login…</p>
                            </div>
                        ) : (
                            <>
                                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)", color: "#a5b4fc", fontSize: 11, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", padding: "5px 14px", borderRadius: 999, marginBottom: 20 }}>Join free</div>
                                <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 28, fontWeight: 800, letterSpacing: "-.03em", color: "rgba(255,255,255,0.92)", marginBottom: 6 }}>Create your account</h1>
                                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginBottom: 28 }}>Start optimizing your resume with AI today</p>

                                <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                    <div>
                                        <label style={{ display: "block", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em", color: "rgba(255,255,255,0.35)", marginBottom: 8 }}>Email</label>
                                        <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={inputStyle}
                                            onFocus={e => { e.target.style.borderColor = "rgba(99,102,241,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)" }}
                                            onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none" }} />
                                    </div>
                                    <div>
                                        <label style={{ display: "block", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em", color: "rgba(255,255,255,0.35)", marginBottom: 8 }}>Password</label>
                                        <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" style={inputStyle}
                                            onFocus={e => { e.target.style.borderColor = "rgba(99,102,241,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)" }}
                                            onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none" }} />
                                    </div>

                                    {error && (
                                        <div style={{ padding: "12px 16px", borderRadius: 14, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#fca5a5", fontSize: 13 }}>{error}</div>
                                    )}

                                    <button type="submit" disabled={loading} style={{ padding: "14px 20px", borderRadius: 16, fontWeight: 600, fontSize: 14, color: "#fff", background: loading ? "rgba(99,102,241,0.4)" : "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: loading ? "none" : "0 0 30px rgba(99,102,241,0.25)", border: "none", cursor: loading ? "not-allowed" : "pointer", fontFamily: "'DM Sans',sans-serif", marginTop: 4 }}>
                                        {loading ? "Creating account…" : "Get Started Free"}
                                    </button>
                                </form>

                                <p style={{ marginTop: 24, textAlign: "center", fontSize: 13, color: "rgba(255,255,255,0.3)" }}>
                                    Already have an account?{" "}
                                    <Link href="/login" style={{ color: "#a5b4fc", fontWeight: 600, textDecoration: "none" }}>Sign in →</Link>
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}