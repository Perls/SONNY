
import React, { useEffect } from 'react';
import { useGameEngine } from '../contexts/GameEngineContext';

import CharacterSelectScreen from './CharacterSelectScreen';
import CombatScreen from './CombatScreen';
import CharacterWindow from './CharacterWindow';
import ConsiglierePanel from './ConsiglierePanel';
import TimePanel from './TimePanel';
import CharacterCreation from './CharacterCreation/index';
import GameMapLayer from './GameMapLayer';
import LocationInteractionLayer from './LocationInteractionLayer';
import DraggableWindow from './DraggableWindow';
import CrewList from './CrewList';
import InventoryScreen from './InventoryScreen';
import ProfileWindow from './ProfileWindow';
import HoldingsDrawer from './HoldingsDrawer';
import CharacterInspectWindow from './CharacterInspectWindow';
import DailyTimes from './DailyTimes';
import TagsDrawer from './TagsDrawer';
import RadioPlayer from './RadioPlayer';
import SettingsWindow from './SettingsWindow';
import FamilyScreen from './FamilyScreen';
import BottomBar from './BottomBar';
import CombatOperations from './CombatOperations';
import IndustrialJobMinigame from './IndustrialJobMinigame';
import MinigameLayer from './MinigameLayer';
import JournalScreen from './JournalScreen';
import NotificationQueue from './NotificationQueue';
import PlayerHousing from './PlayerHousing';
import FeedbackToast from './FeedbackToast';

const App: React.FC = () => {
  const engine = useGameEngine();

  // Load initial data
  useEffect(() => {
    console.log("System initialized. Welcome to NYC.");
  }, []);

  if (engine.view === 'splash') { 
      return <CharacterSelectScreen saves={engine.saves} onSelectCharacter={engine.handleSelectCharacter} onCreateNew={engine.handleCreateNew} onDeleteCharacter={engine.handleDeleteCharacter} />; 
  }
  
  if (engine.view === 'combat' && engine.gameState) { 
      return (
        <CombatScreen 
            playerCrew={engine.gameState.crew} 
            enemyLevel={1} 
            activeTactic={engine.gameState.offensiveTactic} 
            onCombatEnd={engine.handleCombatEnd} 
            forcedEnemyClass={engine.activeEnemyClass} 
            lastBattleRecord={engine.gameState.journal[0]} 
            formation={engine.gameState.formation} 
            retreatThreshold={engine.gameState.retreatThreshold || 0}
            officers={engine.officers}
        /> 
      );
  }

  // Handle Character Creation as a full-screen mode now
  if (engine.view === 'create') {
      return (
          <CharacterCreation 
              onRecruit={engine.handleRecruit} 
              onCancel={engine.handleLogout} 
              canAfford={true} 
              isFull={false} 
              isRecruiting={engine.isRecruiting} 
              gameStarted={false} 
          />
      );
  }

  return (
    <div className="fixed inset-0 bg-slate-100 font-waze overflow-hidden flex flex-col text-slate-900">
      {/* Headless Logic Components */}
      <RadioPlayer channel={engine.radioChannel} />

      {/* Level Up Flash Overlay */}
      {engine.levelUpFlash && (
          <div className="fixed inset-0 z-[150] pointer-events-none animate-flash-gold"></div>
      )}
      
      {/* --- HUD TOP LAYER (Fixed Panels) --- */}
      {engine.view === 'game' && engine.gameState && (
         <>
            {!engine.missionTargeting && <CharacterWindow boss={engine.gameState.crew.find(c => c.isLeader) || engine.gameState.crew[0]} money={engine.gameState.money} />}
            
            {/* Conditional Rendering of Consigliere */}
            <ConsiglierePanel 
                message={engine.consigliereQueue[0] || ""} 
                isOpen={engine.consigliereOpen} 
                onClose={() => engine.setConsigliereOpen(false)} 
            />

            {/* Global Feedback Toast */}
            {engine.feedback && (
                <FeedbackToast 
                    message={engine.feedback.message} 
                    type={engine.feedback.type} 
                    onClose={() => engine.triggerFeedback('', 'error')} // Actually handled by auto-timeout but prop required
                />
            )}

            {!engine.missionTargeting && (
                <TimePanel 
                    currentTime={engine.currentTime} 
                    location={engine.locationLabel} 
                    weather={engine.weather} 
                    playerFaction={engine.gameState.crew.find(c => c.isLeader)?.faction}
                />
            )}
            
            {/* Unified Notification Queue */}
            <NotificationQueue />

            {/* MISSION TARGETING OVERLAY */}
            {engine.missionTargeting && (
                <div className="absolute top-8 left-1/2 -translate-x-1/2 z-[60] animate-slide-in-top">
                    <div className="bg-slate-900 border-2 border-amber-500 text-white px-8 py-4 rounded-xl shadow-[0_0_40px_rgba(245,158,11,0.5)] flex flex-col items-center">
                        <div className="text-sm font-black uppercase tracking-[0.2em] text-amber-500 mb-1 animate-pulse">Assigning Mission</div>
                        <div className="text-2xl font-black font-news uppercase">Select Target Block</div>
                        <div className="text-xs text-slate-400 mt-2 font-bold bg-slate-800 px-3 py-1 rounded-full cursor-pointer hover:bg-slate-700 hover:text-white transition-colors" onClick={() => engine.setMissionTargeting(null)}>
                            Cancel Operation
                        </div>
                    </div>
                </div>
            )}
         </>
      )}

      {/* --- INDUSTRIAL JOB MINIGAME OVERLAY (Legacy/Separate) --- */}
      {engine.isIndustrialJobActive && (
          <IndustrialJobMinigame 
              onClose={() => engine.setIsIndustrialJobActive(false)}
              onComplete={engine.handleCompleteIndustrialJob}
          />
      )}

      {/* --- MINIGAME LAYER (Job Board & Active Games) --- */}
      {engine.activeMinigameId && (
          <MinigameLayer />
      )}

      {/* --- PLAYER HOUSING OVERLAY --- */}
      {engine.isHousingOpen && engine.gameState && engine.gameState.playerHousing && (
          <PlayerHousing 
              housing={engine.gameState.playerHousing}
              onClose={() => engine.setIsHousingOpen(false)}
          />
      )}

      <div className="flex-grow flex relative overflow-hidden">
        
        {/* MAP & INTERACTION LAYERS */}
        <GameMapLayer />
        <LocationInteractionLayer />
           
        {/* MODAL WINDOWS */}
        {engine.view === 'game' && engine.activeMenu === 'crew' && engine.gameState && ( <DraggableWindow title="Organization" subtitle="Hierarchy & Command" onClose={() => engine.setActiveMenu(null)} className="w-[1200px] h-[850px]"><CrewList crew={engine.gameState.crew} officers={engine.officers} onRemove={engine.handleRemove} onPromote={engine.handlePromote} onInspect={engine.handleInspectCharacter} onUpdateOfficer={engine.handleUpdateOfficer} onAssignMission={engine.handleAssignMission} /></DraggableWindow> )}
        
        {engine.view === 'game' && engine.activeMenu === 'inventory' && engine.gameState && ( 
            <DraggableWindow title="Inventory" subtitle="Equipment & Contraband" onClose={() => engine.setActiveMenu(null)} className="w-[1000px] h-[900px]">
                <InventoryScreen 
                    inventory={engine.gameState.inventory} 
                    equipment={engine.gameState.crew.find(c => c.isLeader)?.equipment} 
                    boss={engine.gameState.crew.find(c => c.isLeader) || engine.gameState.crew[0]} 
                    onEquip={(item) => engine.handleEquipItem(engine.gameState!.crew.find(c => c.isLeader)?.id || '', item)} 
                    onUnequip={(slot) => engine.handleUnequipItem(engine.gameState!.crew.find(c => c.isLeader)?.id || '', slot)} 
                    onUse={(itemId) => engine.handleUseItem(engine.gameState!.crew.find(c => c.isLeader)?.id || '', itemId)}
                    currentEnergy={engine.gameState.currentEnergy}
                />
            </DraggableWindow> 
        )}
        
        {engine.view === 'game' && engine.activeMenu === 'combat' && engine.gameState && ( 
            <CombatOperations 
                gameState={engine.gameState} 
                onClose={() => engine.setActiveMenu(null)} 
                onUpdateTactics={engine.handleUpdateTactic}
                onUpdateTalents={engine.handleUpdateTalents}
                onUpdateFormation={engine.handleUpdateFormation}
                onPromotePawn={engine.handlePromotePawn}
                onUpdateRetreatThreshold={engine.handleUpdateRetreatThreshold}
                onToggleAbility={engine.handleToggleAbility}
            />
        )}

        {engine.view === 'game' && engine.activeMenu === 'profile' && engine.gameState && ( <DraggableWindow title="Boss Profile" subtitle="Stats & History" onClose={() => engine.setActiveMenu(null)} className="w-[1000px] h-[800px]"><ProfileWindow boss={engine.gameState.crew.find(c => c.isLeader) || engine.gameState.crew[0]} money={engine.gameState.money} respect={engine.gameState.respect} onUpdateStatus={engine.handleUpdateStatus} currentEnergy={engine.gameState.currentEnergy} /></DraggableWindow> )}
        
        {engine.view === 'game' && engine.activeMenu === 'block' && engine.gameState && ( 
            <DraggableWindow title="Block Operations" subtitle="Real Estate & Rackets" onClose={() => engine.setActiveMenu(null)} className="w-[1000px] h-[850px]">
                <HoldingsDrawer 
                    holdings={engine.gameState.holdings} 
                    boss={engine.gameState.crew.find(c => c.isLeader) || engine.gameState.crew[0]}
                />
            </DraggableWindow> 
        )}
        
        {engine.view === 'game' && engine.inspectedUnitId && engine.gameState && ( <DraggableWindow title="Dossier" subtitle="Subject Profile" onClose={() => engine.setInspectedUnitId(null)} className="w-[850px] h-[600px]">{(() => { const member = engine.gameState.crew.find(c => c.id === engine.inspectedUnitId); if (!member) return <div className="p-8 text-center text-slate-400">Record Not Found</div>; return <CharacterInspectWindow member={member} onDismiss={engine.handleRemove} onPromote={engine.handlePromotePawn} />; })()}</DraggableWindow> )}
        {engine.view === 'game' && engine.activeMenu === 'daily_times' && engine.gameState && ( <DraggableWindow title="Daily Times" subtitle="NYC Chronicle" onClose={() => engine.setActiveMenu(null)} className="w-[1000px] h-[800px]"><DailyTimes date={engine.currentTime} /></DraggableWindow> )}
        
        {engine.view === 'game' && engine.activeMenu === 'journal' && engine.gameState && ( 
            <DraggableWindow title="Pocket Organizer" subtitle="Log & Contacts" onClose={() => engine.setActiveMenu(null)} className="w-[900px] h-[825px]">
                <JournalScreen gameState={engine.gameState} />
            </DraggableWindow> 
        )}
        
        {engine.view === 'game' && engine.activeMenu === 'tags' && engine.gameState && ( 
            <DraggableWindow title="Tags" subtitle="Graffiti & Vandalism" onClose={() => engine.setActiveMenu(null)} className="w-[600px] h-[700px]">
                <TagsDrawer 
                    tags={engine.gameState.tags || []} 
                    mapTags={engine.gameState.mapTags || {}} 
                    onSaveTag={engine.handleSaveTag} 
                    onDeleteTag={engine.handleDeleteTag} 
                />
            </DraggableWindow> 
        )}
        {engine.view === 'game' && engine.activeMenu === 'family' && engine.gameState && ( <DraggableWindow title="La Famiglia" subtitle="Guild & Alliances" onClose={() => engine.setActiveMenu(null)} className="w-[1000px] h-[700px]"><FamilyScreen playerFaction={engine.gameState.crew[0]?.faction || 'Independent'} playerName={engine.gameState.crew[0]?.name || 'Boss'} /></DraggableWindow> )}
        
        {engine.view === 'game' && engine.activeMenu === 'settings' && (
            <SettingsWindow 
                radioChannel={engine.radioChannel} 
                setRadioChannel={engine.setRadioChannel} 
                visualEffectsEnabled={engine.visualEffectsEnabled}
                onToggleVisualEffects={engine.setVisualEffectsEnabled}
                consigliereEnabled={engine.consigliereEnabled}
                onToggleConsigliere={engine.setConsigliereEnabled}
                cameraMode={engine.cameraMode}
                setCameraMode={engine.setCameraMode}
                onLogout={engine.handleLogout}
                onClose={() => engine.setActiveMenu(null)}
            />
        )}
      </div>

      {engine.view === 'game' && engine.gameState && (
        <BottomBar 
            gameState={engine.gameState}
            activeMenu={engine.activeMenu}
            onToggleMenu={engine.toggleMenu}
            activeMapMode={engine.activeMapMode}
            onSelectMapMode={engine.handleSelectMapMode}
            isMapModesOpen={engine.isMapModesOpen}
            onToggleMapModes={engine.handleToggleMapModes}
            isMoving={engine.isMoving}
            movementQueue={engine.movementQueue}
            onCancelTravel={engine.handleCancelTravel}
            locationLabel={engine.locationLabel}
        />
      )}
    </div>
  );
};

export default App;
