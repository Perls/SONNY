
import React, { useState, useEffect, useRef } from 'react';

interface DraggableWindowProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  className?: string; // For width/height overrides
  initialPosition?: { x: number; y: number };
}

const DraggableWindow: React.FC<DraggableWindowProps> = ({ 
  title, 
  subtitle, 
  onClose, 
  children, 
  className = "w-96 h-[70vh]",
  initialPosition 
}) => {
  // Default to center if no initial position provided
  const [position, setPosition] = useState(() => {
      if (initialPosition) return initialPosition;
      // Approximate centering based on assumed className width/height or generic fallback
      const winWidth = window.innerWidth;
      const winHeight = window.innerHeight;
      return { x: Math.max(20, winWidth / 2 - 400), y: Math.max(20, winHeight / 2 - 350) };
  });

  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number, y: number } | null>(null);
  const windowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && dragStartRef.current) {
        const dx = e.clientX - dragStartRef.current.x;
        const dy = e.clientY - dragStartRef.current.y;
        
        setPosition(prev => {
          let nextX = prev.x + dx;
          let nextY = prev.y + dy;

          if (windowRef.current) {
            const width = windowRef.current.offsetWidth;
            const height = windowRef.current.offsetHeight;
            const maxX = window.innerWidth - width;
            const maxY = window.innerHeight - height;

            nextX = Math.max(0, Math.min(nextX, maxX));
            nextY = Math.max(0, Math.min(nextY, maxY));
          }

          return {
            x: nextX,
            y: nextY
          };
        });
        
        dragStartRef.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragStartRef.current = null;
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  return (
    <div 
      ref={windowRef}
      className={`fixed bg-white shadow-2xl border border-slate-300 rounded-lg flex flex-col z-[60] font-waze animate-fade-in ${className}`}
      style={{ 
        left: position.x, 
        top: position.y,
        userSelect: isDragging ? 'none' : 'auto'
      }}
      onWheel={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
        {/* Drag Handle / Header */}
        <div 
          className="p-4 bg-slate-900 text-white flex justify-between items-center flex-shrink-0 border-b-4 border-amber-500 cursor-move rounded-t-lg"
          onMouseDown={handleMouseDown}
        >
            <div className="flex flex-col pointer-events-none">
                <span className="font-news text-xl font-black uppercase tracking-wider">{title}</span>
                {subtitle && <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{subtitle}</span>}
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); onClose(); }} 
              className="text-slate-400 hover:text-white text-xl transition-colors cursor-pointer"
            >
              ×
            </button>
        </div>

        {/* Content */}
        <div className="flex-grow bg-slate-50 relative h-full rounded-b-lg flex flex-col">
            {children}
        </div>
    </div>
  );
};

export default DraggableWindow;
