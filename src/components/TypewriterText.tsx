"use client";

import { useEffect, useState } from 'react';

interface TypewriterTextProps {
    text: string;
    className?: string;
    speed?: number;
    onComplete?: () => void;
}

export function TypewriterText({ text, className = "", speed = 30, onComplete }: TypewriterTextProps) {
    const [displayedText, setDisplayedText] = useState("");
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        setDisplayedText("");
        setIsComplete(false);
        let index = 0;
        const timer = setInterval(() => {
            if (index < text.length) {
                setDisplayedText((prev) => prev + text.charAt(index));
                index++;
            } else {
                clearInterval(timer);
                setIsComplete(true);
                if (onComplete) onComplete();
            }
        }, speed);

        return () => clearInterval(timer);
    }, [text, speed, onComplete]);

    return (
        <p className={`font-mono ${className}`}>
            {displayedText}
            {!isComplete && <span className="animate-pulse">_</span>}
        </p>
    );
}
