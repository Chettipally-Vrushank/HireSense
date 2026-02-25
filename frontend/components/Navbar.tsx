"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { getToken, logout } from "@/lib/auth"
import { api } from "@/lib/api"

export default function Navbar() {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [userName, setUserName] = useState("")
    const [scrolled, setScrolled] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const pathname = usePathname()

    useEffect(() => {
        const token = getToken()
        setIsLoggedIn(!!token)
        if (token) {
            api.get("/auth/me").then(res => {
                if (res.ok) res.json().then(data => {
                    // Use profile name if available, otherwise derive from email
                    const name = data.full_name || data.email?.split("@")[0] || ""
                    setUserName(name)
                })
            }).catch(() => { })
        }
    }, [])

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 12)
        window.addEventListener("scroll", onScroll)
        return () => window.removeEventListener("scroll", onScroll)
    }, [])

    // Close mobile menu on route change
    useEffect(() => { setMobileOpen(false) }, [pathname])

    const isActive = (href: string) => pathname === href

    const navLinks = [
        { href: "/analyze", label: "Analyze" },
        { href: "/tailor", label: "Tailor Resume" },
        { href: "/resumes", label: "My Resumes" },
        { href: "/tailored", label: "Tailored" },
    ]

    return (
        <>
            <nav className={`fixed top-0 w-full z-50 transition-all duration-300
                ${scrolled
                    ? "bg-white/95 backdrop-blur-xl shadow-sm shadow-gray-200/80 border-b border-gray-100"
                    : "bg-white/70 backdrop-blur-md border-b border-transparent"}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-[62px] items-center">

                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
                            <div className="relative w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200 group-hover:shadow-indigo-300 transition-shadow">
                                <span className="text-white font-black text-lg leading-none">H</span>
                                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white" />
                            </div>
                            <span className="text-[17px] font-black tracking-tight text-gray-900">
                                Hire<span className="text-indigo-600">Sense</span>
                            </span>
                        </Link>

                        {/* Desktop nav links */}
                        <div className="hidden md:flex items-center gap-1">
                            {navLinks.map(({ href, label }) => (
                                <Link key={href} href={href}
                                    className={`relative px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200
                                        ${isActive(href)
                                            ? "text-indigo-600 bg-indigo-50"
                                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"}`}>
                                    {label}
                                    {isActive(href) && (
                                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-500" />
                                    )}
                                </Link>
                            ))}
                        </div>

                        {/* Desktop right side */}
                        <div className="hidden md:flex items-center gap-3">
                            {isLoggedIn ? (
                                <>
                                    <Link href="/dashboard"
                                        className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all
                                            ${isActive("/dashboard")
                                                ? "text-indigo-600 bg-indigo-50"
                                                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"}`}>
                                        <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xs font-black flex-shrink-0">
                                            {userName ? userName[0].toUpperCase() : "U"}
                                        </span>
                                        <span className="max-w-[120px] truncate">
                                            {userName || "Dashboard"}
                                        </span>
                                    </Link>
                                    <button onClick={logout}
                                        className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link href="/login"
                                        className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all">
                                        Sign In
                                    </Link>
                                    <Link href="/signup"
                                        className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl hover:from-indigo-700 hover:to-violet-700 transition-all shadow-md shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-px">
                                        Get Started Free
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile hamburger */}
                        <button
                            onClick={() => setMobileOpen(v => !v)}
                            className="md:hidden flex flex-col gap-1.5 p-2 rounded-xl hover:bg-gray-100 transition-all"
                            aria-label="Toggle menu">
                            <span className={`block w-5 h-0.5 bg-gray-700 rounded transition-all duration-300 ${mobileOpen ? "rotate-45 translate-y-2" : ""}`} />
                            <span className={`block w-5 h-0.5 bg-gray-700 rounded transition-all duration-300 ${mobileOpen ? "opacity-0" : ""}`} />
                            <span className={`block w-5 h-0.5 bg-gray-700 rounded transition-all duration-300 ${mobileOpen ? "-rotate-45 -translate-y-2" : ""}`} />
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                <div className={`md:hidden transition-all duration-300 overflow-hidden ${mobileOpen ? "max-h-[480px] opacity-100" : "max-h-0 opacity-0"}`}>
                    <div className="px-4 pb-5 pt-2 space-y-1 bg-white/95 backdrop-blur-xl border-t border-gray-100">
                        {navLinks.map(({ href, label }) => (
                            <Link key={href} href={href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all
                                    ${isActive(href)
                                        ? "text-indigo-600 bg-indigo-50"
                                        : "text-gray-700 hover:bg-gray-50"}`}>
                                {label}
                                {isActive(href) && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500" />}
                            </Link>
                        ))}
                        <div className="pt-2 border-t border-gray-100 space-y-1">
                            {isLoggedIn ? (
                                <>
                                    <Link href="/dashboard"
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all">
                                        <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xs font-black flex-shrink-0">
                                            {userName ? userName[0].toUpperCase() : "U"}
                                        </span>
                                        <span className="truncate">{userName || "Dashboard"}</span>
                                    </Link>
                                    <button onClick={logout}
                                        className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-all">
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link href="/login"
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all">
                                        Sign In
                                    </Link>
                                    <Link href="/signup"
                                        className="flex items-center justify-center px-4 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600">
                                        Get Started Free →
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
        </>
    )
}