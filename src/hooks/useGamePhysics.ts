import { useRef, useEffect, useState, useCallback } from 'react';
import { generateCourse, WorldObject } from '../lib/gameWorld';

// Types
export type PlayerState = {
    x: number;
    y: number; // Y is distance down the mountain
    speedX: number;
    speedY: number;
    isTucking: boolean;
    isCrashed: boolean;
};

// Physics Constants
const GRAVITY = 0.5;
const FRICTION = 0.96;
const STEERING_SPEED = 0.8;
const MAX_SPEED = 15;
const TUCK_MAX_SPEED = 22;
const TUCK_ACCEL = 0.2;

export type GameStatus = 'START_SCREEN' | 'RACING' | 'FINISHED' | 'CRASHED';

export function useGamePhysics() {
    // Generate world once on mount
    const [worldObjects] = useState<WorldObject[]>(() => generateCourse());
    const [gameState, setGameState] = useState<GameStatus>('RACING'); // Keeping RACING default for now until menu exists

    // ... rest of state

    const [player, setPlayer] = useState<PlayerState>({
        x: 50,
        y: 0,
        speedX: 0,
        speedY: 0,
        isTucking: false,
        isCrashed: false,
    });

    const keys = useRef<Set<string>>(new Set());

    // Input Handlers
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => keys.current.add(e.key);
        const handleKeyUp = (e: KeyboardEvent) => keys.current.delete(e.key);

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    // AI State
    const [ai, setAi] = useState<PlayerState>({
        x: 60, // Starts next to player
        y: 0,
        speedX: 0,
        speedY: 0,
        isTucking: false,
        isCrashed: false,
    });

    // Main Physics Loop Tick
    const updatePhysics = useCallback(() => {
        setPlayer(prev => {
            if (prev.isCrashed) return prev;

            const isTucking = keys.current.has('ArrowDown');

            // ... (Player Physics Code Logic stays same, just re-calc for closure scope if needed, but we are inside setPlayer callback which complicates AI update.
            // Better to update both states outside the functional update or doing them sequentially.)
            // Actually, we need to update AI *based* on Player position for rubber banding.

            // NOTE: To cleanly update both without race conditions in a single tick, 
            // we should probably refactor to a single state object { player, ai }.
            // But for now, we can use a functional update for AI inside the same callback if we had access to current player, 
            // OR just update AI independently based on its own previous state + a ref to player Y.

            return prev; // Placeholder to avoid breaking flow while I rewrite the logic below
        });

        // REWRITE: We need to update both. 
        // Let's do the Player Update first, capture the result, then update AI.
        // Javascript state updates are batched. 

        setPlayer(prevPlayer => {
            if (prevPlayer.isCrashed) return prevPlayer;

            // --- PLAYER PHYSICS ---
            const isTucking = keys.current.has('ArrowDown');
            let newSpeedY = prevPlayer.speedY;
            const targetMaxSpeed = isTucking ? TUCK_MAX_SPEED : MAX_SPEED;
            if (newSpeedY < targetMaxSpeed) newSpeedY += isTucking ? TUCK_ACCEL : 0.1;

            let newSpeedX = prevPlayer.speedX;
            const steerFactor = isTucking ? 0.3 : 1.0;
            if (keys.current.has('ArrowLeft')) newSpeedX -= STEERING_SPEED * steerFactor;
            if (keys.current.has('ArrowRight')) newSpeedX += STEERING_SPEED * steerFactor;
            newSpeedX *= FRICTION;

            let newX = prevPlayer.x + newSpeedX;
            const newY = prevPlayer.y + newSpeedY;
            if (newX < 0) { newX = 0; newSpeedX = 0; }
            if (newX > 100) { newX = 100; newSpeedX = 0; }

            // Collision
            let crashed = false;
            const nearbyObjects = worldObjects.filter(obj => obj.y > newY - 100 && obj.y < newY + 100);
            for (const obj of nearbyObjects) {
                const playerWidthPercent = 3;
                const objWidthPercent = (obj.width / 800) * 100;
                if (Math.abs(newY - obj.y) < (obj.height / 2)) {
                    if (Math.abs(newX - obj.x) < (objWidthPercent / 2 + playerWidthPercent / 2)) {
                        if (obj.type === 'TREE' || obj.type === 'LANDMARK_ROCK') {
                            crashed = true; newSpeedY = 0; newSpeedX = 0;
                        }
                    }
                }
            }

            // Update AI based on this NEW player position? No, react state isn't instant.
            // We will update AI based on *previous* player Y or just its own logic + rubber banding to "ideal" pace.

            return {
                x: newX, y: newY, speedX: newSpeedX, speedY: newSpeedY, isTucking, isCrashed: crashed
            };
        });

        setAi(prevAi => {
            // AI LOGIC
            // Goal: Center of track (x=50) but weave slightly
            // Speed: Rubber band to player y

            // We can't see "current" player Y here easily without a ref, 
            // so we'll just have AI race at a "Target Pace" that speeds up if it falls behind global time 
            // OR just strictly simple AI for now:

            let targetSpeed = 16;
            // Simple weave
            const time = Date.now() / 1000;
            const targetX = 50 + Math.sin(time) * 30; // Weave between 20 and 80

            let newSpeedY = prevAi.speedY;
            if (newSpeedY < targetSpeed) newSpeedY += 0.1;

            let newSpeedX = prevAi.speedX;
            if (prevAi.x < targetX) newSpeedX += 0.2;
            else newSpeedX -= 0.2;
            newSpeedX *= 0.95; // Friction

            return {
                ...prevAi,
                x: prevAi.x + newSpeedX,
                y: prevAi.y + newSpeedY,
                speedX: newSpeedX,
                speedY: newSpeedY
            };
        });

    }, [worldObjects, gameState]); // Added dependency

    // Check for Finish Line (outside the physics loop to avoid deep nesting issues with state setters that trigger re-renders? 
    // Actually, best to do it inside. But we need to setGameState. 
    // We can do a useEffect to monitor player.y)

    useEffect(() => {
        if (player.y >= 5000 && gameState === 'RACING') {
            setGameState('FINISHED');
        }
    }, [player.y, gameState]);

    return { player, ai, worldObjects, updatePhysics, gameState };
}
