
import React, { useState } from 'react';
import { useGameEngine } from '../contexts/GameEngineContext';
import { MAP_DESTINATIONS } from '../utils/mapUtils';
import BuildingInterior from './buildings/BuildingInterior';
import Nightclub from './buildings/Nightclub';
import Casino from './buildings/Casino';
import Church from './buildings/Church';
import { LocationMenu } from './LocationMenu';
import BlockInteraction from './TurfInteraction';
import MedicalInterior from './buildings/MedicalInterior';
import StarterQuestDialog from './StarterQuestDialog'; 
import { CONNECTION_DATA } from '../data/connectionData'; 
import EventModal from './EventModal';
import { InventoryItem } from '../types';

const LocationInteractionLayer: React.FC = () => {
    const {
        view,
        gameState,
        activeLocation,
        setActiveLocation,
        selectedGrid,
        setSelectedGrid,
        playerGridPos,
        handlePurchaseHolding,
        handleUpgradeHolding,
        handleVisitLocation,
        handleTravel,
        handleCancelTravel,
        movementQueue,
        handleStartTagging,
        handlePayphoneUse,
        missionTargeting,
        handleEnterBuilding,
        handleRobbery,
        handleRestoreEnergy,
        handleBuyItem,
        handleBuildingCollection,
        startMinigame,
        setIsIndustrialJobActive,
        handleNightclubAction,
        updateSave,
        handleRecruitPawn,
        handleBulkRecruit,
        handleStartCombat,
        handleAddXp,
        handleHealCrew,
        handleRefillEnergy,
        handlePlaceBounty,
        handleApplyBuff,
        handleSetSafehouse,
        triggerEvent,
        resolveEventOption,
        triggerFeedback
    } = useGameEngine();
    
    const [showStarterQuest, setShowStarterQuest] = useState(false);

    if (view !== 'game' || !gameState) return null;

    const connectionFriend = gameState.friends.find(f => CONNECTION_DATA[f.id]);
    const connectionProfile = connectionFriend ? CONNECTION_DATA[connectionFriend.id] : null;
    
    // Check if player is at the meeting location
    const isAtQuestLocation = connectionProfile && 
        Math.floor(playerGridPos.x) === connectionProfile.meetingLocation.x && 
        Math.floor(playerGridPos.y) === connectionProfile.meetingLocation.y;
    
    // Check if quest is already completed
    const isQuestCompleted = connectionProfile && gameState.completedEvents?.includes(connectionProfile.eventId);
    
    // We only show the "Meet Contact" button if at location and no other menu is open AND quest not done
    const showMeetButton = isAtQuestLocation && !activeLocation && !selectedGrid && !showStarterQuest && !isQuestCompleted;

    const handleStartQuest = () => {
        if (connectionProfile && connectionProfile.eventId) {
            triggerEvent(connectionProfile.eventId);
        } else {
            alert("Quest Started!");
        }
        setShowStarterQuest(false);
    };

    // --- SELL LOGIC FOR PAWN SHOP ---
    const handleSellItem = (item: InventoryItem, value: number) => {
        const newInventory = gameState.inventory.filter(i => i.id !== item.id);
        const newMoney = gameState.money + value;
        updateSave({
            ...gameState,
            inventory: newInventory,
            money: newMoney
        });
        triggerFeedback(`Sold item for N$ ${value}`, 'success');
    };

    const isDualMode = selectedGrid && activeLocation;
    const locationMenuOverrideStyle: React.CSSProperties | undefined = isDualMode ? { 
        position: 'absolute',
        left: '590px', 
        bottom: '24px',
        top: 'auto',
        maxHeight: '600px',
        display: 'flex',
        flexDirection: 'column'
    } : undefined;

    const isBuildingInteriorTarget = activeLocation && (
        activeLocation.type === 'residential' || 
        activeLocation.type === 'commercial' ||
        activeLocation.type === 'industrial' ||
        activeLocation.type === 'office' ||
        activeLocation.type === 'corner' ||
        activeLocation.type === 'medical' ||
        activeLocation.type === 'smuggler' ||
        activeLocation.landmarkId === 'megablock_tower' ||
        activeLocation.landmarkId === 'kb_electronics' ||
        activeLocation.landmarkId === 'central_park' ||
        activeLocation.landmarkId === 'highland_park' ||
        activeLocation.name === 'Pawn Shop'
    );

    const isActiveSafehouse = activeLocation && gameState.playerHousing 
        ? (activeLocation.x === gameState.playerHousing.location.x && activeLocation.y === gameState.playerHousing.location.y)
        : false;

    const soldierCount = gameState.crew.filter(c => !c.isLeader).length;

    return (
        <>
            {showStarterQuest && connectionProfile && (
                <StarterQuestDialog 
                    connection={connectionProfile}
                    onClose={() => setShowStarterQuest(false)}
                    onAccept={handleStartQuest}
                />
            )}

            {showMeetButton && connectionProfile && (
                <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[300] animate-bounce">
                    <button 
                        onClick={() => {
                            console.log("Triggering event:", connectionProfile.eventId);
                            triggerEvent(connectionProfile.eventId);
                        }} 
                        className="bg-amber-500 text-white font-black uppercase px-6 py-3 rounded-full shadow-lg border-4 border-white text-sm hover:scale-110 transition-transform flex items-center gap-2 pointer-events-auto cursor-pointer"
                    >
                        <span>👋</span> Meet {connectionProfile.name.split(' ')[0]}
                    </button>
                </div>
            )}

            {activeLocation && (
                activeLocation.type === 'event' && activeLocation.eventData ? (
                    <EventModal 
                        event={activeLocation.eventData} 
                        onOptionSelect={(idx) => resolveEventOption(activeLocation.eventData!.options[idx])} 
                    />
                ) :
                isBuildingInteriorTarget ? (
                    activeLocation.type === 'medical' ? (
                        <MedicalInterior 
                            building={activeLocation}
                            onClose={() => setActiveLocation(null)}
                            onHeal={handleHealCrew}
                            onShop={handleBuyItem}
                            onReduceStress={(amount) => {
                                const crew = [...gameState.crew];
                                const leaderIdx = crew.findIndex(c => c.isLeader);
                                if (leaderIdx > -1) {
                                    const leader = crew[leaderIdx];
                                    crew[leaderIdx] = { 
                                        ...leader, 
                                        stress: Math.max(0, (leader.stress || 0) - amount) 
                                    };
                                    updateSave({ ...gameState, crew });
                                }
                            }}
                        />
                    ) : (
                        <BuildingInterior 
                            building={activeLocation}
                            isOwned={activeLocation.ownerFaction === 'player'}
                            isActiveSafehouse={isActiveSafehouse}
                            onClose={() => setActiveLocation(null)}
                            onRob={handleRobbery}
                            onRest={() => handleRestoreEnergy(15)}
                            onShop={handleBuyItem}
                            onCollect={handleBuildingCollection}
                            onSetSafehouse={handleSetSafehouse}
                            playerInventory={gameState.inventory}
                            playerMoney={gameState.money}
                            onSellItem={handleSellItem}
                            onReduceStress={(amount) => {
                                const crew = [...gameState.crew];
                                const leaderIdx = crew.findIndex(c => c.isLeader);
                                if (leaderIdx > -1) {
                                    const leader = crew[leaderIdx];
                                    crew[leaderIdx] = { 
                                        ...leader, 
                                        stress: Math.max(0, (leader.stress || 0) - amount) 
                                    };
                                    updateSave({ ...gameState, crew });
                                }
                            }}
                            onStartJob={() => {
                                setActiveLocation(null);
                                if (activeLocation.type === 'industrial') {
                                    setIsIndustrialJobActive(true);
                                } else if (activeLocation.type === 'office') {
                                    startMinigame('office_job_board');
                                }
                            }}
                        />
                    )
                ) :
                activeLocation.id === 'times_sq' ? (
                    <Nightclub 
                        playerCrew={gameState.crew} 
                        money={gameState.money}
                        onClose={() => setActiveLocation(null)}
                        onAssignMember={() => {}} 
                        onRestoreEnergy={handleRestoreEnergy}
                        onAction={handleNightclubAction}
                    />
                ) : 
                activeLocation.type === 'casino' ? (
                    <Casino 
                        money={gameState.money}
                        onUpdateMoney={(amount) => updateSave({ ...gameState, money: amount })}
                        onClose={() => setActiveLocation(null)}
                    />
                ) : 
                activeLocation.id === 'church' ? (
                    <Church
                        money={gameState.money}
                        heat={gameState.heat}
                        onUpdateStats={(newMoney, newHeat) => updateSave({ ...gameState, money: newMoney, heat: newHeat })}
                        onReduceStress={(amount) => {
                            const crew = [...gameState.crew];
                            const leaderIdx = crew.findIndex(c => c.isLeader);
                            if (leaderIdx > -1) {
                                const leader = crew[leaderIdx];
                                crew[leaderIdx] = { ...leader, stress: Math.max(0, (leader.stress || 0) - amount) };
                                updateSave({ ...gameState, crew });
                            }
                        }}
                        onClose={() => setActiveLocation(null)}
                        playerName={gameState.crew.find(c => c.isLeader)?.name || "Stranger"}
                        onBless={() => {
                            const leaderId = gameState.crew.find(c => c.isLeader)?.id;
                            if (leaderId) handleApplyBuff(leaderId, 'blessed');
                        }}
                    />
                ) : (
                    <LocationMenu 
                        location={activeLocation} 
                        onClose={() => setActiveLocation(null)} 
                        onShop={handleBuyItem} 
                        onRecruit={handleRecruitPawn} 
                        onBulkRecruit={handleBulkRecruit} 
                        onStartCombat={handleStartCombat} 
                        onAddXp={handleAddXp}
                        onHeal={handleHealCrew} 
                        onRest={handleRefillEnergy}
                        overrideStyle={locationMenuOverrideStyle} 
                        playerFaction={gameState.crew[0]?.faction || 'The Street Gangs'}
                        playerMoney={gameState.money}
                        onPlaceBounty={handlePlaceBounty}
                        currentCrewSize={soldierCount}
                    />
                )
            )}

            {selectedGrid && (
                <BlockInteraction 
                    selectedGrid={selectedGrid}
                    gameState={gameState}
                    playerGridPos={playerGridPos}
                    onClose={() => setSelectedGrid(null)}
                    onBuy={handlePurchaseHolding}
                    onUpgrade={handleUpgradeHolding}
                    onVisit={handleVisitLocation}
                    onTravel={handleTravel}
                    onCancelTravel={handleCancelTravel}
                    movementQueue={movementQueue}
                    onStartTagging={handleStartTagging}
                    onUsePayphone={handlePayphoneUse}
                    missionTargeting={missionTargeting}
                    onEnterBuilding={handleEnterBuilding}
                />
            )}
        </>
    );
};

export default LocationInteractionLayer;
