"use client"

import { useEffect, useRef, useCallback } from "react"

type DotGridProps = {
    dotSize?: number; gap?: number; baseColor?: string; activeColor?: string
    proximity?: number; shockRadius?: number; shockStrength?: number
    resistance?: number; returnDuration?: number; className?: string
}
type Dot = { x: number; y: number; origX: number; origY: number; vx: number; vy: number; color: number }

function hexToRgb(hex: string): [number, number, number] {
    const c = hex.replace("#", "")
    const n = parseInt(c.length === 3 ? c.split("").map(x => x + x).join("") : c, 16)
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
function lerp(a: [number, number, number], b: [number, number, number], t: number) {
    return `rgb(${Math.round(a[0] + (b[0] - a[0]) * t)},${Math.round(a[1] + (b[1] - a[1]) * t)},${Math.round(a[2] + (b[2] - a[2]) * t)})`
}

export default function DotGrid({
    dotSize = 5, gap = 15, baseColor = "#271E37", activeColor = "#5227FF",
    proximity = 120, shockRadius = 250, shockStrength = 5, resistance = 750, returnDuration = 1.5, className = ""
}: DotGridProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const dotsRef = useRef<Dot[]>([])
    const mouseRef = useRef({ x: -9999, y: -9999 })
    const frameRef = useRef(0)
    const baseRgb = hexToRgb(baseColor)
    const activeRgb = hexToRgb(activeColor)

    const buildGrid = useCallback((w: number, h: number) => {
        const dots: Dot[] = []
        const step = dotSize + gap
        for (let row = 0; row <= Math.ceil(h / step); row++)
            for (let col = 0; col <= Math.ceil(w / step); col++) {
                const x = col * step, y = row * step
                dots.push({ x, y, origX: x, origY: y, vx: 0, vy: 0, color: 0 })
            }
        return dots
    }, [dotSize, gap])

    const handleClick = useCallback((e: MouseEvent) => {
        const canvas = canvasRef.current; if (!canvas) return
        const r = canvas.getBoundingClientRect()
        const cx = e.clientX - r.left, cy = e.clientY - r.top
        dotsRef.current.forEach(d => {
            const dx = d.origX - cx, dy = d.origY - cy, dist = Math.hypot(dx, dy)
            if (dist < shockRadius && dist > 0) {
                const force = (1 - dist / shockRadius) * shockStrength
                d.vx += (dx / dist) * force * 60; d.vy += (dy / dist) * force * 60
            }
        })
    }, [shockRadius, shockStrength])

    useEffect(() => {
        const canvas = canvasRef.current; if (!canvas) return
        const ctx = canvas.getContext("2d")!
        let w = 0, h = 0
        const resize = () => {
            const r = canvas.parentElement!.getBoundingClientRect()
            w = canvas.width = r.width; h = canvas.height = r.height
            dotsRef.current = buildGrid(w, h)
        }
        const ro = new ResizeObserver(resize); ro.observe(canvas.parentElement!); resize()
        const onMove = (e: MouseEvent) => { const r = canvas.getBoundingClientRect(); mouseRef.current = { x: e.clientX - r.left, y: e.clientY - r.top } }
        const onLeave = () => { mouseRef.current = { x: -9999, y: -9999 } }
        canvas.addEventListener("mousemove", onMove)
        canvas.addEventListener("mouseleave", onLeave)
        canvas.addEventListener("click", handleClick)
        const damp = 1 - resistance / 100000
        const retSpeed = 1 / (returnDuration * 60)
        const draw = () => {
            ctx.clearRect(0, 0, w, h)
            const mx = mouseRef.current.x, my = mouseRef.current.y
            dotsRef.current.forEach(d => {
                const dx = d.x - mx, dy = d.y - my, dist = Math.hypot(dx, dy)
                if (dist < proximity && dist > 0) { const f = (1 - dist / proximity) * 1.5; d.vx += (dx / dist) * f; d.vy += (dy / dist) * f }
                d.vx += (d.origX - d.x) * retSpeed * 4; d.vy += (d.origY - d.y) * retSpeed * 4
                d.vx *= damp; d.vy *= damp; d.x += d.vx; d.y += d.vy
                const cd = Math.hypot(d.origX - mx, d.origY - my)
                const tc = cd < proximity ? 1 - cd / proximity : 0
                d.color += (tc - d.color) * 0.12
                ctx.beginPath(); ctx.arc(d.x, d.y, dotSize / 2, 0, Math.PI * 2)
                ctx.fillStyle = lerp(baseRgb, activeRgb, d.color); ctx.fill()
            })
            frameRef.current = requestAnimationFrame(draw)
        }
        frameRef.current = requestAnimationFrame(draw)
        return () => {
            cancelAnimationFrame(frameRef.current); ro.disconnect()
            canvas.removeEventListener("mousemove", onMove)
            canvas.removeEventListener("mouseleave", onLeave)
            canvas.removeEventListener("click", handleClick)
        }
    }, [buildGrid, handleClick, proximity, dotSize, returnDuration, resistance, baseRgb, activeRgb])

    return <canvas ref={canvasRef} className={`absolute inset-0 w-full h-full ${className}`} style={{ display: "block" }} />
}