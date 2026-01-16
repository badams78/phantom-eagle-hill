"use client";

import { useRef, useEffect } from 'react';
import { useGamePhysics } from '../hooks/useGamePhysics';
import { useAssetLoader } from '../hooks/useAssetLoader';
import ResultOverlay from './ResultOverlay';

export default function GameEngine() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { assets, loaded } = useAssetLoader();
    const { player, ai, worldObjects, updatePhysics, gameState, startGame } = useGamePhysics();
    const requestRef = useRef<number>(0);

    // Quick reload for now to "Restart" (Physics hook needs a reset function, but reload is safer for proto)
    const handleRestart = () => window.location.reload();

    const draw = (ctx: CanvasRenderingContext2D) => {
        // Clear Canvas
        const bgGradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
        bgGradient.addColorStop(0, '#f1f5f9'); // Slate 100
        bgGradient.addColorStop(1, '#e2e8f0'); // Slate 200 (Subtle depth)
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // --- CAMERA & VIEWPORT ---
        // Player is fixed at Y = 200
        const playerScreenY = 200;

        // Draw Snow Tracks (Simple lines behind player and AI)
        // (For a future iteration: store trail points)

        // --- DRAW WORLD OBJECTS ---
        worldObjects.forEach(obj => {
            const objScreenY = playerScreenY + (obj.y - player.y);
            const objScreenX = (obj.x / 100) * ctx.canvas.width;

            if (objScreenY < -100 || objScreenY > ctx.canvas.height + 100) return;

            if (obj.type === 'TREE') {
                // Procedural Pine Tree
                // Shadow
                ctx.fillStyle = 'rgba(0,0,0,0.1)';
                ctx.beginPath();
                ctx.ellipse(objScreenX, objScreenY, obj.width / 2, obj.width / 4, 0, 0, Math.PI * 2);
                ctx.fill();

                // Trunk
                ctx.fillStyle = '#451a03';
                ctx.fillRect(objScreenX - 4, objScreenY - 15, 8, 15);

                // Foliage (Deep Green)
                ctx.fillStyle = '#065f46';
                // Bottom Tier
                ctx.beginPath();
                ctx.moveTo(objScreenX - obj.width / 2, objScreenY - 10);
                ctx.lineTo(objScreenX, objScreenY - obj.height * 0.6);
                ctx.lineTo(objScreenX + obj.width / 2, objScreenY - 10);
                ctx.fill();
                // Middle Tier
                ctx.beginPath();
                ctx.moveTo(objScreenX - obj.width / 2.5, objScreenY - obj.height * 0.4);
                ctx.lineTo(objScreenX, objScreenY - obj.height * 0.9);
                ctx.lineTo(objScreenX + obj.width / 2.5, objScreenY - obj.height * 0.4);
                ctx.fill();
                // Top Tier
                ctx.fillStyle = '#047857'; // Lighter green top
                ctx.beginPath();
                ctx.moveTo(objScreenX - obj.width / 3.5, objScreenY - obj.height * 0.7);
                ctx.lineTo(objScreenX, objScreenY - obj.height * 1.1); // Tip
                ctx.lineTo(objScreenX + obj.width / 3.5, objScreenY - obj.height * 0.7);
                ctx.fill();

                // Snow overlap
                ctx.fillStyle = '#e2e8f0';
                ctx.beginPath();
                ctx.moveTo(objScreenX, objScreenY - obj.height * 1.1);
                ctx.lineTo(objScreenX - 5, objScreenY - obj.height * 0.95);
                ctx.lineTo(objScreenX + 5, objScreenY - obj.height * 0.95);
                ctx.fill();

            } else if (obj.type === 'LANDMARK_ROCK') {
                // Rock
                ctx.fillStyle = '#64748b';
                ctx.beginPath();
                ctx.moveTo(objScreenX - obj.width / 2, objScreenY);
                ctx.lineTo(objScreenX - obj.width / 3, objScreenY - obj.height);
                ctx.lineTo(objScreenX + obj.width / 3, objScreenY - obj.height * 0.8);
                ctx.lineTo(objScreenX + obj.width / 2, objScreenY);
                ctx.fill();
                // Highlights
                ctx.fillStyle = '#94a3b8';
                ctx.beginPath();
                ctx.moveTo(objScreenX - obj.width / 3, objScreenY - obj.height);
                ctx.lineTo(objScreenX, objScreenY - obj.height * 0.5);
                ctx.lineTo(objScreenX + obj.width / 3, objScreenY - obj.height * 0.8);
                ctx.fill();

            } else if (obj.type === 'LANDMARK_LODGE') {
                ctx.fillStyle = '#7c2d12'; // Wood color
                ctx.fillRect(objScreenX - obj.width / 2, objScreenY - obj.height, obj.width, obj.height);
                // Roof
                ctx.fillStyle = '#334155';
                ctx.beginPath();
                ctx.moveTo(objScreenX - obj.width / 2 - 10, objScreenY - obj.height);
                ctx.lineTo(objScreenX, objScreenY - obj.height - 40);
                ctx.lineTo(objScreenX + obj.width / 2 + 10, objScreenY - obj.height);
                ctx.fill();

            } else if (obj.type === 'ICE_PATCH') {
                ctx.fillStyle = '#bfdbfe';
                ctx.globalAlpha = 0.6;
                ctx.beginPath();
                ctx.ellipse(objScreenX, objScreenY, obj.width, obj.height / 2, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1.0;

            } else if (obj.type.startsWith('GATE')) {
                const color = obj.type === 'GATE_LEFT' ? '#ef4444' : '#3b82f6';
                ctx.fillStyle = color;
                // Pole
                ctx.fillRect(objScreenX - 2, objScreenY - 30, 4, 30);
                // Flag
                ctx.beginPath();
                ctx.moveTo(objScreenX + 2, objScreenY - 30);
                ctx.lineTo(objScreenX + 25, objScreenY - 25);
                ctx.lineTo(objScreenX + 2, objScreenY - 20);
                ctx.fill();
            }
        });

        // --- DRAW PLAYER ---
        const playerScreenX = (player.x / 100) * ctx.canvas.width;

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.ellipse(playerScreenX, playerScreenY + 5, 20, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Skis
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 4;
        const turnAngle = player.speedX * 0.5; // Tilt skis based on turn

        ctx.save();
        ctx.translate(playerScreenX, playerScreenY);
        ctx.rotate(turnAngle);

        // Left Ski
        ctx.beginPath();
        ctx.moveTo(-10, -10);
        ctx.lineTo(-10, 25);
        ctx.stroke();
        // Right Ski
        ctx.beginPath();
        ctx.moveTo(10, -10);
        ctx.lineTo(10, 25);
        ctx.stroke(); // Parallel skiing

        // Body (Eaglebrook Green)
        ctx.fillStyle = '#059669';
        ctx.beginPath();
        if (player.isTucking) {
            // Tucked pose (Egg shape)
            ctx.ellipse(0, 5, 12, 16, 0, 0, Math.PI * 2);
            ctx.fill();
            // Head lower
            ctx.fillStyle = '#fce7f3'; // Skin
            ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2); ctx.fill();
        } else {
            // Standing pose
            ctx.fillRect(-8, -15, 16, 25); // Torso
            // Head
            ctx.fillStyle = '#fce7f3'; // Skin
            ctx.beginPath(); ctx.arc(0, -22, 9, 0, Math.PI * 2); ctx.fill();
            // Helmet/Hat
            ctx.fillStyle = '#064e3b';
            ctx.beginPath(); ctx.arc(0, -24, 9, Math.PI, 0); ctx.fill();
        }

        ctx.restore();

        // --- DRAW AI OPPONENT ---
        const aiScreenY = playerScreenY + (ai.y - player.y);
        const aiScreenX = (ai.x / 100) * ctx.canvas.width;

        if (aiScreenY > -50 && aiScreenY < ctx.canvas.height + 50) {
            // Shadow
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.beginPath();
            ctx.ellipse(aiScreenX, aiScreenY + 5, 20, 6, 0, 0, Math.PI * 2);
            ctx.fill();

            // Skis
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 4;

            ctx.save();
            ctx.translate(aiScreenX, aiScreenY);
            // AI simple tilt
            ctx.rotate(ai.speedX * 0.3);

            // Left Ski
            ctx.beginPath(); ctx.moveTo(-10, -10); ctx.lineTo(-10, 25); ctx.stroke();
            // Right Ski
            ctx.beginPath(); ctx.moveTo(10, -10); ctx.lineTo(10, 25); ctx.stroke();

            // Body (Cardigan Red)
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(-8, -15, 16, 25);
            // Head
            ctx.fillStyle = '#fce7f3';
            ctx.beginPath(); ctx.arc(0, -22, 9, 0, Math.PI * 2); ctx.fill();

            ctx.restore();

            // Label
            ctx.fillStyle = 'black';
            ctx.font = 'bold 10px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText("CARDIGAN", aiScreenX, aiScreenY - 45);
            ctx.textAlign = 'left';
        }

        // HUD
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 20px sans-serif';
        ctx.fillText(`${Math.round(player.speedY * 2.2)} MPH`, 20, 40); // Fake convert to reasonable MPH

        // Distance Bar
        const progress = Math.min(1, player.y / 5000);
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        ctx.fillRect(20, 60, 200, 10);
        ctx.fillStyle = '#16a34a';
        ctx.fillRect(20, 60, 200 * progress, 10);

        if (player.isTucking) {
            ctx.fillStyle = '#dc2626';
            ctx.font = 'bold 16px sans-serif';
            ctx.fillText("AERO TUCK ACTIVE", 20, 95);
        }
    };

    const loop = () => {
        updatePhysics();

        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
                // Handle High DPI scaling
                const rect = canvasRef.current.getBoundingClientRect();
                canvasRef.current.width = rect.width;
                canvasRef.current.height = rect.height;

                draw(ctx);
            }
        }
        requestRef.current = requestAnimationFrame(loop);
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(requestRef.current);
    }, [updatePhysics]);

    return (
        <div className="relative w-full h-[600px] border-4 border-slate-800 rounded-lg overflow-hidden bg-slate-50 shadow-2xl">
            <canvas ref={canvasRef} className="w-full h-full block" />

            {/* Mobile Controls Overlay (Optional) */}
            <div className="absolute bottom-4 left-4 text-xs text-slate-400 font-mono">
                Controls: Arrows to Steer | Down to Tuck
            </div>

            <ResultOverlay
                status={gameState}
                onRestart={handleRestart}
                onStart={startGame}
            />
        </div>
    );
}
