
import React from 'react';
import DraggableWindow from './DraggableWindow';
import TacticsScreen from './TacticsScreen';
import { GameState, PawnRole } from '../types';
import { useGameEngine } from '../contexts/GameEngineContext';

interface CombatOperationsProps {
    gameState: GameState;
    onClose: () => void;
    onUpdateTactics: (type: 'offensive' | 'defensive', tacticId: string) => void;
    onUpdateTalents: (memberId: string, talentId: string, operation?: 'add' | 'remove' | 'reset') => void;
    onUpdateFormation: (formation: Record<string, {x: number, y: number}>) => void;
    onPromotePawn: (memberId: string, newRole: PawnRole) => void;
    onUpdateRetreatThreshold: (val: number) => void;
    onToggleAbility: (abilityId: string) => void;
}

const CombatOperations: React.FC<CombatOperationsProps> = ({ 
    gameState, 
    onClose, 
    onUpdateTactics,
    onUpdateTalents,
    onUpdateFormation,
    onPromotePawn,
    onUpdateRetreatThreshold,
    onToggleAbility
}) => {
    const { handleUpdateLoadout, handleUpdateCombatPreferences } = useGameEngine();

    // Calculate center x for 1100px width
    const winWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const initialX = Math.max(0, (winWidth - 1100) / 2);

    return (
        <DraggableWindow 
            title="Combat" 
            subtitle="Tactics & Loadout" 
            onClose={onClose} 
            className="w-[1100px] h-[85vh]"
            initialPosition={{ x: initialX, y: 24 }}
        >
            <TacticsScreen 
                playerCrew={gameState.crew} 
                offensiveTactic={gameState.offensiveTactic} 
                defensiveTactic={gameState.defensiveTactic} 
                onUpdateTactics={onUpdateTactics} 
                onUpdateTalents={onUpdateTalents} 
                savedFormation={gameState.formation} 
                onUpdateFormation={onUpdateFormation} 
                onPromotePawn={onPromotePawn} 
                retreatThreshold={gameState.retreatThreshold || 30} 
                onUpdateRetreatThreshold={onUpdateRetreatThreshold} 
                onToggleAbility={onToggleAbility} 
                onUpdateLoadout={handleUpdateLoadout}
                combatPreferences={gameState.combatPreferences}
                onUpdateCombatPreferences={handleUpdateCombatPreferences}
            />
        </DraggableWindow>
    );
};

export default CombatOperations;
