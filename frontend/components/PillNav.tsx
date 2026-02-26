"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"

type NavItem = { label: string; href: string }
type PillNavProps = {
    logo?: string
    logoAlt?: string
    logoElement?: React.ReactNode
    items: NavItem[]
    activeHref?: string
    className?: string
    baseColor?: string
    pillColor?: string
    hoveredPillTextColor?: string
    pillTextColor?: string
    theme?: "light" | "dark"
    initialLoadAnimation?: boolean
}

export default function PillNav({
    logo, logoAlt = "Logo", logoElement, items, activeHref,
    className = "", baseColor = "#000000", pillColor = "#ffffff",
    hoveredPillTextColor = "#ffffff", pillTextColor = "#000000",
    theme = "light", initialLoadAnimation = true,
}: PillNavProps) {
    const pathname = usePathname()
    const active = activeHref ?? pathname
    const navRef = useRef<HTMLDivElement>(null)
    const pillRef = useRef<HTMLDivElement>(null)
    const itemRefs = useRef<(HTMLAnchorElement | null)[]>([])
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)
    const [mounted, setMounted] = useState(false)
    const [visible, setVisible] = useState(!initialLoadAnimation)
    const animFrameRef = useRef<number | null>(null)
    const pillPos = useRef({ x: 0, w: 0 })
    const pillTarget = useRef({ x: 0, w: 0 })
    const snapRef = useRef(true)

    const activeIdx = items.findIndex(i => i.href === active)
    const targetIdx = hoveredIdx !== null ? hoveredIdx : activeIdx

    function updatePillTarget(idx: number) {
        const el = itemRefs.current[idx]
        const nav = navRef.current
        if (!el || !nav) return
        const navRect = nav.getBoundingClientRect()
        const elRect = el.getBoundingClientRect()
        pillTarget.current = { x: elRect.left - navRect.left, w: elRect.width }
    }

    function animatePill() {
        const pill = pillRef.current
        if (!pill) return
        if (snapRef.current) {
            pillPos.current.x = pillTarget.current.x
            pillPos.current.w = pillTarget.current.w
            snapRef.current = false
        } else {
            pillPos.current.x += (pillTarget.current.x - pillPos.current.x) * 0.18
            pillPos.current.w += (pillTarget.current.w - pillPos.current.w) * 0.18
        }
        pill.style.transform = `translateX(${pillPos.current.x}px)`
        pill.style.width = `${pillPos.current.w}px`
        animFrameRef.current = requestAnimationFrame(animatePill)
    }

    useEffect(() => {
        setMounted(true)
        if (initialLoadAnimation) setTimeout(() => setVisible(true), 80)
    }, [initialLoadAnimation])

    useEffect(() => {
        if (!mounted) return
        const idx = hoveredIdx !== null ? hoveredIdx : activeIdx
        if (idx >= 0) updatePillTarget(idx)
    }, [mounted, hoveredIdx, activeIdx, pathname])

    useEffect(() => {
        if (!mounted) return
        animFrameRef.current = requestAnimationFrame(animatePill)
        return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current) }
    }, [mounted])

    const isDark = theme === "dark"
    const textColor = isDark ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.6)"
    const activeTextColor = pillTextColor

    return (
        <nav className={`fixed top-4 left-1/2 z-50 -translate-x-1/2 transition-all duration-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"} ${className} w-fit max-w-[95vw]`}>
            <div ref={navRef} className="relative flex items-center px-4 py-2.5 rounded-full"
                style={{ background: baseColor, boxShadow: isDark ? "0 8px 32px rgba(0,0,0,0.5),0 1px 0 rgba(255,255,255,0.06) inset" : "0 8px 32px rgba(0,0,0,0.12),0 1px 0 rgba(255,255,255,0.8) inset" }}>
                {/* Sliding pill */}
                <div ref={pillRef} className="absolute top-2.5 bottom-2.5 rounded-full pointer-events-none"
                    style={{ background: pillColor, boxShadow: isDark ? "0 2px 12px rgba(82,39,255,0.4)" : "0 2px 8px rgba(0,0,0,0.15)", zIndex: 0, left: 0, willChange: "transform,width" }} />
                {/* Logo */}
                {(logo || logoElement) && (
                    <Link href="/" className="relative z-10 flex items-center px-4 py-1.5 mr-2 flex-shrink-0">
                        {logoElement ?? <img src={logo} alt={logoAlt} className="h-7 w-auto" />}
                    </Link>
                )}
                {/* Items */}
                <div className="flex items-center gap-2">
                    {items.map((item, i) => {
                        const isActive = item.href === active
                        const isHov = hoveredIdx === i
                        const pilled = isActive || isHov
                        return (
                            <Link key={item.href} href={item.href}
                                ref={el => { itemRefs.current[i] = el }}
                                onMouseEnter={() => setHoveredIdx(i)}
                                onMouseLeave={() => setHoveredIdx(null)}
                                className="relative z-10 px-6 py-2 rounded-full text-[13px] font-bold transition-colors duration-200 whitespace-nowrap select-none"
                                style={{ color: pilled ? activeTextColor : textColor }}>
                                {item.label}
                            </Link>
                        )
                    })}
                </div>
            </div>
        </nav>
    )
}