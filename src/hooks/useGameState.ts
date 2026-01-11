"use client";

import { useState, useEffect, useCallback } from 'react';
import { GameState, ItemId, LocationId, SuspectId } from '../lib/types';
import { INITIAL_STATE, ITEMS, LOCATIONS } from '../lib/gameData';

const SAVE_KEY = 'phantom_eagle_hill_save';

export function useGameState() {
    const [state, setState] = useState<GameState>(INITIAL_STATE);
    const [loaded, setLoaded] = useState(false);

    // Load game on mount
    useEffect(() => {
        const saved = localStorage.getItem(SAVE_KEY);
        if (saved) {
            try {
                setState(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to load save", e);
            }
        }
        setLoaded(true);
    }, []);

    // Auto-save on state change
    useEffect(() => {
        if (loaded) {
            localStorage.setItem(SAVE_KEY, JSON.stringify(state));
        }
    }, [state, loaded]);

    const moveTo = useCallback((locationId: LocationId) => {
        const location = LOCATIONS[locationId];
        if (location.isLocked && location.requiredItem && !state.inventory.includes(location.requiredItem)) {
            return { success: false, message: location.lockedMessage };
        }

        setState(prev => ({
            ...prev,
            currentLocation: locationId
        }));
        return { success: true };
    }, [state.inventory]);

    const pickUpItem = useCallback((itemId: ItemId) => {
        setState(prev => {
            // Don't duplicate
            if (prev.inventory.includes(itemId)) return prev;

            const item = ITEMS[itemId];
            const newClues = prev.cluesFound + (item.clueFor ? 1 : 0);

            const newSuspectEvidence = { ...prev.suspectEvidence };
            if (item.clueFor) {
                newSuspectEvidence[item.clueFor] = (newSuspectEvidence[item.clueFor] || 0) + 1;
            }

            return {
                ...prev,
                inventory: [...prev.inventory, itemId],
                cluesFound: newClues,
                suspectEvidence: newSuspectEvidence
            };
        });
    }, []);

    const makeAccusation = useCallback((suspectId: SuspectId) => {
        // Logic for correct accusation could be hardcoded or based on evidence provided in prompts?
        // "Inside: The trophy! Plus final evidence that reveals the true culprit"
        // The prompt didn't strictly say WHO is the culprit, just that evidence exists.
        // I will PICK one based on the context. 
        // Usually the transferred student (Jake) or the Coach are classic tropes.
        // Let's go with Coach Thornton (tired of losing). Or Jake (emotional connection).
        // Let's randomize it? No, keep it deterministic for simplicity unless requested.
        // I'll make Jake Morrison the culprit because of the red fabric (Eaglebrook jacket) being a strong visual clue
        // found early, but maybe misleading? 
        // Actually, "Clipboard Page" (Code Thornton) found on frozen pond.
        // "Cardigan Ski Pass" (Marcus).
        // Let's decide: COACH THORNTON. 
        // Wait, let's verify if the prompt implies one. 
        // "Torn Crimson Fabric ... clue points to Jake"
        // "Cardigan Ski Pass ... clue points to Marcus"
        // "Clipboard Page ... clue points to Coach"
        // 
        // I will pick COACH THORNTON as the culprit for now.

        const CORRECT_SUSPECT = 'COACH_THORNTON'; // Definitive culprit for this version.

        if (suspectId === CORRECT_SUSPECT) {
            setState(prev => ({ ...prev, gameComplete: true, accusation: suspectId }));
            return true;
        } else {
            return false;
        }
    }, []);

    const resetGame = useCallback(() => {
        setState(INITIAL_STATE);
        localStorage.removeItem(SAVE_KEY);
    }, []);

    return {
        gameState: state,
        moveTo,
        pickUpItem,
        makeAccusation,
        resetGame,
        isLoaded: loaded
    };
}
