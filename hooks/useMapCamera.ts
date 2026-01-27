
import React, { useState, useRef, useMemo } from 'react';

export const useMapCamera = (initialPos = { x: 750, y: 500 }, cameraMode: 'cinematic' | 'default' = 'cinematic') => {
    const [cameraPos, setCameraPos] = useState<{ x: number, y: number }>(initialPos);
    // Zoom Level: 1 (Far/Top-down), 2 (Mid), 3 (Close/Angled)
    const [zoomLevel, setZoomLevel] = useState(1);
    const [isDraggingMap, setIsDraggingMap] = useState(false);
    
    const dragStartRef = useRef<{x: number, y: number} | null>(null);
    const cameraStartRef = useRef<{x: number, y: number} | null>(null);
    const isClickRef = useRef(true);

    const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 1, 3));
    const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 1, 1));

    const handleWheel = (e: React.WheelEvent) => {
        if (e.deltaY < 0) {
            handleZoomIn();
        } else if (e.deltaY > 0) {
            handleZoomOut();
        }
    };

    const handleMapMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 0) return; // Left click only
        
        setIsDraggingMap(true);
        dragStartRef.current = { x: e.clientX, y: e.clientY };
        cameraStartRef.current = { ...cameraPos };
        isClickRef.current = true;
    };

    const handleMapMouseMove = (e: React.MouseEvent) => {
        if (!isDraggingMap || !dragStartRef.current || !cameraStartRef.current) return;

        const dx = e.clientX - dragStartRef.current.x;
        const dy = e.clientY - dragStartRef.current.y;

        // Threshold to distinguish click vs drag
        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
            isClickRef.current = false;
        }

        // Adjust drag sensitivity based on zoom level
        let dragScale = 1.5; 
        if (zoomLevel === 2) dragScale = 1.25; // Adjusted for intermediate
        if (zoomLevel === 3) dragScale = 1.0;  // Adjusted for new max

        const newX = cameraStartRef.current.x - (dx * dragScale);
        const newY = cameraStartRef.current.y - (dy * dragScale);

        // Clamp camera center to map bounds (Map size 1500x1000)
        const clampedX = Math.max(-200, Math.min(1700, newX));
        const clampedY = Math.max(-200, Math.min(1200, newY));

        setCameraPos({ x: clampedX, y: clampedY });
    };

    const handleMapMouseUp = () => {
        setIsDraggingMap(false);
        dragStartRef.current = null;
        cameraStartRef.current = null;
    };

    // Calculate CSS 3D Transforms based on Zoom Level & Mode
    const { cameraStyle, rotation } = useMemo(() => {
        let scale = 0.8;
        let rotateX = 0;
        let rotateZ = 0;

        if (cameraMode === 'cinematic') {
            // 3D Cinematic Mode
            
            // Level 1 (Far) - Base
            scale = 0.8; 
            rotateX = 20; 
            rotateZ = 0; 

            if (zoomLevel === 2) {
                // Level 2 (Intermediate) - New Step
                scale = 1.0;
                rotateX = 28;
                rotateZ = 0; 
            } else if (zoomLevel === 3) {
                // Level 3 (Max) - Replaces old Level 2 (1.2 scale)
                scale = 1.2; 
                rotateX = 35; 
                rotateZ = 0; 
            }
        } else {
            // Default 2D Mode (Top Down)
            scale = 0.7; 
            rotateX = 0;
            rotateZ = 0;

            if (zoomLevel === 2) scale = 0.85;
            if (zoomLevel === 3) scale = 1.0;
        }

        return {
            cameraStyle: {
                transform: `rotateX(${rotateX}deg) rotateZ(${rotateZ}deg) scale(${scale})`,
            },
            rotation: { x: rotateX, z: rotateZ }
        };
    }, [zoomLevel, cameraMode]);

    // ViewBox is now static relative to the window, the CSS Scale handles the zoom "in".
    const viewBox = useMemo(() => {
        const w = 1500;
        const h = 1000;
        const x = cameraPos.x - (w / 2);
        const y = cameraPos.y - (h / 2);
        return `${x} ${y} ${w} ${h}`;
    }, [cameraPos]);

    return {
        cameraPos,
        setCameraPos,
        zoomLevel,
        isDraggingMap,
        viewBox,
        cameraStyle, // Export styles for the container
        rotation, // Export rotation for billboarding
        isClickRef,
        handlers: {
            onMouseDown: handleMapMouseDown,
            onMouseMove: handleMapMouseMove,
            onMouseUp: handleMapMouseUp,
            onMouseLeave: handleMapMouseUp,
            onWheel: handleWheel
        },
        controls: {
            zoomIn: handleZoomIn,
            zoomOut: handleZoomOut
        }
    };
};
