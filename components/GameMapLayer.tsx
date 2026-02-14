
import React, { useState, useMemo } from 'react';
import { useGameEngine } from '../contexts/GameEngineContext';
import { ClassType } from '../types';
import MapBackground from './MapBackground';
import MapFactionOverlay from './MapFactionOverlay';
import WeatherEffects from './WeatherEffects';
import MapTaggingOverlay from './MapTaggingOverlay';
import MapOfficersOverlay from './MapOfficersOverlay';
import MapMissionOverlay from './MapMissionOverlay';
import ImportsOverlay from './ImportsOverlay';
import MapTrainOverlay from './MapTrainOverlay';
import MapPlayer from './MapPlayer';
import ZoomControls from './ZoomControls';
import NightEffects from './NightEffects';
import EnergyMeter from './EnergyMeter';
import MapAvoidOverlay from './MapAvoidOverlay';
import MapTerrainOverlay from './MapTerrainOverlay';
import MapHitboxLayer from './MapHitboxLayer';

const GameMapLayer: React.FC = () => {
    const {
        gameState,
        activeMapMode,
        view,
        handleGridClick,
        handleGridDoubleClick,
        viewBox,
        visualEffectsEnabled,
        playerGridPos,
        weather,
        activeOfficerTravels,
        playerPos,
        isMoving,
        isArriving,
        isMovementRejected,
        visitedPath,
        activeSaveId,
        moveDuration,
        zoomLevel,
        zoomControls,
        energyTransitionDuration,
        energyTransitionEasing,
        mapHandlers,
        isDraggingMap,
        handleClearAvoidedAreas,
        cameraStyle, // Get style directly from context
        cameraRotation, // Get rotation object
        selectedGrid // Get selected grid state
    } = useGameEngine();

    const [rumbleIntensity, setRumbleIntensity] = useState(0);

    // Cache leader lookup — avoids 4 separate .find() linear scans per render
    const leader = useMemo(() =>
        gameState?.crew.find(c => c.isLeader),
        [gameState?.crew]
    );

    if (!gameState) return null;

    // Calculate shake transform based on intensity (Independent of camera 3D)
    // We apply shake to the INNER SVG to avoid shaking the 3D plane axis which causes nausea
    const shakeTransform = rumbleIntensity > 0
        ? `translate(${(Math.random() - 0.5) * rumbleIntensity * 10}px, ${(Math.random() - 0.5) * rumbleIntensity * 10}px)`
        : 'none';

    const tilt = cameraRotation ? cameraRotation.x : 0;

    return (
        <div
            className={`flex-grow relative bg-slate-200 overflow-hidden perspective-container ${isDraggingMap ? 'cursor-grabbing' : 'cursor-grab'}`}
            {...mapHandlers}
        >
            {/* 3D Plane Wrapper - EVERYTHING sits inside here to share the perspective */}
            <div className="map-plane-3d" style={cameraStyle}>

                {/* Shake Wrapper (Rumble) - MUST PRESERVE 3D OR HITBOXES FLATTEN BEHIND VISUALS */}
                <div style={{ transform: shakeTransform, width: '100%', height: '100%', transformStyle: 'preserve-3d' }}>

                    {/* VISUAL LAYERS (Pointer Events Disabled to allow Hitbox Click-through) */}
                    <div className="absolute inset-0 pointer-events-none z-0" style={{ transformStyle: 'preserve-3d' }}>
                        <MapBackground
                            holdings={gameState.holdings}
                            playerClass={leader?.classType || ClassType.Thug}
                            mapMode={activeMapMode}
                            view={view}
                            viewBox={viewBox}
                            isNight={visualEffectsEnabled ? weather.isNight : false}
                            playerGridPos={playerGridPos}
                        />

                        <MapTrainOverlay
                            viewBox={viewBox}
                            playerPos={playerPos}
                            onRumble={setRumbleIntensity}
                        />

                        {activeMapMode === 'faction' && <MapFactionOverlay viewBox={viewBox} />}

                        {activeMapMode === 'terrain' && <MapTerrainOverlay viewBox={viewBox} />}

                        {activeMapMode === 'avoid' && (
                            <div className="pointer-events-auto">
                                <MapAvoidOverlay
                                    avoidedAreas={gameState.avoidedAreas || []}
                                    onClearAll={handleClearAvoidedAreas}
                                    viewBox={viewBox}
                                />
                            </div>
                        )}

                        {visualEffectsEnabled && <WeatherEffects weather={weather} viewBox={viewBox} />}

                        {visualEffectsEnabled && (
                            <NightEffects
                                viewBox={viewBox}
                                playerPos={playerPos}
                                isMoving={isMoving}
                                moveDuration={moveDuration}
                                isNight={weather.isNight}
                            />
                        )}

                        <MapTaggingOverlay
                            activeTaggingOps={gameState.activeTaggingOps || []}
                            mapTags={gameState.mapTags || {}}
                            crew={gameState.crew}
                            viewBox={viewBox}
                        />
                        <MapOfficersOverlay travels={activeOfficerTravels} viewBox={viewBox} />

                        <MapMissionOverlay
                            missions={gameState.activeMissions || []}
                            crew={gameState.crew}
                            viewBox={viewBox}
                        />

                        {activeMapMode === 'imports' && <ImportsOverlay viewBox={viewBox} />}
                    </div>

                    {/* PLAYER LAYER - Visuals above map but below hitboxes generally */}
                    <div className="absolute inset-0 pointer-events-none z-[50]" style={{ transformStyle: 'preserve-3d', transform: 'translateZ(10px)' }}>
                        <MapPlayer
                            playerPos={playerPos}
                            isMoving={isMoving}
                            isArriving={isArriving}
                            isRejected={isMovementRejected}
                            visitedPath={visitedPath}
                            leaderImageSeed={leader?.imageSeed || activeSaveId || 'player'}
                            moveDuration={moveDuration}
                            mapMode={activeMapMode}
                            viewBox={viewBox}
                            playerClass={leader?.classType || ClassType.Thug}
                            playerHousing={gameState.playerHousing}
                            tilt={tilt}
                        />
                    </div>

                    {/* INTERACTION LAYER - DEDICATED HITBOXES */}
                    {/* The component now handles its own Z-transform and grid logic per zoom level */}
                    <MapHitboxLayer
                        onGridClick={handleGridClick}
                        onGridDoubleClick={handleGridDoubleClick}
                        viewBox={viewBox}
                        zoomLevel={zoomLevel}
                        selectedGrid={selectedGrid}
                        playerClass={leader?.classType || ClassType.Thug}
                    />

                </div>
            </div>

            {/* Controls (Stay Flat on Screen) */}
            <ZoomControls zoomLevel={zoomLevel} onZoomIn={zoomControls.zoomIn} onZoomOut={zoomControls.zoomOut} />

            {view === 'game' && (
                <EnergyMeter
                    currentEnergy={gameState.currentEnergy || 0}
                    transitionDuration={energyTransitionDuration}
                    transitionEasing={energyTransitionEasing}
                />
            )}
        </div>
    );
};

export default GameMapLayer;
