"use client";
import {
    useScroll,
    useTransform,
    motion,
} from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

interface TimelineEntry {
    title: string;
    subtitle?: string;
    content: React.ReactNode;
}

export const Timeline = ({ data }: { data: TimelineEntry[] }) => {
    const ref = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [height, setHeight] = useState(0);

    useEffect(() => {
        if (ref.current) {
            const rect = ref.current.getBoundingClientRect();
            setHeight(rect.height - 150);
        }
    }, [ref, data]);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start 10%", "end 100%"],
    });

    const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
    const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

    return (
        <div
            className="w-full bg-[#0e0b1a] md:px-10 font-sans"
            ref={containerRef}
        >
            <div ref={ref} className="relative max-w-7xl mx-auto pb-6">
                {data.map((item, index) => (
                    <div
                        key={index}
                        className="flex justify-start pt-8 md:pt-16"
                    >
                        <div className="sticky flex flex-col z-40 items-center top-40 self-start md:w-32 flex-shrink-0">
                            <div className="h-8 absolute left-6 md:left-10 w-8 rounded-full bg-[#0e0b1a] flex items-center justify-center border border-indigo-500/30">
                                <div className="h-3 w-3 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
                            </div>
                        </div>

                        <div className="relative pl-20 md:pl-0 pr-4 w-full">
                            <div className="mb-2 text-sm font-bold tracking-widest text-[#5227FF] uppercase">
                                {item.title}
                            </div>
                            <h3 className="text-4xl md:text-5xl lg:text-7xl mb-4 text-left font-bold text-white/90 tracking-tight">
                                {item.subtitle}
                            </h3>
                            <div className="text-white/50 text-lg md:text-xl leading-relaxed max-w-2xl font-light">
                                {item.content}
                            </div>
                        </div>
                    </div>
                ))}
                <div
                    style={{
                        height: height + "px",
                    }}
                    className="absolute md:left-[3.25rem] left-[2.25rem] top-0 overflow-hidden w-[2px] bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] from-transparent from-[0%] via-indigo-900/40 to-transparent to-[99%]  [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_100%,transparent_100%)] "
                >
                    <motion.div
                        style={{
                            height: heightTransform,
                            opacity: opacityTransform,
                        }}
                        className="absolute inset-x-0 top-0 w-[2px] bg-gradient-to-t from-[#5227FF] via-violet-500 to-transparent from-[0%] via-[10%] rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                    />
                </div>
            </div>
        </div>
    );
};
