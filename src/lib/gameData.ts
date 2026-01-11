import { GameState, Item, Location, ItemId, LocationId, SuspectId } from './types';

export const INITIAL_STATE: GameState = {
    currentLocation: 'DORM_ROOM',
    inventory: [],
    cluesFound: 0,
    suspectEvidence: {
        'MARCUS_CHEN': 0,
        'COACH_THORNTON': 0,
        'JAKE_MORRISON': 0,
    },
    gameComplete: false,
    accusation: null,
    hasSeenIntro: false,
};

export const ITEMS: Record<ItemId, Item> = {
    'SKI_GOGGLES': {
        id: 'SKI_GOGGLES',
        name: 'Ski Goggles',
        description: 'Professional grade. Essential for high altitude visibility.',
        icon: 'Glasses',
    },
    'TORN_FABRIC': {
        id: 'TORN_FABRIC',
        name: 'Torn Crimson Fabric',
        description: 'A piece of an old Eaglebrook jacket.',
        icon: 'Scissors', // Approximation for torn fabric
        clueFor: 'JAKE_MORRISON',
    },
    'SHED_KEY': {
        id: 'SHED_KEY',
        name: 'Shed Key',
        description: 'Rusted iron key.',
        icon: 'Key',
    },
    'BOOT_PRINT_PHOTO': {
        id: 'BOOT_PRINT_PHOTO',
        name: 'Boot Print Photo',
        description: 'Photo of an unusual tread pattern found near The Rock.',
        icon: 'Camera',
        clueFor: 'COACH_THORNTON', // Just an assumption based on "Tred" fitting a coach maybe? Or generic. 
        // Wait, the prompt said "Boot Print Photo (unusual tread pattern)". 
        // Prompt check: "Cardigan Ski Pass" -> Marcus. "Clipboard Page" -> Coach. "Torn Crimson Fabric" -> Jake.
        // Boot print is found at The Rock. It doesn't explicitly link to a suspect in the "Three Suspects" section directly, 
        // but typically it must link. 
        // Re-reading logic: 
        // 3. The Rock -> Find "Shed Key" hidden... Also find "Boot Print Photo" (unusual tread pattern)
        // 
        // Let's re-read "The Three Suspects":
        // 1. Marcus Chen - Cardigan student
        // 2. Coach Thornton - Cardigan ski coach
        // 3. Jake Morrison - Former Eaglebrook student
        //
        // Clue mapping specified:
        // - Torn Crimson Fabric -> Jake
        // - Cardigan Ski Pass -> Marcus
        // - Clipboard Page -> Coach
        // - Boot Print Photo -> ??? Not explicitly mapped in prompt summaries. 
        //   I will leave it as a general clue or map it to the Coach as well if he has big boots? 
        //   Actually, let's map it to Marcus (sneaking around). Or maybe it's just general evidence.
        //   Let's map it to NONE for now, or just generic clue point.
        //   Actually, let's make it a Clue for Marcus, as he "snuck onto campus".
    },
    'CARDIGAN_SKI_PASS': {
        id: 'CARDIGAN_SKI_PASS',
        name: 'Cardigan Ski Pass',
        description: 'A visitor pass for a rival school student.',
        icon: 'Ticket',
        clueFor: 'MARCUS_CHEN',
    },
    'CLIPBOARD_PAGE': {
        id: 'CLIPBOARD_PAGE',
        name: 'Clipboard Page',
        description: 'Notes on race strategy and sabotage.',
        icon: 'Clipboard',
        clueFor: 'COACH_THORNTON',
    },
    'EAGLE_TROPHY': {
        id: 'EAGLE_TROPHY',
        name: 'The Eagle Trophy',
        description: 'The golden eagle statue, shining in the cold light.',
        icon: 'Trophy',
    },
};

export const LOCATIONS: Record<LocationId, Omit<Location, 'choices'> & { choices: any[] }> = { // choices dynamic handling in component or here with simplified structure
    'DORM_ROOM': {
        id: 'DORM_ROOM',
        name: 'Dorm Room',
        description: 'Your room is quiet. The radiator hisses. Outside, the wind howls against the window.',
        image: '/images/dorm-room.jpg',
        itemsFound: ['SKI_GOGGLES'],
        choices: [
            { text: 'Go to Ski Lodge', nextLocation: 'SKI_LODGE' },
            { text: 'Go to The Rock', nextLocation: 'THE_ROCK' },
        ]
    },
    'SKI_LODGE': {
        id: 'SKI_LODGE',
        name: 'Ski Lodge',
        description: 'The fire is dying out. Shadows dance on the walls. A locker stands ajar in the corner.',
        image: '/images/ski-lodge.jpg',
        itemsFound: ['TORN_FABRIC'],
        choices: [
            { text: 'Return to Dorm Room', nextLocation: 'DORM_ROOM' },
            { text: 'Go to The Rock', nextLocation: 'THE_ROCK' },
            { text: 'Go to Frozen Pond', nextLocation: 'FROZEN_POND' },
        ]
    },
    'THE_ROCK': {
        id: 'THE_ROCK',
        name: 'The Rock',
        description: 'A massive boulder overlooking the campus. A common meeting spot. The snow is disturbed here.',
        image: '/images/the-rock.jpg',
        itemsFound: ['SHED_KEY', 'BOOT_PRINT_PHOTO'],
        choices: [
            { text: 'Go to Dorm Room', nextLocation: 'DORM_ROOM' },
            { text: 'Climb Eagle Hill Summit', nextLocation: 'EAGLE_HILL_SUMMIT' },
            { text: 'Go to Ski Lodge', nextLocation: 'SKI_LODGE' },
        ]
    },
    'EAGLE_HILL_SUMMIT': {
        id: 'EAGLE_HILL_SUMMIT',
        name: 'Eagle Hill Summit',
        description: 'The peak of the mountain. The air is thin and biting. Tracks lead towards the cliff edge.',
        image: '/images/summit.jpg', // Placeholder
        isLocked: true,
        requiredItem: 'SKI_GOGGLES',
        lockedMessage: 'The wind and snow are blinding! You need eye protection to proceed safely up the mountain.',
        itemsFound: ['CARDIGAN_SKI_PASS'],
        choices: [
            { text: 'Descend to The Rock', nextLocation: 'THE_ROCK' },
            { text: 'Follow tracks to Frozen Pond', nextLocation: 'FROZEN_POND' },
        ]
    },
    'FROZEN_POND': {
        id: 'FROZEN_POND',
        name: 'Frozen Pond',
        description: 'The lake is a sheet of ice. In the center, something flutters in the wind, caught in the frozen surface.',
        image: '/images/pond.jpg',
        itemsFound: ['CLIPBOARD_PAGE'],
        choices: [
            { text: 'Go to Ski Lodge', nextLocation: 'SKI_LODGE' },
            { text: 'Go to Old Equipment Shed', nextLocation: 'OLD_EQUIPMENT_SHED' },
        ]
    },
    'OLD_EQUIPMENT_SHED': {
        id: 'OLD_EQUIPMENT_SHED',
        name: 'Old Equipment Shed',
        description: 'A run-down shack near the edge of the woods. The door is reinforced iron.',
        image: '/images/shed.jpg',
        isLocked: true,
        requiredItem: 'SHED_KEY',
        lockedMessage: 'The door is locked tight. It looks like it needs an old iron key.',
        itemsFound: ['EAGLE_TROPHY'], // Trophy is here!
        choices: [
            // Handled specially to trigger accusation
        ]
    }
};

export const SUSPECTS: Record<SuspectId, { name: string; description: string }> = {
    'MARCUS_CHEN': {
        name: 'Marcus Chen',
        description: 'A Cardigan student who snuck onto campus.',
    },
    'COACH_THORNTON': {
        name: 'Coach Thornton',
        description: 'The Cardigan ski coach, tired of losing.',
    },
    'JAKE_MORRISON': {
        name: 'Jake Morrison',
        description: 'Former Eaglebrook student who transferred to Cardigan.',
    }
};
