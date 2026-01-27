
import { useCallback } from 'react';
import { GameState, CrewMember, InventoryItem, Equipment, Stats } from '../types';
import { ITEMS, TRAITS } from '../constants';

interface UseItemSystemProps {
    gameState: GameState | null;
    updateSave: (newState: GameState) => void;
    triggerConsigliere: (msg: string) => void;
}

export const CRAFTING_RECIPES = [
    { inputs: ['vodka_coke', 'bandages'], result: 'medkit', label: 'Sterilized Kit' },
    { inputs: ['vodka_coke', 'painkillers'], result: 'stimpack', label: 'Combat Stim' },
    { inputs: ['bat', 'knife'], result: 'brass_knuckles', label: 'Spiked Knuckles' },
    { inputs: ['burner', 'pager'], result: 'brick_phone', label: 'Tech Bash' },
    { inputs: ['weed', 'vodka_coke'], result: 'coke', label: 'Party Mix' }, // Nonsense recipe for fun
];

export const useItemSystem = ({ gameState, updateSave, triggerConsigliere }: UseItemSystemProps) => {

    const handleUseItem = useCallback((memberId: string, itemId: string) => {
        if (!gameState) return;

        const itemDef = ITEMS[itemId];
        if (!itemDef) return;

        // 1. Find Member and Inventory Item
        const memberIndex = gameState.crew.findIndex(c => c.id === memberId);
        if (memberIndex === -1) return;
        const member = gameState.crew[memberIndex];

        const invItemIndex = gameState.inventory.findIndex(i => i.itemId === itemId);
        if (invItemIndex === -1) return;

        let newState = { ...gameState };
        let consumed = false;
        let message = "";

        // 2. Apply Effects based on Item ID
        const newCrew = [...newState.crew];
        const updatedMember = { ...member };

        const addTrait = (traitId: string) => {
            // Remove existing if present to refresh/reset
            const traits = updatedMember.traits.filter(t => t.id !== traitId);
            traits.push({ id: traitId, rank: 1 });
            updatedMember.traits = traits;
        };

        const incrementDrugUse = () => {
            updatedMember.drugUsage = (updatedMember.drugUsage || 0) + 1;
        };

        switch (itemId) {
            case 'medkit':
                const maxHp = updatedMember.stats.maxHp || (20 + updatedMember.stats.strength * 3);
                const healAmount = 50;
                updatedMember.hp = Math.min(maxHp, (updatedMember.hp || 0) + healAmount);
                message = `${member.name} patched up. (+${healAmount} HP)`;
                consumed = true;
                break;

            case 'vodka_coke':
                newState.currentEnergy = Math.min(50, newState.currentEnergy + 15);
                // Also add 'drunk' buff logic if not present
                if (!updatedMember.traits.some(t => t.id === 'drunk')) {
                    updatedMember.traits = [...updatedMember.traits, { id: 'drunk', rank: 1 }];
                }
                message = "Energy restored. Feeling loose.";
                consumed = true;
                break;
            
            case 'stimpack':
                // Add 'high' buff
                if (!updatedMember.traits.some(t => t.id === 'high')) {
                    updatedMember.traits = [...updatedMember.traits, { id: 'high', rank: 1 }];
                    message = `${member.name} is stimulated! (+AGI, +LCK)`;
                } else {
                    message = `${member.name} is already high.`;
                }
                consumed = true;
                break;

            case 'coke':
                addTrait('high_coke');
                incrementDrugUse();
                updatedMember.stress = Math.max(0, (updatedMember.stress || 0) - 20);
                message = `${member.name} is riding the white horse. Stress down, Confidence up.`;
                consumed = true;
                break;

            case 'weed':
                addTrait('high_weed');
                incrementDrugUse();
                updatedMember.stress = Math.max(0, (updatedMember.stress || 0) - 40);
                message = `${member.name} is in the clouds. Major Stress relief.`;
                consumed = true;
                break;

            case 'meth':
                addTrait('high_meth');
                incrementDrugUse();
                updatedMember.stress = Math.max(0, (updatedMember.stress || 0) - 10);
                message = `${member.name} is wired tight. Physical boost, Mental decline.`;
                consumed = true;
                break;
            
            case 'hot_coffee':
                // Restore Energy
                newState.currentEnergy = Math.min(50, newState.currentEnergy + 10);
                
                // Add Caffeinated Buff (Non-stacking logic)
                if (!updatedMember.traits.some(t => t.id === 'caffeinated')) {
                    updatedMember.traits = [...updatedMember.traits, { id: 'caffeinated', rank: 1 }];
                }
                
                message = `${member.name} feels sharp. (+1 INT, +10 Energy)`;
                consumed = true;
                break;

            default:
                message = "You can't use that right now.";
                consumed = false;
                break;
        }

        // 3. Consume Item if used
        if (consumed) {
            newCrew[memberIndex] = updatedMember;
            
            const newInventory = [...newState.inventory];
            if (newInventory[invItemIndex].quantity > 1) {
                newInventory[invItemIndex] = { ...newInventory[invItemIndex], quantity: newInventory[invItemIndex].quantity - 1 };
            } else {
                newInventory.splice(invItemIndex, 1);
            }

            newState.crew = newCrew;
            newState.inventory = newInventory;
            
            updateSave(newState);
            triggerConsigliere(message);
        }

    }, [gameState, updateSave, triggerConsigliere]);

    const handleEquipItem = useCallback((memberId: string, item: InventoryItem) => {
        if (!gameState) return;
        
        const itemDef = ITEMS[item.itemId];
        if (!itemDef || !itemDef.equipSlot) return;
        
        const slot = itemDef.equipSlot;
        const memberIndex = gameState.crew.findIndex(c => c.id === memberId);
        if (memberIndex === -1) return;
        
        const member = gameState.crew[memberIndex];
        const currentEquipment = member.equipment || {};
        const equippedItemId = currentEquipment[slot];
        
        let newInventory = [...gameState.inventory];
        
        // Remove item being equipped from inventory
        const invItemIndex = newInventory.findIndex(i => i.id === item.id);
        if (invItemIndex > -1) {
            if (newInventory[invItemIndex].quantity > 1) {
                newInventory[invItemIndex] = { ...newInventory[invItemIndex], quantity: newInventory[invItemIndex].quantity - 1 };
            } else {
                newInventory.splice(invItemIndex, 1);
            }
        }
        
        // Return currently equipped item to inventory
        if (equippedItemId) {
            const existingInvItemIndex = newInventory.findIndex(i => i.itemId === equippedItemId);
            if (existingInvItemIndex > -1) {
                newInventory[existingInvItemIndex] = { ...newInventory[existingInvItemIndex], quantity: newInventory[existingInvItemIndex].quantity + 1 };
            } else {
                newInventory.push({ id: Math.random().toString(), itemId: equippedItemId, quantity: 1 });
            }
        }
        
        const newEquipment = { ...currentEquipment, [slot]: item.itemId };
        const updatedCrew = [...gameState.crew];
        updatedCrew[memberIndex] = { ...member, equipment: newEquipment };
        
        updateSave({ ...gameState, crew: updatedCrew, inventory: newInventory });
    }, [gameState, updateSave]);

    const handleUnequipItem = useCallback((memberId: string, slot: keyof Equipment) => {
        if (!gameState) return;
        
        const memberIndex = gameState.crew.findIndex(c => c.id === memberId);
        if (memberIndex === -1) return;
        
        const member = gameState.crew[memberIndex];
        const currentEquipment = member.equipment || {};
        const itemId = currentEquipment[slot];
        
        if (!itemId) return;
        
        let newInventory = [...gameState.inventory];
        const existingInvItemIndex = newInventory.findIndex(i => i.itemId === itemId);
        
        if (existingInvItemIndex > -1) {
            newInventory[existingInvItemIndex] = { ...newInventory[existingInvItemIndex], quantity: newInventory[existingInvItemIndex].quantity + 1 };
        } else {
            newInventory.push({ id: Math.random().toString(), itemId: itemId, quantity: 1 });
        }
        
        const newEquipment = { ...currentEquipment };
        delete newEquipment[slot];
        
        const updatedCrew = [...gameState.crew];
        updatedCrew[memberIndex] = { ...member, equipment: newEquipment };
        
        updateSave({ ...gameState, crew: updatedCrew, inventory: newInventory });
    }, [gameState, updateSave]);

    const handleCraft = useCallback((ingredients: string[]) => {
        if (!gameState) return;
        
        // Find matching recipe
        // We match by itemId, but ingredients passed here are InventoryItem IDs (unique)
        // We need to resolve them to itemId first
        const resolvedIngredients = ingredients.map(id => {
            const invItem = gameState.inventory.find(i => i.id === id);
            return invItem ? invItem.itemId : null;
        }).filter(id => id !== null) as string[];

        // Check against recipes
        const recipe = CRAFTING_RECIPES.find(r => {
            if (r.inputs.length !== resolvedIngredients.length) return false;
            // Simple sort check
            const rSorted = [...r.inputs].sort();
            const iSorted = [...resolvedIngredients].sort();
            return rSorted.every((val, idx) => val === iSorted[idx]);
        });

        if (!recipe) {
            triggerConsigliere("That combination produces nothing but garbage.");
            return false;
        }

        // Consume Ingredients
        let newInventory = [...gameState.inventory];
        ingredients.forEach(invId => {
             const idx = newInventory.findIndex(i => i.id === invId);
             if (idx > -1) {
                 if (newInventory[idx].quantity > 1) {
                     newInventory[idx] = { ...newInventory[idx], quantity: newInventory[idx].quantity - 1 };
                 } else {
                     newInventory.splice(idx, 1);
                 }
             }
        });

        // Add Result
        const existingResult = newInventory.find(i => i.itemId === recipe.result);
        if (existingResult) {
            existingResult.quantity += 1;
        } else {
            newInventory.push({ id: Math.random().toString(), itemId: recipe.result, quantity: 1 });
        }

        updateSave({ ...gameState, inventory: newInventory });
        triggerConsigliere(`Crafted ${recipe.label}!`);
        return true;

    }, [gameState, updateSave, triggerConsigliere]);

    return {
        handleUseItem,
        handleEquipItem,
        handleUnequipItem,
        handleCraft
    };
};
