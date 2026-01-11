"use client";

import { Choice } from '../lib/types';
import { ChevronRight, Lock } from 'lucide-react';

interface ChoicePanelProps {
    choices: Choice[];
    onChoose: (choice: Choice) => void;
    isLoading?: boolean;
}

export function ChoicePanel({ choices, onChoose, isLoading }: ChoicePanelProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 mt-auto">
            {choices.map((choice, idx) => (
                <button
                    key={idx}
                    onClick={() => onChoose(choice)}
                    disabled={isLoading}
                    className="group relative flex items-center justify-between p-4 bg-slate-900 border border-slate-700 hover:border-crimson hover:bg-slate-800 transition-all duration-200 text-left rounded focus:outline-none focus:ring-2 focus:ring-crimson/50"
                >
                    {/* Terminal-like indicator */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-crimson transition-colors rounded-l"></div>

                    <span className="flex items-center gap-3 text-slate-300 group-hover:text-white font-mono text-sm md:text-base">
                        <span className="text-slate-600 group-hover:text-crimson text-xs">0{idx + 1}</span>
                        {choice.text}
                    </span>

                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-crimson opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                </button>
            ))}
        </div>
    );
}
