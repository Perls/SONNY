
import React, { useState } from 'react';
import BlockMenu from './TurfMenu';
import { generateBlockBuildings } from '../utils/mapUtils';
import { GameState, Holding, Tag, TaggingOperation, CrewMember, MapTagData } from '../types';
import { useGameEngine } from '../contexts/GameEngineContext';
import { CONNECTION_DATA } from '../data/connectionData';

interface BlockInteractionProps {
    selectedGrid: { x: number, y: number } | null;
    gameState: GameState;
    playerGridPos: { x: number, y: number };
    onClose: () => void;
    onBuy: (holding: Holding) => void;
    onUpgrade: (holdingId: string, cost: number) => void;
    onVisit: (landmarkId: string) => void;
    onTravel: (x: number, y: number) => void;
    onCancelTravel: () => void;
    movementQueue: { x: number, y: number }[];
    onStartTagging: (x: number, y: number, slotIndex: number, tagId: string) => void;
    onUsePayphone: (amount: number) => void;
    missionTargeting: any; 
    onEnterBuilding: (building: any, isOwned: boolean) => void;
}

const BlockInteraction: React.FC<BlockInteractionProps> = ({ 
    selectedGrid, 
    gameState, 
    playerGridPos, 
    onClose,
    onBuy,
    onUpgrade,
    onVisit,
    onTravel,
    onCancelTravel,
    movementQueue,
    onStartTagging,
    onUsePayphone,
    missionTargeting,
    onEnterBuilding
}) => {
    const { handleStartErasing, triggerEvent } = useGameEngine();
    const [menuOffset, setMenuOffset] = useState({ x: 0, y: 0 });

    if (!selectedGrid || !gameState || missionTargeting) return null;
    
    const { x, y } = selectedGrid;

    // Determine if moving to selected grid
    let isTravelingToTarget = false;
    if (movementQueue.length > 0) {
        const dest = movementQueue[movementQueue.length - 1];
        // Target logic adds 0.5 to integer grid
        if (dest.x === x + 0.5 && dest.y === y + 0.5) {
            isTravelingToTarget = true;
        }
    }

    // Check for active quest connection at this location
    const connectionFriend = gameState.friends.find(f => CONNECTION_DATA[f.id]);
    const connectionProfile = connectionFriend ? CONNECTION_DATA[connectionFriend.id] : null;
    
    // Only show if exact match
    const activeQuestConnection = (connectionProfile && connectionProfile.meetingLocation.x === x && connectionProfile.meetingLocation.y === y) 
        ? connectionProfile 
        : null;

    return (
        <BlockMenu 
            x={x} 
            y={y} 
            playerGridPos={playerGridPos} 
            ownedHoldings={gameState.holdings.filter(h => h.x === x && h.y === y)} 
            potentialBuildings={generateBlockBuildings(x, y)} 
            money={gameState.money} 
            onClose={onClose} 
            onBuy={onBuy} 
            onUpgrade={onUpgrade} 
            onVisit={onVisit} 
            onTravel={onTravel} 
            offset={menuOffset} 
            onOffsetChange={setMenuOffset} 
            onCancelTravel={onCancelTravel}
            isTravelingToTarget={isTravelingToTarget}
            playerTags={gameState.tags || []}
            activeOperations={gameState.activeTaggingOps || []}
            mapTags={gameState.mapTags || {}}
            crew={gameState.crew}
            onStartTagging={onStartTagging}
            onStartErasing={handleStartErasing}
            onUsePayphone={onUsePayphone}
            onEnterBuilding={onEnterBuilding}
            activeQuestConnection={activeQuestConnection}
            onTriggerEvent={triggerEvent}
        />
    );
};

export default BlockInteraction;
