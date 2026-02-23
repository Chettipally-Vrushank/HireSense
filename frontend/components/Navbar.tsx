"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { getToken, logout } from "@/lib/auth"

export default function Navbar() {
    const [isLoggedIn, setIsLoggedIn] = useState(false)

    useEffect(() => {
        setIsLoggedIn(!!getToken())
    }, [])

    return (
        <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex items-center gap-2">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-xl">H</span>
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                                HireSense
                            </span>
                        </Link>
                    </div>

                    <div className="hidden md:flex items-center gap-8">
                        <Link href="/analyze" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">
                            Analyze
                        </Link>
                        <Link href="/tailor" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">
                            Tailor Resume
                        </Link>
                        <Link href="/tailored" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">
                            My Resumes
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        {isLoggedIn ? (
                            <>
                                <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-indigo-600">
                                    Dashboard
                                </Link>
                                <button
                                    onClick={logout}
                                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-full hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-indigo-600">
                                    Login
                                </Link>
                                <Link
                                    href="/signup"
                                    className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-full hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200"
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}
