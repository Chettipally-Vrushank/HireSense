"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { getToken, logout } from "@/lib/auth"
import PillNav from "./PillNav"
import Link from "next/link"
import { api } from "@/lib/api"

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
    const [userName, setUserName] = useState("")

    useEffect(() => {
        const token = getToken()
        if (!token) {
            router.push(`/login?callbackUrl=${pathname}`)
            setIsAuthenticated(false)
        } else {
            setIsAuthenticated(true)
            api.get("/auth/me").then(r => { if (r.ok) r.json().then(d => setUserName(d.full_name || d.email?.split("@")[0] || "")) }).catch(() => { })
        }
    }, [router, pathname])

    if (isAuthenticated === null) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0e0b1a]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        )
    }

    if (!isAuthenticated) return null

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
        <div className="min-h-screen bg-[#0e0b1a] text-white flex flex-col pt-24">
            <PillNav
                logoElement={logoEl}
                items={navItems}
                baseColor="#1a1530"
                pillColor="#5227FF"
                pillTextColor="#ffffff"
                hoveredPillTextColor="#ffffff"
                theme="dark"
                initialLoadAnimation={false}
            />

            {/* Top-right dashboard/logout */}
            <div className="fixed top-4 right-4 z-[60] flex items-center gap-2">
                <Link href="/dashboard" className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full border transition-all backdrop-blur-md
                    ${pathname === "/dashboard"
                        ? "text-white bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-500/20"
                        : "text-white/80 hover:text-white bg-white/5 border-white/10"}`}>
                    <span className="w-5 h-5 rounded-md bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-[10px] font-black">
                        {userName ? userName[0].toUpperCase() : "U"}
                    </span>
                    <span className="max-w-[100px] truncate">{userName || "Dashboard"}</span>
                </Link>
                <button onClick={logout} className="px-4 py-2 text-sm font-semibold text-white/40 hover:text-red-400 bg-white/5 hover:bg-red-500/10 rounded-full border border-white/5 hover:border-red-500/10 transition-all">
                    Logout
                </button>
            </div>

            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    )
}
