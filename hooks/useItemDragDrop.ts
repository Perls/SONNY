import React, { useState, useCallback } from 'react';
import { GameState, InventoryItem } from '../types';
import { ITEMS } from '../constants';

export type ContainerType = 'player' | 'safe' | 'storage';

interface UseItemDragDropProps {
    gameState: GameState | null;
    updateSave: (newState: GameState) => void;
    triggerFeedback: (msg: string, type: 'success' | 'error') => void;
}

export const useItemDragDrop = ({ gameState, updateSave, triggerFeedback }: UseItemDragDropProps) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragStart = (e: React.DragEvent, item: InventoryItem, source: ContainerType) => {
        setIsDragging(true);
        // Serialize data to transfer
        e.dataTransfer.setData('application/json', JSON.stringify({ itemId: item.id, source }));
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragEnd = () => {
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault(); // Necessary to allow dropping
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = useCallback((e: React.DragEvent, destination: ContainerType) => {
        e.preventDefault();
        setIsDragging(false);

        if (!gameState || !gameState.playerHousing) return;

        const dataStr = e.dataTransfer.getData('application/json');
        if (!dataStr) return;

        const { itemId, source } = JSON.parse(dataStr) as { itemId: string, source: ContainerType };

        // Prevent dropping into the same container
        if (source === destination) return;

        // 1. Get Source and Dest Arrays
        const getContainerArray = (type: ContainerType): InventoryItem[] => {
            if (type === 'player') return gameState.inventory;
            if (type === 'safe') return gameState.playerHousing!.inventory || [];
            if (type === 'storage') return gameState.playerHousing!.storage || [];
            return [];
        };

        const sourceList = [...getContainerArray(source)];
        const destList = [...getContainerArray(destination)];

        // 2. Find Item
        const itemIndex = sourceList.findIndex(i => i.id === itemId);
        if (itemIndex === -1) return;
        const itemToMove = sourceList[itemIndex];

        // 3. Check Capacity
        const limits: Record<ContainerType, number> = { player: 20, safe: 5, storage: 10 };
        // If stacking, we don't need a new slot, otherwise we do
        const existingStack = destList.find(i => i.itemId === itemToMove.itemId);
        
        if (!existingStack && destList.length >= limits[destination]) {
            triggerFeedback(`Destination full! (Max ${limits[destination]})`, 'error');
            return;
        }

        // 4. Perform Move (Stacking Logic)
        // Remove from source
        sourceList.splice(itemIndex, 1);

        // Add to dest
        if (existingStack) {
            existingStack.quantity += itemToMove.quantity;
        } else {
            destList.push(itemToMove);
        }

        // 5. Update State
        const itemName = ITEMS[itemToMove.itemId]?.name || 'Item';
        
        const newHousing = { ...gameState.playerHousing };
        
        // Map back to specific properties based on type
        if (source === 'safe') newHousing.inventory = sourceList;
        if (source === 'storage') newHousing.storage = sourceList;
        if (destination === 'safe') newHousing.inventory = destList;
        if (destination === 'storage') newHousing.storage = destList;

        let newPlayerInv = gameState.inventory;
        if (source === 'player') newPlayerInv = sourceList;
        if (destination === 'player') newPlayerInv = destList;

        updateSave({
            ...gameState,
            inventory: newPlayerInv,
            playerHousing: newHousing
        });

        triggerFeedback(`Moved ${itemName}`, 'success');

    }, [gameState, updateSave, triggerFeedback]);

    return {
        isDragging,
        handleDragStart,
        handleDragEnd,
        handleDragOver,
        handleDrop
    };
};