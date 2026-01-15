"use client";

import { useRef, useEffect } from 'react';
import { useGamePhysics } from '../hooks/useGamePhysics';
import { useAssetLoader } from '../hooks/useAssetLoader';

export default function GameEngine() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { assets, loaded } = useAssetLoader();
    const { player, ai, worldObjects, updatePhysics } = useGamePhysics();
    const requestRef = useRef<number>(0);

    const draw = (ctx: CanvasRenderingContext2D) => {
        // Clear Canvas
        ctx.fillStyle = '#f8fafc'; // Snow White (slate-50)
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Draw Player (Placeholder Circle)
        // Map player.x (0-100) to canvas width
        const playerScreenX = (player.x / 100) * ctx.canvas.width;
        const playerScreenY = 200; // Player stays fixed vertically, world moves up

        // Draw Skier Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.ellipse(playerScreenX, playerScreenY + 10, 15, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Draw Skier Body
        ctx.fillStyle = '#059669'; // Eaglebrook Green
        ctx.beginPath();
        ctx.arc(playerScreenX, playerScreenY, 15, 0, Math.PI * 2);
        ctx.fill();

        // Draw Tuck Indicator
        if (player.isTucking) {
            ctx.strokeStyle = '#dc2626'; // Red glow
            ctx.lineWidth = 3;
            ctx.stroke();
        }

        // --- DRAW AI OPPONENT ---
        const aiScreenY = playerScreenY + (ai.y - player.y);
        const aiScreenX = (ai.x / 100) * ctx.canvas.width;

        // Simple culling for drawing
        if (aiScreenY > -50 && aiScreenY < ctx.canvas.height + 50) {
            // Shadow
            ctx.fillStyle = 'rgba(0,0,0,0.2)';
            ctx.beginPath();
            ctx.ellipse(aiScreenX, aiScreenY + 10, 15, 5, 0, 0, Math.PI * 2);
            ctx.fill();

            // Body (Cardigan Red)
            ctx.fillStyle = '#dc2626';
            ctx.beginPath();
            ctx.arc(aiScreenX, aiScreenY, 15, 0, Math.PI * 2);
            ctx.fill();

            // Label
            ctx.fillStyle = 'white';
            ctx.font = '10px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText("AI", aiScreenX, aiScreenY - 20);
            ctx.textAlign = 'left';
        } else {
            // Off-screen indicator
            if (aiScreenY < -50) {
                // AI is Ahead (Above screen? No, Y increases downhill. If AI Y > Player Y, AI is downhill/ahead.
                // Wait, screen Y = playerScreenY + (ai.y - player.y).
                // If AI is downhill (larger Y), (ai.y - player.y) is positive. It appears lower on screen.
                // If AI is off bottom of screen, it's ahead.
            }
        }


        // --- DRAW WORLD OBJECTS ---
        // Only draw visible objects (viewport optimization)
        // Viewport center is player.y. Viewport height ~600px canvas.
        // We render objects where obj.y is relative to player.y

        ctx.fillStyle = '#1e293b'; // Tree trunk color

        worldObjects.forEach(obj => {
            const objScreenY = playerScreenY + (obj.y - player.y);
            const objScreenX = (obj.x / 100) * ctx.canvas.width;

            if (objScreenY < -100 || objScreenY > ctx.canvas.height + 100) return;

            if (obj.type === 'TREE') {
                if (assets['TREE_1']) {
                    ctx.drawImage(assets['TREE_1'], objScreenX - obj.width / 2, objScreenY - obj.height, obj.width, obj.height);
                } else {
                    ctx.fillStyle = '#0f766e';
                    ctx.beginPath();
                    ctx.moveTo(objScreenX, objScreenY - obj.height);
                    ctx.lineTo(objScreenX - obj.width / 2, objScreenY);
                    ctx.lineTo(objScreenX + obj.width / 2, objScreenY);
                    ctx.fill();
                }
            } else if (obj.type === 'LANDMARK_ROCK') {
                if (assets['LANDMARK_ROCK']) {
                    ctx.drawImage(assets['LANDMARK_ROCK'], objScreenX - obj.width / 2, objScreenY - obj.height, obj.width, obj.height);
                } else {
                    ctx.fillStyle = '#64748b';
                    ctx.fillRect(objScreenX - obj.width / 2, objScreenY - obj.height, obj.width, obj.height);
                }
            } else if (obj.type === 'LANDMARK_LODGE') {
                if (assets['LANDMARK_LODGE']) {
                    ctx.drawImage(assets['LANDMARK_LODGE'], objScreenX - obj.width / 2, objScreenY - obj.height, obj.width, obj.height);
                } else {
                    ctx.fillStyle = '#7c2d12'; // Wood color
                    ctx.fillRect(objScreenX - obj.width / 2, objScreenY - obj.height, obj.width, obj.height);
                }
            } else if (obj.type === 'ICE_PATCH') {
                ctx.fillStyle = '#bfdbfe';
                ctx.globalAlpha = 0.5;
                ctx.beginPath();
                ctx.ellipse(objScreenX, objScreenY, obj.width, obj.height / 2, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1.0;
            } else if (obj.type.startsWith('GATE')) {
                ctx.fillStyle = obj.type === 'GATE_LEFT' ? '#ef4444' : '#3b82f6';
                ctx.beginPath();
                ctx.arc(objScreenX, objScreenY, 10, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        // DEBUG HUD
        ctx.fillStyle = 'black';
        ctx.font = '16px monospace';
        ctx.fillText(`Speed: ${Math.round(player.speedY)} mph`, 20, 40);
        ctx.fillText(`Distance: ${Math.round(player.y)} m`, 20, 60);
        if (player.isTucking) ctx.fillText("TUCKING!", 20, 80);
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
        </div>
    );
}
