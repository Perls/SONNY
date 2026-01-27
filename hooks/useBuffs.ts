
import { useCallback } from 'react';
import { GameState } from '../types';
import { TRAITS } from '../constants';

interface UseBuffsProps {
    gameState: GameState | null;
    updateSave: (newState: GameState) => void;
    triggerConsigliere: (msg: string) => void;
}

export const useBuffs = ({ gameState, updateSave, triggerConsigliere }: UseBuffsProps) => {
    const handleApplyBuff = useCallback((memberId: string, buffId: string) => {
        if (!gameState) return;
        
        const memberIndex = gameState.crew.findIndex(c => c.id === memberId);
        if (memberIndex === -1) return;
        
        const member = gameState.crew[memberIndex];
        const buffDef = TRAITS.find(t => t.id === buffId);
        
        if (!buffDef) return;

        // Check if already has buff
        if (member.traits.some(t => t.id === buffId)) {
             // Refresh duration or just notify? For now just notify/ignore
             if (buffId === 'blessed') {
                 // Special case for Church: Bless also reduces heat even if already applied
                 updateSave({ 
                    ...gameState, 
                    heat: Math.max(0, gameState.heat - 10) 
                 });
                 triggerConsigliere("Heat reduced. You remain Blessed.");
             }
             return;
        }

        const newTraits = [...member.traits, { id: buffId, rank: 1 }];
        const updatedCrew = [...gameState.crew];
        updatedCrew[memberIndex] = { ...member, traits: newTraits };
        
        let newHeat = gameState.heat;
        if (buffId === 'blessed') {
            newHeat = Math.max(0, newHeat - 15);
        }
        
        updateSave({ ...gameState, crew: updatedCrew, heat: newHeat });
        triggerConsigliere(`${member.name} gained ${buffDef.label}.`);

    }, [gameState, updateSave, triggerConsigliere]);

    return { handleApplyBuff };
};
