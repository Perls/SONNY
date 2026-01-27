
import React, { useState } from 'react';
import { Holding, CrewMember, ClassType } from '../types';
import DealerOperations from './operations/DealerOperations';
import ThugOperations from './operations/ThugOperations';
import SmugglerOperations from './operations/SmugglerOperations';
import EntertainerOperations from './operations/EntertainerOperations';
import HustlerOperations from './operations/HustlerOperations';

interface HoldingsDrawerProps {
  holdings: Holding[];
  boss: CrewMember;
}

const HoldingsDrawer: React.FC<HoldingsDrawerProps> = ({ holdings, boss }) => {
  const [activeTab, setActiveTab] = useState<'real_estate' | 'operations'>('operations');
  
  const totalIncome = holdings.reduce((acc, h) => acc + h.income, 0);

  // Filter Holdings
  const realEstateHoldings = holdings.filter(h => h.type !== 'corner');

  const renderClassOperations = () => {
      switch (boss.classType) {
          case ClassType.Dealer:
              return <DealerOperations holdings={holdings} />;
          case ClassType.Thug:
              return <ThugOperations holdings={holdings} />;
          case ClassType.Smuggler:
              return <SmugglerOperations />;
          case ClassType.Hustler:
              return <HustlerOperations />;
          case ClassType.Entertainer:
              return <EntertainerOperations />;
          default:
              return <div>Unknown Class</div>;
      }
  };

  return (
    <div className="h-full bg-slate-50 flex flex-col font-waze overflow-hidden">
        
        {/* Header Stats */}
        <div className="bg-slate-900 text-white p-6 pb-0 flex flex-col shadow-lg z-10 shrink-0">
             <div className="flex justify-end gap-12 mb-6">
                 <div className="text-right">
                     <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Properties</div>
                     <div className="text-2xl font-black text-white leading-none">{holdings.length}</div>
                 </div>
                 <div className="text-right">
                     <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Daily Income</div>
                     <div className="text-2xl font-black text-emerald-400 font-mono leading-none">N$ {totalIncome.toLocaleString()}</div>
                 </div>
             </div>

             {/* Tabs */}
             <div className="flex gap-1">
                 <button
                    onClick={() => setActiveTab('operations')}
                    className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-t-lg transition-colors border-t-2 border-x-2 
                        ${activeTab === 'operations' 
                            ? 'bg-slate-50 text-slate-900 border-slate-50' 
                            : 'bg-slate-800 text-slate-500 border-slate-800 hover:bg-slate-700 hover:text-slate-300'
                        }
                    `}
                 >
                     Operations
                 </button>
                 <button
                    onClick={() => setActiveTab('real_estate')}
                    className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-t-lg transition-colors border-t-2 border-x-2 
                        ${activeTab === 'real_estate' 
                            ? 'bg-slate-50 text-slate-900 border-slate-50' 
                            : 'bg-slate-800 text-slate-500 border-slate-800 hover:bg-slate-700 hover:text-slate-300'
                        }
                    `}
                 >
                     Real Estate
                 </button>
             </div>
        </div>

        {/* Content Area - Flex Col with Justify Start ensures top anchoring */}
        <div className="flex-grow p-6 overflow-y-auto custom-scrollbar bg-slate-50 flex flex-col justify-start">
            
            {activeTab === 'real_estate' && (
                <>
                    {realEstateHoldings.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                            <span className="text-6xl mb-4">🏢</span>
                            <span className="text-sm font-bold uppercase tracking-widest">No Properties Acquired</span>
                            <span className="text-xs mt-2">Purchase buildings on the map to expand your empire.</span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
                            {realEstateHoldings.map(holding => {
                                const isApartment = !!holding.unitId;
                                return (
                                    <div key={holding.id} className="bg-white border-2 border-slate-200 rounded-xl p-4 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all group">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Grid {holding.x}-{holding.y}</div>
                                                <h3 className="font-bold text-lg text-slate-800 leading-none">{holding.name}</h3>
                                            </div>
                                            <div className="w-8 h-8 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl border border-emerald-200">
                                                {holding.type === 'headquarters' ? '★' : isApartment ? '🚪' : '🏢'}
                                            </div>
                                        </div>
                                        
                                        <div className="flex gap-2 mb-4">
                                            <span className="bg-slate-100 text-slate-600 text-[10px] font-bold uppercase px-2 py-1 rounded border border-slate-200">
                                                Lvl {holding.level}
                                            </span>
                                            <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded border ${isApartment ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                                {isApartment ? 'Apartment' : holding.type}
                                            </span>
                                        </div>

                                        <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">Daily Revenue</span>
                                            <span className="font-mono font-bold text-emerald-600">N$ {holding.income}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}

            {activeTab === 'operations' && (
                <div className="animate-fade-in w-full h-full">
                    {renderClassOperations()}
                </div>
            )}

        </div>
    </div>
  );
};

export default HoldingsDrawer;
