"use client";

import { ReactNode } from 'react';

interface GameContainerProps {
    children: ReactNode;
    className?: string;
}

export function GameContainer({ children, className = "" }: GameContainerProps) {
    return (
        <div className={`min-h-screen bg-slate-950 flex items-center justify-center p-4 ${className}`}>
            <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 shadow-2xl rounded-lg overflow-hidden relative min-h-[600px] flex flex-col">
                {children}

                {/* Decorative Grid Lines */}
                <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

                {/* Screen Glare/Reflection Effect */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent rounded-lg"></div>
            </div>
        </div>
    );
}
