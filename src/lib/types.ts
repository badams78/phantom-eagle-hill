export type LocationId =
    | 'DORM_ROOM'
    | 'SKI_LODGE'
    | 'THE_ROCK'
    | 'EAGLE_HILL_SUMMIT'
    | 'FROZEN_POND'
    | 'OLD_EQUIPMENT_SHED';

export type ItemId =
    | 'SKI_GOGGLES'
    | 'TORN_FABRIC'
    | 'SHED_KEY'
    | 'BOOT_PRINT_PHOTO'
    | 'CARDIGAN_SKI_PASS'
    | 'CLIPBOARD_PAGE'
    | 'EAGLE_TROPHY';

export type SuspectId =
    | 'MARCUS_CHEN'
    | 'COACH_THORNTON'
    | 'JAKE_MORRISON';

export interface Item {
    id: ItemId;
    name: string;
    description: string;
    icon: string; // Lucide icon name
    clueFor?: SuspectId;
}

export interface Choice {
    text: string;
    nextLocation?: LocationId;
    action?: () => void; // Logic hook if needed
    lockedMessage?: string; // If trying to take an action but locked
}

export interface Location {
    id: LocationId;
    name: string;
    description: string;
    image: string; // Placeholder or actual path
    choices: Choice[];
    itemsFound?: ItemId[]; // Items that can be found here
    isLocked?: boolean;
    requiredItem?: ItemId;
    lockedMessage?: string;
}

export interface GameState {
    currentLocation: LocationId;
    inventory: ItemId[];
    cluesFound: number;
    suspectEvidence: Record<SuspectId, number>;
    gameComplete: boolean;
    accusation: SuspectId | null;
    hasSeenIntro: boolean; // Just in case we want an intro screen
}
