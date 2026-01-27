
import React, { useMemo } from 'react';
import { useGameEngine } from '../contexts/GameEngineContext';

interface ConsiglierePanelProps {
  message: string;
  isOpen: boolean;
  onClose: () => void;
}

const ConsiglierePanel: React.FC<ConsiglierePanelProps> = ({ message, isOpen, onClose }) => {
  const { consigliereQueue, handleNextConsigliere } = useGameEngine();
  
  if (!isOpen) return null;

  // Use current message from queue if available, fallback to prop message (legacy)
  const currentMessage = consigliereQueue.length > 0 ? consigliereQueue[0] : message;
  const queueCount = consigliereQueue.length;

  const handleAction = () => {
      handleNextConsigliere();
  };

  // Determine mood based on message content
  const avatarConfig = useMemo(() => {
      const lower = currentMessage.toLowerCase();
      let mouth = 'serious';
      let eyebrows = 'default';
      let eyes = 'default';

      // Positive / Greedy
      if (
          lower.includes('money') || lower.includes('profit') || lower.includes('gain') || 
          lower.includes('win') || lower.includes('won') || lower.includes('success') || 
          lower.includes('smart') || lower.includes('good') || lower.includes('respect')
      ) {
          mouth = 'smile';
          eyebrows = 'raised';
      }
      
      // Negative / Warning
      else if (
          lower.includes('lost') || lower.includes('fail') || lower.includes('dead') || 
          lower.includes('killed') || lower.includes('police') || lower.includes('heat') || 
          lower.includes('shame') || lower.includes('warning') || lower.includes('danger') ||
          lower.includes('tax') || lower.includes('arrest')
      ) {
          mouth = 'sad';
          eyebrows = 'concerned';
          eyes = 'squint';
      }
      
      // Aggressive / Action
      else if (
          lower.includes('fight') || lower.includes('attack') || lower.includes('kill') || 
          lower.includes('hit') || lower.includes('gun') || lower.includes('war')
      ) {
          mouth = 'grimace';
          eyebrows = 'angry';
      }

      return `&mouth=${mouth}&eyebrows=${eyebrows}&eyes=${eyes}`;
  }, [currentMessage]);

  return (
    <div className="fixed bottom-28 left-8 z-50 animate-slide-up origin-bottom-left">
        
        {/* Main Dialogue Container - Smaller footprint */}
        <div className="bg-white border-2 border-slate-300 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.2)] w-[380px] flex overflow-visible relative">
            
            {/* Advisor Portrait (Smaller) */}
            <div className="absolute -left-6 -bottom-3 w-20 h-20 rounded-full bg-slate-100 border-2 border-white shadow-md z-20 overflow-hidden">
                <img 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Marco${avatarConfig}`} 
                    className="w-full h-full object-cover scale-110 translate-y-1"
                    alt="Consigliere"
                />
            </div>

            {/* Content Area */}
            <div className="flex-grow pl-16 pr-8 py-4 text-slate-800 relative z-10 flex flex-col min-h-[100px]">
                {/* Header */}
                <div className="flex justify-between items-center mb-2 border-b border-slate-100 pb-1">
                    <div className="flex flex-col">
                        <span className="text-amber-600 font-black font-news text-sm uppercase tracking-widest leading-none">The Consigliere</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {queueCount > 1 && (
                            <span className="text-[8px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200 animate-pulse">
                                {queueCount - 1} MORE
                            </span>
                        )}
                        <button 
                            onClick={onClose}
                            className="text-slate-300 hover:text-red-500 transition-colors text-sm font-black leading-none"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Text Body - No quotes */}
                <div className="text-xs font-serif font-bold leading-relaxed italic text-slate-600 flex-grow flex items-center">
                    {currentMessage}
                </div>

                {/* Footer Action - Only shows if there is a queue */}
                {queueCount > 1 && (
                    <div className="mt-2 flex justify-end h-6 items-center">
                        <button 
                            onClick={handleAction}
                            className="text-[8px] font-black uppercase tracking-widest flex items-center gap-1 group transition-all px-3 py-1 rounded-full border border-slate-300 bg-slate-50 hover:bg-amber-50 hover:border-amber-400 hover:text-amber-700 shadow-sm"
                        >
                            Next Tip <span className="text-[8px] group-hover:translate-x-1 transition-transform">➜</span>
                        </button>
                    </div>
                )}
            </div>
            
            {/* Decorative Corner - Light Gray */}
            <div className="absolute top-2 right-2 w-4 h-4 border-t border-r border-slate-200 rounded-tr opacity-60"></div>
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-slate-200 rounded-br opacity-60"></div>
        </div>
    </div>
  );
};

export default ConsiglierePanel;
