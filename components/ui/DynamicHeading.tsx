"use client";

import React from "react";

export default function DynamicHeading({ className = "" }: { className?: string }) {
    return (
        <div className={`relative inline-block group cursor-pointer select-none ${className}`}>
            {/* Glow effect */}
            <div className="absolute -inset-2 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 rounded-lg blur-lg opacity-0 group-hover:opacity-50 transition duration-500 group-hover:duration-200 animate-tilt"></div>

            {/* Text */}
            <h1 className="relative font-bold tracking-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 animate-gradient bg-300% transition-all duration-300 group-hover:tracking-wide">
                    Photoverse
                </span>
            </h1>
        </div>
    );
}
