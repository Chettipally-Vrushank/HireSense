"use client";
import React, { useRef, useState, useEffect } from "react";
import { useScroll, useTransform, motion } from "framer-motion";

export const ContainerScroll = ({
    titleComponent,
    children,
}: {
    titleComponent: string | React.ReactNode;
    children: React.ReactNode;
}) => {
    const containerRef = useRef<any>(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end end"],
    });

    const rotate = useTransform(scrollYProgress, [0, 1], [20, 0]);
    const scale = useTransform(scrollYProgress, [0, 1], [isMobile ? 0.9 : 0.8, 1]);
    const translateY = useTransform(
        scrollYProgress,
        [0, 1],
        [isMobile ? -20 : -50, 0]
    );

    return (
        <div
            className="h-[60rem] md:h-[80rem] flex items-center justify-center relative p-2 md:p-20 w-full"
            ref={containerRef}
        >
            <div
                className="py-10 md:py-40 w-full relative"
                style={{
                    perspective: "1000px",
                }}
            >
                <Header translateY={translateY} titleComponent={titleComponent} />
                <Card rotate={rotate} translateY={translateY} scale={scale}>
                    {children}
                </Card>
            </div>
        </div>
    );
};

export const Header = ({ translateY, titleComponent }: any) => {
    return (
        <motion.div
            style={{
                translateY: translateY,
            }}
            className="max-w-5xl mx-auto text-center"
        >
            {titleComponent}
        </motion.div>
    );
};

export const Card = ({
    rotate,
    scale,
    translateY,
    children,
}: {
    rotate: any;
    scale: any;
    translateY: any;
    children: React.ReactNode;
}) => {
    return (
        <motion.div
            style={{
                rotateX: rotate,
                scale,
            }}
            className="max-w-5xl -mt-12 mx-auto h-[40rem] md:h-[50rem] w-full border-4 border-white/5 bg-[#12101e] p-2 md:p-6 rounded-[30px] shadow-2xl"
        >
            <div className="bg-[#0e0b1a] h-full w-full rounded-2xl overflow-hidden">
                {children}
            </div>
        </motion.div>
    );
};
