
import React, { useState, useRef, useEffect } from 'react';
import { Tag, MapTagData } from '../types';

interface TagsDrawerProps {
  tags: Tag[];
  mapTags: MapTagData;
  onSaveTag: (tag: Tag) => void;
  onDeleteTag: (tagId: string) => void;
}

const RUMORS = [
    "Word is the City Cleanup Crew is sweeping Block 4.",
    "A rival crew from Queens was seen tagging over your work.",
    "The cops are cracking down on vandalism near the stadium.",
    "Your tag on 5th Ave is gaining respect.",
    "Someone vandalized your piece on the bridge.",
    "The streets are quiet. Your marks remain untouched.",
    "A legendary tagger 'Ghost' was seen admiring your work.",
    "Rain washed away the chalk, but the paint stays."
];

const COLORS = [
    '#000000', // Black
    '#ffffff', // White
    '#ef4444', // Red
    '#3b82f6', // Blue
    '#eab308', // Yellow
    '#10b981', // Green
    '#a855f7', // Purple
    '#f97316', // Orange
];

const FONTS = [
    { label: "BLOCKBUSTER", value: "Impact, sans-serif" },
    { label: "SLOPPY JOE", value: "'Brush Script MT', cursive" },
    { label: "SNITCH NOTE", value: "'Courier New', monospace" },
    { label: "TOY TAG", value: "Arial, sans-serif" },
    { label: "FANCY PANTS", value: "'Playfair Display SC', serif" },
    { label: "BUBBLE GUM", value: "'Nunito', sans-serif" },
];

const TagsDrawer: React.FC<TagsDrawerProps> = ({ tags, mapTags, onSaveTag, onDeleteTag }) => {
  const [view, setView] = useState<'gallery' | 'editor'>('gallery');
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [rumor] = useState(RUMORS[Math.floor(Math.random() * RUMORS.length)]);
  
  // Editor State
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [activeTool, setActiveTool] = useState<'brush' | 'text'>('brush');
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  
  // Text Tool State
  const [textInput, setTextInput] = useState('TAG');
  const [fontIndex, setFontIndex] = useState(0);
  const [isAllCaps, setIsAllCaps] = useState(true);

  // Initialize Canvas
  useEffect(() => {
      if (view === 'editor' && canvasRef.current) {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          if (ctx) {
              ctx.fillStyle = '#e2e8f0'; // Slate-200 background
              ctx.fillRect(0, 0, 100, 100);
              setHistory([]); // Reset history
          }
      }
  }, [view]);

  const saveHistory = () => {
      if (canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) {
              const snapshot = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
              setHistory(prev => [...prev, snapshot]);
          }
      }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      if (activeTool === 'text') {
          // TEXT PLACEMENT
          if (!textInput.trim()) return;
          saveHistory();
          
          const rect = canvas.getBoundingClientRect();
          const scaleX = canvas.width / rect.width;
          const scaleY = canvas.height / rect.height;
          const x = (e.clientX - rect.left) * scaleX;
          const y = (e.clientY - rect.top) * scaleY;

          const ctx = canvas.getContext('2d');
          if (ctx) {
              ctx.fillStyle = selectedColor;
              ctx.font = `bold 16px ${FONTS[fontIndex].value}`;
              // Center text on click
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(textInput, x, y);
          }
      } else {
          // BRUSH START
          saveHistory();
          setIsDrawing(true);
          draw(e);
      }
  };

  const stopDrawing = () => {
      setIsDrawing(false);
  };

  const draw = (e: React.MouseEvent) => {
      if (!isDrawing && e.type !== 'mousedown') return;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      const x = Math.floor((e.clientX - rect.left) * scaleX);
      const y = Math.floor((e.clientY - rect.top) * scaleY);

      const ctx = canvas.getContext('2d');
      if (ctx) {
          ctx.fillStyle = selectedColor;
          ctx.fillRect(x, y, 4, 4); // 4x4 brush size for 100x100 grid
      }
  };

  const handleUndo = () => {
      if (history.length > 0 && canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) {
              const previousState = history[history.length - 1];
              ctx.putImageData(previousState, 0, 0);
              setHistory(prev => prev.slice(0, -1));
          }
      }
  };

  const handleSave = () => {
      if (canvasRef.current) {
          const dataUri = canvasRef.current.toDataURL();
          const newTag: Tag = {
              id: Math.random().toString(36).substr(2, 9),
              name: `Tag #${tags.length + 1}`,
              dataUri: dataUri,
              status: 'active'
          };
          onSaveTag(newTag);
          setView('gallery');
      }
  };

  const handleTagClick = (tag: Tag) => {
      setSelectedTag(tag);
  };

  const handleCloseDetail = () => {
      setSelectedTag(null);
  };

  const handleDelete = () => {
      if (selectedTag) {
          onDeleteTag(selectedTag.id);
          handleCloseDetail();
      }
  };

  const handleTextInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setTextInput(isAllCaps ? val.toUpperCase() : val);
  };

  const toggleAllCaps = () => {
      setIsAllCaps(!isAllCaps);
      setTextInput(prev => !isAllCaps ? prev.toUpperCase() : prev.toLowerCase());
  };

  const usageCount = selectedTag && mapTags ? Object.values(mapTags).filter((t: Tag) => t.id === selectedTag.id).length : 0;

  return (
    <div className="h-full flex flex-col bg-slate-50 font-waze overflow-hidden relative">
        
        {/* VIEW 1: GALLERY */}
        {view === 'gallery' && (
            <>
                {/* Header / Rumor */}
                <div className="p-6 bg-slate-900 text-white shadow-md z-10 flex-shrink-0">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-2xl font-black font-news uppercase tracking-widest text-amber-500">Street Gallery</h3>
                        <span className="text-[10px] font-bold bg-slate-800 px-2 py-1 rounded border border-slate-700">
                            {tags.length} / 10 Slots
                        </span>
                    </div>
                    
                    <div className="bg-slate-800/50 border border-slate-700 p-3 rounded-lg flex gap-3 items-start">
                        <span className="text-xl">🗣️</span>
                        <div>
                            <div className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Rumor Mill</div>
                            <p className="text-xs text-slate-300 italic font-serif">"{rumor}"</p>
                        </div>
                    </div>
                </div>

                {/* Grid */}
                <div className="flex-grow p-6 overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                        {/* Existing Tags */}
                        {tags.map((tag) => (
                            <div 
                                key={tag.id} 
                                onClick={() => handleTagClick(tag)}
                                className="aspect-square bg-white border-4 border-slate-200 shadow-sm rounded-xl overflow-hidden relative group cursor-pointer hover:border-amber-400 hover:shadow-lg transition-all"
                            >
                                <img src={tag.dataUri} className="w-full h-full object-cover rendering-pixelated" alt={tag.name} />
                                {tag.status === 'vandalized' && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                        <span className="text-red-500 font-black text-4xl">X</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-white font-bold uppercase text-[10px] bg-black/50 px-2 py-1 rounded border border-white/30">View</span>
                                </div>
                            </div>
                        ))}

                        {/* New Tag Button */}
                        {tags.length < 10 && (
                            <button 
                                onClick={() => setView('editor')}
                                className="aspect-square border-4 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:text-amber-500 hover:border-amber-400 hover:bg-amber-50 transition-all group"
                            >
                                <span className="text-4xl mb-1 group-hover:scale-110 transition-transform">+</span>
                                <span className="text-[9px] font-black uppercase tracking-widest">New Tag</span>
                            </button>
                        )}
                        
                        {/* Empty Slots */}
                        {[...Array(Math.max(0, 10 - tags.length - 1))].map((_, i) => (
                            <div key={`empty-${i}`} className="aspect-square bg-slate-100/50 border-2 border-slate-200 rounded-xl opacity-50"></div>
                        ))}
                    </div>
                </div>
            </>
        )}

        {/* VIEW 2: EDITOR */}
        {view === 'editor' && (
            <div className="h-full flex flex-col">
                <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center shadow-sm z-10">
                    <h3 className="text-lg font-black font-news uppercase text-slate-800">New Masterpiece</h3>
                    <div className="flex gap-2">
                        <button onClick={() => setView('gallery')} className="text-xs font-bold uppercase text-slate-500 hover:text-slate-800 px-3 py-1">Cancel</button>
                        <button onClick={handleSave} className="text-xs font-bold uppercase bg-slate-900 text-amber-500 px-4 py-2 rounded hover:bg-slate-800 shadow-lg">Burn It</button>
                    </div>
                </div>

                <div className="flex-grow bg-slate-200 flex flex-col items-center justify-center p-8 relative gap-4">
                    
                    {/* TEXT CONFIG BAR (Visible when Text Tool Active) */}
                    {activeTool === 'text' && (
                        <div className="bg-white p-4 rounded-xl shadow-xl flex flex-col gap-3 animate-slide-up border-2 border-slate-300 mb-8 w-full max-w-[320px]">
                            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">TAGGER TOOL</span>
                                <button 
                                    onClick={toggleAllCaps}
                                    className={`text-[8px] font-bold px-2 py-1 rounded border uppercase transition-colors ${isAllCaps ? 'bg-amber-100 text-amber-700 border-amber-300' : 'bg-slate-100 text-slate-500'}`}
                                >
                                    {isAllCaps ? 'CAPS ON' : 'Aa Mixed'}
                                </button>
                            </div>
                            
                            {/* Input Area */}
                            <input 
                                type="text" 
                                value={textInput}
                                onChange={handleTextInputChange}
                                className="w-full bg-slate-100 border-2 border-slate-200 rounded-lg px-3 py-3 text-lg font-bold text-slate-800 focus:border-amber-500 outline-none text-center transition-all placeholder:text-slate-300"
                                maxLength={15}
                                placeholder="TYPE HERE"
                                style={{ fontFamily: FONTS[fontIndex].value }}
                            />

                            {/* Font Selector */}
                            <div className="flex justify-between items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-100">
                                <button 
                                    onClick={() => setFontIndex((prev) => (prev - 1 + FONTS.length) % FONTS.length)}
                                    className="w-8 h-8 flex items-center justify-center bg-white hover:bg-slate-100 rounded border border-slate-200 text-slate-600 font-bold shadow-sm transition-all"
                                >
                                    ←
                                </button>
                                <div className="text-[10px] font-black uppercase text-slate-600 tracking-wider bg-white px-3 py-1 rounded border border-slate-200 min-w-[120px] text-center">
                                    {FONTS[fontIndex].label}
                                </div>
                                <button 
                                    onClick={() => setFontIndex((prev) => (prev + 1) % FONTS.length)}
                                    className="w-8 h-8 flex items-center justify-center bg-white hover:bg-slate-100 rounded border border-slate-200 text-slate-600 font-bold shadow-sm transition-all"
                                >
                                    →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Canvas Container */}
                    <div className={`bg-white p-2 shadow-2xl border-4 border-slate-900 rounded-sm relative ${activeTool === 'text' ? 'cursor-text' : 'cursor-crosshair'}`}>
                        <canvas 
                            ref={canvasRef}
                            width={100}
                            height={100}
                            className="w-[300px] h-[300px] rendering-pixelated bg-slate-100"
                            onMouseDown={handleMouseDown}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                        />
                        <div className="absolute -top-6 left-0 text-[10px] font-black uppercase text-slate-500 tracking-widest">100x100 PX</div>
                    </div>

                    {/* Tools */}
                    <div className="bg-white rounded-full px-6 py-3 shadow-xl flex items-center gap-4 border border-slate-200">
                        {COLORS.map(color => (
                            <button
                                key={color}
                                onClick={() => setSelectedColor(color)}
                                className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${selectedColor === color ? 'border-slate-900 scale-110 shadow-md ring-2 ring-slate-200' : 'border-slate-200'}`}
                                style={{ backgroundColor: color }}
                            />
                        ))}
                        
                        <div className="w-px h-8 bg-slate-200 mx-2"></div>
                        
                        {/* Text Tool */}
                        <button 
                            onClick={() => setActiveTool('text')}
                            className={`flex flex-col items-center justify-center w-10 h-10 rounded-lg border-2 font-black font-news transition-all 
                                ${activeTool === 'text' ? 'bg-slate-800 text-white border-slate-900 shadow-md' : 'border-slate-200 hover:bg-slate-50 text-slate-700'}`}
                            title="Text Tool"
                        >
                            T
                        </button>

                        {/* Brush Tool (Reset) */}
                        <button 
                            onClick={() => setActiveTool('brush')}
                            className={`flex flex-col items-center justify-center w-10 h-10 rounded-lg border-2 transition-all 
                                ${activeTool === 'brush' && selectedColor !== '#e2e8f0' ? 'bg-slate-800 text-white border-slate-900 shadow-md' : 'border-slate-200 hover:bg-slate-50 text-slate-700'}`}
                            title="Brush"
                        >
                            ✏️
                        </button>

                        {/* Eraser */}
                        <button 
                            onClick={() => { setSelectedColor('#e2e8f0'); setActiveTool('brush'); }} 
                            className={`flex flex-col items-center justify-center w-10 h-10 rounded-lg border-2 transition-all
                                ${selectedColor === '#e2e8f0' && activeTool === 'brush' ? 'bg-slate-100 border-slate-900 text-slate-900 shadow-inner' : 'border-slate-200 hover:bg-slate-50 text-slate-400'}`}
                            title="Eraser"
                        >
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                <path d="M15.14,3C14.63,3 14.12,3.2 13.73,3.59L2.59,14.73C1.81,15.5 1.81,16.77 2.59,17.54L5.46,20.41C6.24,21.19 7.5,21.19 8.28,20.41L19.41,9.27C20.2,8.49 20.2,7.22 19.41,6.46L16.54,3.59C16.15,3.2 15.64,3 15.14,3M17,18L13.41,14.41L7.83,20L19,20V18H17Z" />
                            </svg>
                        </button>

                        <button 
                            onClick={handleUndo}
                            disabled={history.length === 0}
                            className={`flex flex-col items-center justify-center w-10 h-10 rounded-lg border-2 ${history.length === 0 ? 'border-slate-200 text-slate-300 cursor-not-allowed' : 'border-slate-200 hover:bg-slate-50 text-slate-700'}`}
                            title="Undo"
                        >
                            <span className="text-lg">↩️</span>
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* DETAIL OVERLAY */}
        {selectedTag && (
            <div className="absolute inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-8 animate-fade-in">
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-md animate-slide-up relative">
                    <button 
                        onClick={handleCloseDetail}
                        className="absolute top-2 right-2 w-8 h-8 bg-black/10 hover:bg-black/20 rounded-full flex items-center justify-center text-slate-600 font-bold z-10 transition-colors"
                    >
                        ✕
                    </button>

                    {/* Preview */}
                    <div className="bg-slate-200 aspect-square w-full relative flex items-center justify-center p-8">
                        <div className="bg-white p-2 shadow-xl border-2 border-slate-300">
                            <img src={selectedTag.dataUri} className="w-48 h-48 rendering-pixelated object-cover" />
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="p-6">
                        <div className="flex justify-between items-end mb-4">
                            <div>
                                <h4 className="text-xl font-black font-news text-slate-900 uppercase">{selectedTag.name}</h4>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status: <span className={selectedTag.status === 'active' ? 'text-emerald-500' : 'text-red-500'}>{selectedTag.status}</span></div>
                            </div>
                            <button 
                                onClick={handleDelete}
                                className="text-red-500 hover:text-red-700 font-bold uppercase text-[10px] tracking-widest border border-red-200 px-3 py-1.5 rounded hover:bg-red-50 transition-colors"
                            >
                                Delete Tag
                            </button>
                        </div>

                        {/* Usage Statistics - Replaces any Deploy/Spray button */}
                        <div className="border-t border-slate-100 pt-6 mt-2">
                            <div className="flex items-center justify-between p-4 bg-slate-50 border-2 border-slate-200 rounded-xl">
                                <div>
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">City-Wide Presence</div>
                                    <div className="text-xs font-bold text-slate-600">Total Uses</div>
                                </div>
                                <div className="text-3xl font-black font-news text-slate-900">{usageCount}</div>
                            </div>
                            {usageCount > 0 && (
                                <div className="mt-4 text-[10px] text-slate-400 text-center italic">
                                    "This piece is getting up all over town."
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )}

    </div>
  );
};

export default TagsDrawer;
