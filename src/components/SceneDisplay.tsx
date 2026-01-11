"use client";

import { LocationId } from '../lib/types';
import { LOCATIONS } from '../lib/gameData';
import { MapPin } from 'lucide-react';

interface SceneDisplayProps {
    locationId: LocationId;
    locationName: string;
}

const LOCATION_STYLES: Record<LocationId, string> = {
    'DORM_ROOM': 'bg-gradient-to-b from-slate-800 to-slate-900',
    'SKI_LODGE': 'bg-gradient-to-b from-orange-950 to-slate-900',
    'THE_ROCK': 'bg-gradient-to-b from-slate-700 to-slate-900',
    'EAGLE_HILL_SUMMIT': 'bg-gradient-to-b from-slate-200 to-slate-400',
    'FROZEN_POND': 'bg-gradient-to-b from-cyan-950 to-slate-900',
    'OLD_EQUIPMENT_SHED': 'bg-gradient-to-b from-stone-900 to-black',
};

export function SceneDisplay({ locationId, locationName }: SceneDisplayProps) {
    const bgClass = LOCATION_STYLES[locationId] || 'bg-slate-900';
    const imageUrl = LOCATIONS[locationId]?.image;

    return (
        <div className={`w-full h-64 md:h-80 relative overflow-hidden transition-colors duration-1000 ${bgClass}`}>
            {/* Image Background */}
            {imageUrl && (
                <div
                    className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 animate-fade-in"
                    style={{ backgroundImage: `url(${imageUrl})`, opacity: 0.8 }}
                />
            )}

            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/20 to-slate-950/90 pointer-events-none"></div>

            {/* Location Label Badge */}
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm border border-white/10 px-3 py-1.5 rounded flex items-center gap-2 text-white shadow-lg z-10">
                <MapPin className="w-4 h-4 text-crimson" />
                <span className="text-xs font-bold tracking-wider uppercase">{locationName}</span>
            </div>
        </div>
    );
}
