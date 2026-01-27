
import React from 'react';

interface DailyTimesProps {
  date: Date;
}

const HEADLINES = [
  "MAYOR DECLARES WAR ON PIGEONS, LOSES",
  "LOCAL MAN SUES PIZZA RAT FOR COPYRIGHT INFRINGEMENT",
  "NEW TAX ON 'LOOKIN' AT ME FUNNY' PROPOSED",
  "SUBWAY DELAYS CAUSED BY 'GHOST TRAIN' SIGHTING",
  "WALL STREET TRADER BETS IT ALL ON BAGELS",
  "HOT DOG CART DECLARES INDEPENDENCE FROM CITY",
  "SCIENTISTS CONFIRM: TIME MOVES SLOWER IN THE DMV",
  "LIBERTY ISLAND TO BE CONVERTED INTO CONDO COMPLEX?",
  "FASHION WEEK: TRASH BAGS ARE THE NEW BLACK",
  "TAXI DRIVERS NOW ACCEPTING INSULTS AS PAYMENT"
];

const CRIME_HEADLINES = [
  "Cartel Activity Spikes in Queens",
  "Unknown Vigilante Cleaning Up Hell's Kitchen",
  "Police Chief: 'We're doing our best, okay?'",
  "Docks Raid Yields 500lbs of 'Gouda'",
  "Gang War Erupts Over Parking Spot"
];

const MARKET_TICKER = [
  { code: "SYNTH", val: 145.20, change: "+5.4%" },
  { code: "AMMO", val: 89.50, change: "-2.1%" },
  { code: "MEDS", val: 210.00, change: "+12.8%" },
  { code: "TECH", val: 305.75, change: "+0.5%" },
  { code: "GOLD", val: 1890.10, change: "-0.2%" },
];

const OBITUARIES = [
    { name: "Vinny 'The Wall'", cause: "Stood too close to a hydrant", age: 34 },
    { name: "Slick Rick", cause: "Slipped on a banana peel during a heist", age: 28 },
    { name: "Big Tony", cause: "Mistook a grenade for an apple", age: 41 },
    { name: "Johnny 'No-Luck'", cause: "Lost a bet with a speeding train", age: 22 },
    { name: "Frankie Four-Fingers", cause: "Found out why he only had four fingers", age: 39 },
    { name: "Sal the Snitch", cause: "Natural causes (Lead poisoning)", age: 45 }
];

const DailyTimes: React.FC<DailyTimesProps> = ({ date }) => {
  const day = date.getDate();
  const headline = HEADLINES[day % HEADLINES.length];
  
  // Pick random obituaries based on the date seed
  const todaysObituaries = OBITUARIES.filter((_, i) => (i + day) % 2 === 0);

  return (
    <div className="h-full bg-[#fdfbf7] text-slate-900 font-serif flex flex-col overflow-hidden relative">
        {/* Paper Texture Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-50" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")' }}></div>
        
        {/* Header */}
        <div className="border-b-4 border-slate-900 p-6 pb-4 text-center relative z-10">
            <h1 className="text-6xl font-black uppercase tracking-tighter mb-2 font-news" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.1)' }}>The Daily Times</h1>
            <div className="flex justify-between items-center border-t-2 border-b-2 border-slate-900 py-1 mt-2">
                <span className="text-xs font-bold uppercase tracking-widest">{date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                <span className="text-xs font-bold uppercase tracking-widest">Price: N$ 2.00</span>
                <span className="text-xs font-bold uppercase tracking-widest">Vol. {Math.abs(date.getFullYear() - 1900)} No. {date.getDate()}</span>
            </div>
        </div>

        {/* Content Grid */}
        <div className="flex-grow p-6 grid grid-cols-12 gap-6 overflow-y-auto custom-scrollbar relative z-10">
            
            {/* LEFT COL: NOSTALGIA/MEME NEWS (5 cols) */}
            <div className="col-span-5 flex flex-col gap-6 border-r border-slate-300 pr-6">
                <article>
                    <h2 className="text-4xl font-black leading-none mb-3 font-news italic">"{headline}"</h2>
                    <div className="flex gap-4 mb-4">
                        <div className="w-1/3 pt-1">
                             <div className="w-full aspect-[3/4] bg-slate-200 grayscale contrast-125 brightness-90 relative overflow-hidden border border-slate-800">
                                 <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${day}news`} className="w-full h-full object-cover scale-150" />
                                 <div className="absolute inset-0 bg-yellow-900/10 mix-blend-multiply"></div>
                             </div>
                             <p className="text-[9px] mt-1 font-bold text-slate-500 uppercase">Fig 1. The Suspect</p>
                        </div>
                        <div className="w-2/3 text-sm leading-relaxed text-justify space-y-2">
                            <p className="first-letter:text-4xl first-letter:font-black first-letter:mr-1 first-letter:float-left">
                                City officials were left baffled today after incidents reported across the five boroughs defied all logic. 
                                "It's standard New York," said a local hot dog vendor who witnessed the event. "One minute you're selling a frank, 
                                the next minute the sky is purple and everyone's walking backwards."
                            </p>
                            <p>
                                The Mayor's office has declined to comment, citing "ongoing investigations" and "a general lack of understanding of what is happening."
                                Meanwhile, rents in the affected areas have somehow increased by 15%.
                            </p>
                            <p>
                                In other news, the pigeons in Central Park have organized a union. Demands include better crumbs and fewer tourists.
                            </p>
                        </div>
                    </div>
                </article>

                <div className="border-t-2 border-slate-900 pt-4">
                     <h3 className="font-bold uppercase text-lg mb-2">Weather Report</h3>
                     <div className="flex items-center justify-between bg-slate-100 p-4 border border-slate-300">
                         <div className="text-4xl">🌧️</div>
                         <div className="text-right">
                             <div className="font-black text-xl">ACID RAIN</div>
                             <div className="text-xs">Chance of corrosion: 80%</div>
                         </div>
                     </div>
                </div>
            </div>

            {/* MID COL: CRIME WATCH (4 cols) */}
            <div className="col-span-4 flex flex-col gap-6 border-r border-slate-300 pr-6">
                <div className="bg-slate-900 text-white p-2 text-center font-bold uppercase tracking-widest text-xs">
                    Crime Blotter
                </div>
                
                <div className="space-y-4">
                    {CRIME_HEADLINES.map((h, i) => (
                        <div key={i} className="border-b border-slate-200 pb-2 last:border-0">
                            <h4 className="font-bold text-sm leading-tight mb-1">{h}</h4>
                            <span className="text-[10px] text-slate-500 uppercase tracking-wide">Page {i + 4}</span>
                        </div>
                    ))}
                </div>

                <div className="mt-auto bg-slate-100 p-4 border border-slate-300 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-1 bg-red-600 text-white text-[9px] font-bold uppercase">Wanted</div>
                    <div className="flex gap-3">
                        <div className="w-16 h-16 bg-white border border-slate-300">
                             <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Villain" className="w-full h-full object-cover grayscale" />
                        </div>
                        <div>
                            <div className="font-black text-lg leading-none uppercase">The Shadow</div>
                            <div className="text-xs mb-1">Grand Larceny</div>
                            <div className="text-xs font-bold text-red-700">Reward: N$ 5,000</div>
                        </div>
                    </div>
                    {/* Placeholder Chart */}
                    <div className="mt-3 h-24 w-full flex items-end gap-1 opacity-50">
                        {[40, 60, 30, 80, 50, 90, 70].map((h, i) => (
                            <div key={i} className="bg-slate-800 flex-1" style={{ height: `${h}%` }}></div>
                        ))}
                    </div>
                    <div className="text-center text-[9px] font-bold uppercase mt-1">Weekly Crime Rate</div>
                </div>
            </div>

            {/* RIGHT COL: MARKETS & OBITUARIES (3 cols) */}
            <div className="col-span-3 flex flex-col gap-4">
                <div className="bg-emerald-900 text-white p-2 text-center font-bold uppercase tracking-widest text-xs">
                    Market Watch
                </div>

                <div className="space-y-1">
                    {MARKET_TICKER.map((item, i) => (
                        <div key={i} className="flex justify-between items-center py-2 border-b border-slate-200 font-mono text-xs">
                            <span className="font-bold">{item.code}</span>
                            <span>{item.val.toFixed(2)}</span>
                            <span className={item.change.startsWith('+') ? 'text-emerald-700 font-bold' : 'text-red-700 font-bold'}>
                                {item.change}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="mt-6 border-2 border-slate-900 p-2">
                    <div className="bg-slate-200 h-32 w-full flex items-center justify-center text-center p-4">
                         <div className="opacity-50">
                             <div className="text-2xl mb-1">💊</div>
                             <div className="text-[10px] font-bold uppercase">Commodities Exchange</div>
                             <div className="text-[9px] italic">(Coming Soon)</div>
                         </div>
                    </div>
                </div>
                
                {/* OBITUARIES SECTION */}
                <div className="mt-auto border-t-4 border-black pt-2">
                    <div className="bg-black text-white p-1 text-center font-black uppercase text-xs mb-2">
                        Yesterday's Departed
                    </div>
                    <div className="space-y-2 text-[10px]">
                        {todaysObituaries.map((obit, idx) => (
                            <div key={idx} className="border-b border-slate-300 pb-1 last:border-0">
                                <div className="font-bold uppercase">{obit.name}, {obit.age}</div>
                                <div className="italic text-slate-600">"{obit.cause}"</div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

        </div>
    </div>
  );
};

export default DailyTimes;
