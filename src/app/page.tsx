"use client";

import { useEffect, useState } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { GameContainer } from '@/components/GameContainer';
import { SceneDisplay } from '@/components/SceneDisplay';
import { TypewriterText } from '@/components/TypewriterText';
import { ChoicePanel } from '@/components/ChoicePanel';
import { InventorySidebar } from '@/components/InventorySidebar';
import { VictoryModal } from '@/components/VictoryModal';
import { LOCATIONS, SUSPECTS, ITEMS } from '@/lib/gameData';
import { Choice, SuspectId } from '@/lib/types';
import { AlertCircle } from 'lucide-react';

export default function Home() {
  const { gameState, moveTo, pickUpItem, makeAccusation, resetGame, isLoaded } = useGameState();
  const [message, setMessage] = useState<string | null>(null);
  const [showAccusation, setShowAccusation] = useState(false);

  // Load location data
  const currentLocation = LOCATIONS[gameState.currentLocation];

  // Handle Item Finding
  useEffect(() => {
    if (!isLoaded || !currentLocation) return; // Added check for currentLocation safety

    if (currentLocation.itemsFound) {
      currentLocation.itemsFound.forEach(itemId => {
        if (!gameState.inventory.includes(itemId)) {
          pickUpItem(itemId);
          setMessage(`You found: ${ITEMS[itemId].name}!`);
          // Clear message after a delay
          setTimeout(() => setMessage(null), 4000);
        }
      });
    }

    // Special logic for shedding - trigger accusation mode
    if (gameState.currentLocation === 'OLD_EQUIPMENT_SHED') {
      setShowAccusation(true);
    } else {
      setShowAccusation(false);
    }
  }, [gameState.currentLocation, gameState.inventory, isLoaded, currentLocation, pickUpItem]);

  if (!isLoaded) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500">Loading...</div>;
  if (!currentLocation) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-red-500">Error: Unknown Location</div>;

  const handleChoice = (choice: Choice) => {
    setMessage(null);
    if (choice.nextLocation) {
      const result = moveTo(choice.nextLocation);
      if (!result.success) {
        setMessage(result.message || "You can't go there yet.");
      }
    }
  };

  const handleAccusation = (suspectId: SuspectId) => {
    const success = makeAccusation(suspectId);
    if (!success) {
      setMessage("That doesn't seem right. Review your evidence and try again.");
    }
  };

  // Generate choices
  let currentChoices: Choice[] = [];

  if (showAccusation) {
    // Generate accusation choices
    currentChoices = Object.keys(SUSPECTS).map(key => ({
      text: `Accuse ${SUSPECTS[key as SuspectId].name}`,
      action: () => handleAccusation(key as SuspectId)
    }));
  } else {
    currentChoices = currentLocation.choices;
  }

  // Wrapper for choice click to handle actions vs nav
  const onChoiceClick = (choice: Choice) => {
    if (choice.action) {
      choice.action();
    } else {
      handleChoice(choice);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 font-sans selection:bg-crimson selection:text-white">
      <GameContainer>
        {gameState.gameComplete && gameState.accusation && (
          <VictoryModal
            suspectName={SUSPECTS[gameState.accusation].name}
            onPlayAgain={resetGame}
          />
        )}

        <InventorySidebar inventory={gameState.inventory} />

        <SceneDisplay
          locationId={gameState.currentLocation}
          locationName={currentLocation.name}
        />

        <div className="flex-1 flex flex-col p-6 md:p-8 relative">

          {/* Message Toast */}
          {message && (
            <div className="absolute top-0 left-0 w-full flex justify-center -mt-4 animate-fade-in z-10">
              <div className="bg-crimson/90 text-white px-4 py-2 rounded shadow-lg flex items-center gap-2 text-sm border border-red-400/20 backdrop-blur-md">
                <AlertCircle className="w-4 h-4" />
                {message}
              </div>
            </div>
          )}

          <div className="mb-6 space-y-4">
            <TypewriterText
              key={gameState.currentLocation} // Remount to restart effect on location change
              text={currentLocation.description}
              className="text-slate-300 text-lg md:text-xl leading-relaxed"
              speed={20}
            />

            {showAccusation && (
              <p className="text-yellow-400/90 text-base border-l-2 border-yellow-500 pl-4 italic animate-pulse">
                The Trophy is here! You have collected all the evidence. Who stole the Eagle Trophy?
              </p>
            )}
          </div>

          <ChoicePanel
            choices={currentChoices}
            onChoose={onChoiceClick}
          />
        </div>
      </GameContainer>
    </main>
  );
}
