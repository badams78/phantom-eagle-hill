"use client";

import { useState } from 'react';
import { ItemId, Item } from '../lib/types'; // Assuming types export Item
import { ITEMS } from '../lib/gameData';
import { Backpack, ChevronRight, ChevronLeft } from 'lucide-react';
import * as Icons from 'lucide-react';

interface InventorySidebarProps {
    inventory: ItemId[];
}

export function InventorySidebar({ inventory }: InventorySidebarProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div
            className={`absolute top-0 right-0 h-full bg-slate-950 border-l border-slate-800 transition-all duration-300 z-20 ${isOpen ? 'w-64' : 'w-12'} flex flex-col`}
        >
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-3 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors self-start w-full flex justify-center"
            >
                {isOpen ? <ChevronRight /> : <Backpack />}
            </button>

            {isOpen && (
                <div className="p-4 flex-1 overflow-y-auto">
                    <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Inventory</h2>

                    {inventory.length === 0 ? (
                        <p className="text-slate-600 italic text-sm">Your pockets are empty.</p>
                    ) : (
                        <div className="space-y-4">
                            {inventory.map(itemId => {
                                const item = ITEMS[itemId];
                                // Dynamic Icon selection
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                const IconComponent = (Icons as any)[item.icon] || Icons.HelpCircle;

                                return (
                                    <div key={itemId} className="bg-slate-900 border border-slate-800 p-3 rounded group hover:border-crimson/50 transition-colors">
                                        <div className="flex items-center gap-3 mb-2">
                                            <IconComponent className="w-5 h-5 text-indigo-400 group-hover:text-crimson transition-colors" />
                                            <span className="text-slate-200 font-medium text-sm">{item.name}</span>
                                        </div>
                                        <p className="text-xs text-slate-500 leading-relaxed">{item.description}</p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
