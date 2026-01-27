
import React from 'react';

interface MyComputerProps {
    onClose: () => void;
    hasComputer: boolean;
}

const MyComputer: React.FC<MyComputerProps> = ({ onClose, hasComputer }) => {
    return (
        <div className="absolute inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center font-sans select-none animate-fade-in p-8">
            {/* 90s Window Frame */}
            <div className="bg-[#c0c0c0] p-1 border-t-2 border-l-2 border-white border-b-2 border-r-2 border-black shadow-[10px_10px_0_rgba(0,0,0,0.5)] w-full max-w-4xl h-[600px] flex flex-col relative">
                
                {/* Title Bar */}
                <div className="bg-[#000080] px-2 py-1 flex justify-between items-center mb-1 cursor-default">
                    <div className="flex items-center gap-2">
                         {/* Simple icon using emoji or base64 if needed, keeping it simple */}
                         <div className="w-4 h-4 bg-white border border-gray-500 flex items-center justify-center text-[10px]">💻</div>
                         <span className="text-white font-bold text-sm tracking-wide">My Computer</span>
                    </div>
                    <button 
                        onClick={onClose}
                        className="bg-[#c0c0c0] border-t border-l border-white border-b border-r border-black w-5 h-5 flex items-center justify-center text-xs font-bold active:border-t-black active:border-l-black active:border-b-white active:border-r-white focus:outline-none"
                    >
                        ✕
                    </button>
                </div>

                {/* Menu Bar */}
                <div className="flex gap-4 px-2 text-sm mb-1 text-black">
                    <span className="underline cursor-pointer hover:bg-blue-800 hover:text-white px-1">F</span>ile
                    <span className="underline cursor-pointer hover:bg-blue-800 hover:text-white px-1">E</span>dit
                    <span className="underline cursor-pointer hover:bg-blue-800 hover:text-white px-1">V</span>iew
                    <span className="underline cursor-pointer hover:bg-blue-800 hover:text-white px-1">H</span>elp
                </div>

                {/* Main Content Area - White Inset */}
                <div className="flex-grow bg-white border-2 border-t-black border-l-black border-b-white border-r-white p-8 relative overflow-hidden flex flex-col items-center justify-center shadow-inner">
                    
                    {hasComputer ? (
                        <div className="text-center">
                            <h1 className="text-4xl font-black mb-4 font-mono text-green-600">SYSTEM READY</h1>
                            <p className="font-mono text-black">C:\>_</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-8 opacity-80">
                            {/* Empty Slot Visual */}
                            <div className="w-64 h-64 border-4 border-dashed border-gray-400 rounded-lg flex flex-col items-center justify-center bg-gray-50 relative group transition-colors hover:bg-gray-100 hover:border-gray-500 cursor-pointer">
                                <div className="text-8xl text-gray-300 mb-4 group-hover:scale-110 transition-transform">🖥️</div>
                                <div className="text-xs font-black text-gray-400 uppercase tracking-widest bg-white px-2 py-1 border border-gray-300">System Unit Missing</div>
                            </div>
                            
                            <div className="bg-[#ffffe1] border border-black p-4 shadow-[4px_4px_0px_rgba(0,0,0,0.2)] text-xs font-mono max-w-md text-center">
                                <p className="mb-2 font-bold text-red-600 text-sm">⚠ HARDWARE ERROR 404</p>
                                <p className="mb-1 text-black">No Personal Computer detected in this sector.</p>
                                <p className="text-black">Please acquire a [System Unit] to access NetLink.</p>
                            </div>
                        </div>
                    )}
                    
                </div>

                {/* Status Bar */}
                <div className="mt-1 border-t border-gray-400 pt-1 flex justify-between text-xs text-black px-1 font-sans">
                    <div>0 object(s)</div>
                    <div>0 bytes</div>
                </div>
            </div>
        </div>
    );
};

export default MyComputer;
