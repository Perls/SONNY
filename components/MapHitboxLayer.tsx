
import React, { useState } from 'react';
import { ClassType } from '../types';
import { generateBlockBuildings } from '../utils/mapUtils';

interface MapHitboxLayerProps {
    onGridClick: (x: number, y: number) => void;
    onGridDoubleClick?: (x: number, y: number) => void;
    viewBox?: string; 
    cols?: number;
    rows?: number;
    zoomLevel: number;
    selectedGrid?: { x: number, y: number } | null;
    playerClass?: ClassType;
}

const MapHitboxLayer: React.FC<MapHitboxLayerProps> = ({ 
    onGridClick, 
    onGridDoubleClick,
    viewBox = "0 0 1500 1000",
    cols = 15,
    rows = 10,
    zoomLevel,
    selectedGrid,
    playerClass = ClassType.Thug
}) => {
    const [hovered, setHovered] = useState<{x: number, y: number} | null>(null);

    const generateRects = () => {
        const width = 100;
        const height = 100;
        const rects = [];
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const isHovered = hovered?.x === x && hovered?.y === y;
                const isSelected = selectedGrid?.x === x && selectedGrid?.y === y;
                const isActive = isHovered || isSelected;
                
                // 1. The Hitbox (Invisible, Full Coverage)
                rects.push(
                    <rect
                        key={`${x}-${y}-hit`}
                        x={x * width}
                        y={y * height}
                        width={width}
                        height={height}
                        fill="rgba(255, 255, 255, 0.001)" // Nearly transparent to capture events
                        stroke="none"
                        style={{ 
                            cursor: 'pointer', 
                            pointerEvents: 'auto'
                        }}
                        onClick={(e) => {
                            e.stopPropagation(); 
                            onGridClick(x, y);
                        }}
                        onDoubleClick={(e) => {
                            e.stopPropagation();
                            if (onGridDoubleClick) onGridDoubleClick(x, y);
                        }}
                        onMouseEnter={() => setHovered({x, y})}
                        onMouseLeave={() => setHovered(null)}
                    />
                );

                if (isActive) {
                    // 2. The Border (Around the Block/Grid Cell)
                    rects.push(
                        <rect
                            key={`${x}-${y}-border`}
                            x={x * width + 4}
                            y={y * height + 4}
                            width={width - 8}
                            height={height - 8}
                            rx={8}
                            ry={8}
                            fill="none" 
                            stroke="#9ca3af" // Gray-400
                            strokeWidth="3" 
                            strokeDasharray="12 6" 
                            className="animate-dash-march pointer-events-none"
                        />
                    );

                    // 3. The Flash (Buildings Only)
                    const buildings = generateBlockBuildings(x, y).filter(b => !b.isHidden);

                    // Determine shapes for darkening
                    const activeShapes = buildings.length > 0 ? buildings.map(b => {
                        const isMultiTile = b.w > 100 || b.h > 100;
                        const isMaster = b.isVisualMaster;
                        
                        // For multi-tile buildings, if this isn't the master tile, 
                        // fallback to flashing the local cell area to avoid visual offset bugs
                        if (isMultiTile && !isMaster) {
                            return {
                                x: x * width + 5,
                                y: y * height + 5,
                                w: width - 10,
                                h: height - 10,
                                r: 5
                            };
                        }
                        
                        return {
                            x: x * width + b.x,
                            y: y * height + b.y,
                            w: b.w,
                            h: b.h,
                            r: 6
                        };
                    }) : [
                        // Empty block fallback
                        { x: x * width + 5, y: y * height + 5, w: width - 10, h: height - 10, r: 8 }
                    ];

                    rects.push(
                        <g key={`${x}-${y}-vis`} className="pointer-events-none">
                            {activeShapes.map((shape, i) => (
                                <g key={`vis-${x}-${y}-${i}`}>
                                    {/* Darken Overlay */}
                                    <rect
                                        x={shape.x}
                                        y={shape.y}
                                        width={shape.w}
                                        height={shape.h}
                                        rx={shape.r}
                                        ry={shape.r}
                                        fill="black"
                                        opacity="0.5"
                                    />
                                    
                                    {/* Gleam (Pulse) */}
                                    <rect
                                        x={shape.x}
                                        y={shape.y}
                                        width={shape.w}
                                        height={shape.h}
                                        rx={shape.r}
                                        ry={shape.r}
                                        fill="white"
                                        opacity="0.2"
                                        className="animate-pulse"
                                    />
                                </g>
                            ))}
                        </g>
                    );
                }
            }
        }
        return rects;
    };

    // --- THREE GRID FUNCTIONS (Consolidated style to prevent unmounting/remounting issues) ---
    
    // Zoom 1: Flat / Far view
    const renderGridZoom1 = () => (
        <div className="absolute inset-0 w-full h-full z-[200]" style={{ transform: 'translateZ(1px)' }}>
            <svg 
                className="w-full h-full"
                viewBox={viewBox}
                preserveAspectRatio="xMidYMid meet"
                style={{ overflow: 'visible' }}
            >
                <g>{generateRects()}</g>
            </svg>
        </div>
    );

    // Zoom 2: Mid Range
    const renderGridZoom2 = () => (
        <div className="absolute inset-0 w-full h-full z-[200]" style={{ transform: 'translateZ(1px)' }}>
            <svg 
                className="w-full h-full"
                viewBox={viewBox}
                preserveAspectRatio="xMidYMid meet"
                style={{ overflow: 'visible' }}
            >
                <g>{generateRects()}</g>
            </svg>
        </div>
    );

    // Zoom 3: Close Up
    const renderGridZoom3 = () => (
        <div className="absolute inset-0 w-full h-full z-[200]" style={{ transform: 'translateZ(1px)' }}>
            <svg 
                className="w-full h-full"
                viewBox={viewBox}
                preserveAspectRatio="xMidYMid meet"
                style={{ overflow: 'visible' }}
            >
                <g>{generateRects()}</g>
            </svg>
        </div>
    );

    // Switch based on Zoom Level
    if (zoomLevel === 3) return renderGridZoom3();
    if (zoomLevel === 2) return renderGridZoom2();
    return renderGridZoom1();
};

export default MapHitboxLayer;
