"use client";

import { useEffect, useState } from 'react';
import { Trophy, RefreshCw } from 'lucide-react';

interface VictoryModalProps {
    suspectName: string;
    onPlayAgain: () => void;
}

export function VictoryModal({ suspectName, onPlayAgain }: VictoryModalProps) {
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        setShowConfetti(true);
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm animate-fade-in">
            <div className="max-w-2xl w-full mx-4 bg-slate-900 border border-yellow-500/30 p-8 rounded-lg shadow-2xl relative overflow-hidden text-center">

                {/* Background Highlight */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-600 via-yellow-400 to-yellow-600"></div>

                <div className="mb-6 flex justify-center w-full relative h-48 rounded-lg overflow-hidden border border-yellow-500/20 shadow-xl">
                    <img
                        src="/images/victory.jpg"
                        alt="Victory - The Eagle Trophy"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-slate-900 to-transparent"></div>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 p-3 bg-yellow-500/20 rounded-full border border-yellow-500/30 backdrop-blur-sm">
                        <Trophy className="w-8 h-8 text-yellow-400" />
                    </div>
                </div>

                <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Case Closed!</h1>
                <p className="text-slate-400 text-lg mb-8">
                    The Eagle Trophy is safe.
                </p>

                <div className="space-y-4 mb-8">
                    <p className="text-slate-300 leading-relaxed">
                        You correctly identified <span className="text-crimson font-bold">{suspectName}</span> as the culprit.
                        The race against Cardigan is back on, and Eaglebrook's honor has been restored!
                    </p>
                    <p className="text-sm text-slate-500 italic">
                        "Excellent work, detective. The slopes are safe once again."
                    </p>
                </div>

                <button
                    onClick={onPlayAgain}
                    className="inline-flex items-center gap-2 px-8 py-3 bg-crimson hover:bg-red-800 text-white font-bold rounded transition-colors shadow-lg hover:shadow-crimson/25"
                >
                    <RefreshCw className="w-4 h-4" />
                    Play Again
                </button>

                {/* Simple CSS Confetti (dots) */}
                {showConfetti && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        {[...Array(20)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute w-2 h-2 bg-yellow-500 rounded-full animate-pulse"
                                style={{
                                    top: `$-20%`,
                                    left: `${Math.random() * 100}%`,
                                    animation: `fall ${2 + Math.random() * 3}s linear infinite`,
                                    animationDelay: `${Math.random() * 5}s`
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
