import { useState, useEffect } from 'react';

// Define the assets we need to load
// Define the assets we need to load
const ASSETS = {
    'TREE_1': null, // Reverting to procedural drawing for quality control
    'LANDMARK_ROCK': null,
    'LANDMARK_LODGE': null,
    'ICE': null,
    'SPRITE_PLAYER': null,
    'SPRITE_AI': null,
};

// We will use HTMLImageElements
export type GameAssets = Record<string, HTMLImageElement | null>;

export function useAssetLoader() {
    const [assets, setAssets] = useState<GameAssets>({});
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const load = async () => {
            const loadedAssets: GameAssets = {};
            const promises = Object.entries(ASSETS).map(([key, src]) => {
                if (!src) {
                    loadedAssets[key] = null;
                    return Promise.resolve();
                }
                return new Promise<void>((resolve) => {
                    const img = new Image();
                    img.src = src;
                    img.onload = () => {
                        loadedAssets[key] = img;
                        resolve();
                    };
                    img.onerror = () => {
                        console.warn(`Failed to load asset: ${src}`);
                        loadedAssets[key] = null; // Fallback
                        resolve();
                    };
                });
            });

            await Promise.all(promises);
            setAssets(loadedAssets);
            setLoaded(true);
        };

        load();
    }, []);

    return { assets, loaded };
}
