import { useState, useEffect } from 'react';

// Define the assets we need to load
const ASSETS = {
    'TREE_1': '/images/new_assets/photo_08.jpg', // Using photo for tree? Maybe use simple tree for now or find better asset
    // Ideally we'd use a transparent PNG for trees. For now, let's use placeholders OR mapped images.
    // The user provided lots of photos. "photo_08.jpg" is likely a scene.
    // Let's stick to using the LANDMARKS primarily for the new assets.

    // Landmarks
    'LANDMARK_ROCK': '/images/new_assets/easton-profile-1.jpg', // Placeholder for The Rock
    'LANDMARK_LODGE': '/images/new_assets/easton-ski-hill-a.jpg', // Placeholder for Lodge
    'ICE': '/images/new_assets/easton-map-2017.jpg', // Just using map as texture? No, stick to drawing ice.

    // Sprites (if we had them, defaulting to null to force fallback drawing)
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
