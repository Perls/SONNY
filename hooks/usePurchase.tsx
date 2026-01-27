
import { useCallback } from 'react';
import { GameState } from '../types';

interface UsePurchaseProps {
    gameState: GameState | null;
    updateSave: (newState: GameState) => void;
}

export const usePurchase = ({ gameState, updateSave }: UsePurchaseProps) => {
    
    const handleNightclubAction = useCallback((action: string, cost: number) => {
        if (!gameState) return;
        if (gameState.money < cost) {
            alert("Insufficient funds!");
            return;
        }

        let newMoney = gameState.money - cost;
        let newCrew = [...gameState.crew];
        let newInventory = [...gameState.inventory];
        let newRespect = gameState.respect;

        const leaderIndex = newCrew.findIndex(c => c.isLeader);
        
        if (action === 'buy_drink' && leaderIndex > -1) {
            // Add 'drunk' trait/buff
            // Filter out existing drunk buff to refresh or stack? Just replace for simplicity or add if not present
            const hasDrunk = newCrew[leaderIndex].traits.some(t => t.id === 'drunk');
            if (!hasDrunk) {
                newCrew[leaderIndex] = {
                    ...newCrew[leaderIndex],
                    traits: [...newCrew[leaderIndex].traits, { id: 'drunk', rank: 1 }]
                };
            }
        } else if (action === 'buy_coke' && leaderIndex > -1) {
            // Add 'high' trait/buff
            const hasHigh = newCrew[leaderIndex].traits.some(t => t.id === 'high');
            if (!hasHigh) {
                newCrew[leaderIndex] = {
                    ...newCrew[leaderIndex],
                    traits: [...newCrew[leaderIndex].traits, { id: 'high', rank: 1 }]
                };
            }
        } else if (action === 'buy_round') {
            // Add Vodka Coke to inventory x Crew Size
            const count = gameState.crew.length;
            const existingItemIndex = newInventory.findIndex(i => i.itemId === 'vodka_coke');
            if (existingItemIndex > -1) {
                newInventory[existingItemIndex] = { 
                    ...newInventory[existingItemIndex], 
                    quantity: newInventory[existingItemIndex].quantity + count 
                };
            } else {
                newInventory.push({ 
                    id: Math.random().toString(), 
                    itemId: 'vodka_coke', 
                    quantity: count 
                });
            }
            newRespect += 2;
        } else if (action === 'buy_vip') {
            newRespect += 10;
        }

        updateSave({
            ...gameState,
            money: newMoney,
            crew: newCrew,
            inventory: newInventory,
            respect: newRespect
        });
    }, [gameState, updateSave]);

    return {
        handleNightclubAction
    };
};
