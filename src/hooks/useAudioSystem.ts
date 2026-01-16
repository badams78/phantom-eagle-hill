"use client";

import { useEffect, useRef, useCallback } from 'react';

export function useAudioSystem() {
    const audioContextRef = useRef<AudioContext | null>(null);
    const skiNoiseNodeRef = useRef<ScriptProcessorNode | null>(null); // Deprecated but easy, or use AudioWorklet? Let's use Oscillator/Noise buffer
    const gainNodeRef = useRef<GainNode | null>(null);

    // Initialize Audio Context (must be resumed on user interaction)
    const initAudio = useCallback(() => {
        if (!audioContextRef.current) {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            audioContextRef.current = new AudioContext();

            // Create a Noise Buffer for Skiing Sound (Pink/White Noise)
            const bufferSize = audioContextRef.current.sampleRate * 2; // 2 seconds
            const buffer = audioContextRef.current.createBuffer(1, bufferSize, audioContextRef.current.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            // We need a source that we can loop
            // But we'll create the source when needed or keep one running with volume 0
        }

        if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }
    }, []);

    // Play/Update Skiing Sound (Wind/Carving)
    // Speed: 0 to 1
    const updateSkiSound = useCallback((speed: number) => {
        if (!audioContextRef.current) return;
        const ctx = audioContextRef.current;

        // If we don't have a running noise loop, create it
        if (!gainNodeRef.current) {
            const bufferSize = ctx.sampleRate * 2;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                // Pink noise approximation (smoother than white)
                const white = Math.random() * 2 - 1;
                data[i] = (lastOut + (0.02 * white)) / 1.02;
                lastOut = data[i];
                data[i] *= 3.5; // Compensate for gain loss
            }

            const noise = ctx.createBufferSource();
            noise.buffer = buffer;
            noise.loop = true;

            // Filter to make it sound like wind/snow
            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 400; // Deep rumble

            const gain = ctx.createGain();
            gain.gain.value = 0;

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);

            noise.start();
            gainNodeRef.current = gain;

            // Attach filter ref if we want to modulate pitch
            (gainNodeRef.current as any).filter = filter;
        }

        // Modulate Volume and Frequency based on Speed
        if (gainNodeRef.current) {
            const volume = Math.min(speed / 20, 0.5); // Max volume 0.5
            gainNodeRef.current.gain.setTargetAtTime(volume, ctx.currentTime, 0.1);

            // Modulate filter freq -> Higher speed = more "hiss"
            const freq = 200 + (speed * 40);
            ((gainNodeRef.current as any).filter as BiquadFilterNode).frequency.setTargetAtTime(freq, ctx.currentTime, 0.1);
        }
    }, []);

    const playCrash = useCallback(() => {
        if (!audioContextRef.current) return;
        const ctx = audioContextRef.current;

        // 1. Noise Burst
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.value = 100;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.5, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(300, ctx.currentTime);
        filter.frequency.linearRampToValueAtTime(50, ctx.currentTime + 0.5);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.5);
    }, []);

    const playVictory = useCallback(() => {
        if (!audioContextRef.current) return;
        const ctx = audioContextRef.current;

        const now = ctx.currentTime;
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
            const osc = ctx.createOscillator();
            osc.type = 'triangle';
            osc.frequency.value = freq;

            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0, now + i * 0.1);
            gain.gain.linearRampToValueAtTime(0.3, now + i * 0.1 + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.8);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now + i * 0.1);
            osc.stop(now + i * 0.1 + 1);
        });
    }, []);

    // Cleanup
    useEffect(() => {
        return () => {
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);

    return { initAudio, updateSkiSound, playCrash, playVictory };
}

let lastOut = 0; // State for pink noise generator
