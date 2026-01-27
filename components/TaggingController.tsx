
import React, { useEffect } from 'react';
import { GameState } from '../types';

interface TaggingControllerProps {
    gameState: GameState | null;
    activeSaveId: string | null;
    updateSave: (state: GameState) => void;
    triggerConsigliere: (message: string) => void;
}

const TaggingController: React.FC<TaggingControllerProps> = ({ gameState, activeSaveId, updateSave, triggerConsigliere }) => {
    // --- TAGGING LOGIC LOOP ---
    useEffect(() => {
        if (!gameState || !gameState.activeTaggingOps || gameState.activeTaggingOps.length === 0) return;

        const timer = setInterval(() => {
            const now = Date.now();
            const finishedOps = gameState.activeTaggingOps!.filter(op => now >= op.startTime + op.duration);
            
            if (finishedOps.length > 0) {
                const newMapTags = { ...gameState.mapTags };
                finishedOps.forEach(op => {
                    if (op.tagId === 'erase') {
                        // Special ID for Erase Operations
                        delete newMapTags[`${op.x},${op.y},${op.slotIndex}`];
                    } else {
                        const tag = gameState.tags?.find(t => t.id === op.tagId);
                        if (tag) {
                            newMapTags[`${op.x},${op.y},${op.slotIndex}`] = tag;
                        }
                    }
                });

                const remainingOps = gameState.activeTaggingOps!.filter(op => now < op.startTime + op.duration);
                
                updateSave({
                    ...gameState,
                    activeTaggingOps: remainingOps,
                    mapTags: newMapTags,
                    respect: gameState.respect + (finishedOps.length * 1) // +1 Respect per tag
                });
                
                const isErase = finishedOps[0].tagId === 'erase';
                triggerConsigliere(`${isErase ? 'Clean up' : 'Tagging'} complete on Block ${finishedOps[0].x}-${finishedOps[0].y}. Respect increased.`);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [gameState, activeSaveId, updateSave, triggerConsigliere]);

    return null; // Logic only
};

export default TaggingController;
