"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import DottedMap from "dotted-map";
import Image from "next/image";

interface MapProps {
    dots?: Array<{
        start: { lat: number; lng: number; label?: string };
        end: { lat: number; lng: number; label?: string };
    }>;
    lineColor?: string;
}

function MapSection({
    dots = [],
    lineColor = "#0ea5e9",
}: MapProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const map = new DottedMap({ height: 100, grid: "diagonal" });


    const svgMap = map.getSVG({
        radius: 0.22,
        color: "#000",
        shape: "circle",
        backgroundColor: "transparent", // ✅ Make background transparent
    });

    const projectPoint = (lat: number, lng: number) => {
        const x = (lng + 180) * (800 / 360);
        const y = (90 - lat) * (400 / 180);
        return { x, y };
    };

    const createCurvedPath = (
        start: { x: number; y: number },
        end: { x: number; y: number }
    ) => {
        const midX = (start.x + end.x) / 2;
        const midY = Math.min(start.y, end.y) - 50;
        return `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`;
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 1 }}
            className="w-full aspect-[2/1] bg-transparent rounded-lg relative font-sans">
            <Image
                src={`data:image/svg+xml;utf8,${encodeURIComponent(svgMap)}`}
                className="h-full w-full bg-transparent [mask-image:linear-gradient(to_bottom,transparent,white_10%,white_90%,transparent)] pointer-events-none select-none"
                alt="world map"
                height={495}
                width={1056}
                draggable={false}
            />
            <svg
                ref={svgRef}
                viewBox="0 0 800 400"
                className="w-full h-full absolute inset-0 pointer-events-none select-none bg-transparent"
            >
                {/* Path Animations */}
                {dots.map((dot, i) => {
                    const startPoint = projectPoint(dot.start.lat, dot.start.lng);
                    const endPoint = projectPoint(dot.end.lat, dot.end.lng);
                    return (
                        <g key={`path-group-${i}`}>
                            <motion.path
                                d={createCurvedPath(startPoint, endPoint)}
                                fill="none"
                                stroke="url(#path-gradient)"
                                strokeWidth="1"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{
                                    duration: 1,
                                    delay: 0.5 * i,
                                    ease: "easeOut",
                                }}
                            />
                        </g>
                    );
                })}

                <defs>
                    <linearGradient id="path-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="white" stopOpacity="0" />
                        <stop offset="5%" stopColor={lineColor} stopOpacity="1" />
                        <stop offset="95%" stopColor={lineColor} stopOpacity="1" />
                        <stop offset="100%" stopColor="white" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Pulsing Dots */}
                {dots.map((dot, i) => (
                    <g key={`points-group-${i}`}>
                        {["start", "end"].map((pos) => {
                            const point = projectPoint(dot[pos as "start" | "end"].lat, dot[pos as "start" | "end"].lng);
                            return (
                                <g key={`${pos}-${i}`}>
                                    <circle cx={point.x} cy={point.y} r="2" fill={lineColor} />
                                    <circle cx={point.x} cy={point.y} r="2" fill={lineColor} opacity="0.5">
                                        <animate attributeName="r" from="2" to="8" dur="1.5s" repeatCount="indefinite" />
                                        <animate attributeName="opacity" from="0.5" to="0" dur="1.5s" repeatCount="indefinite" />
                                    </circle>
                                </g>
                            );
                        })}
                    </g>
                ))}
            </svg>
        </motion.div>
    );
}
export default MapSection;
