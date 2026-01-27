import React, { useEffect, useRef } from 'react';

interface RadioPlayerProps {
    channel: number;
}

const NEWS_STORIES = [
    "Local Construction Crisis: Cement Shortage Plunges Mob Into Panic. Reporting live from the Gowanus Canal, where contractors are blaming a sudden, catastrophic shortage of quick-drying cement for massive delays. Sources close to the Sanitation Department—who wish to remain anonymous, for obvious reasons—suggest that key organized labor figures are experiencing 'extreme logistical difficulties' in completing several vital 'infrastructure projects.' One anonymous sanitation worker claimed, 'The boys can't finish their work! It's an absolute nightmare. The cost of a single 80-pound bag of high-grade Quikrete is now higher than a studio apartment in Tribeca! We're running out of places to dispose of... old fixtures! Back to the river, I guess!'",
    "Beeper Industry Shocked by Pigeon-Related Downtime. The beeper market, which just two weeks ago was celebrating its all-time high in discreet communication, has been thrown into chaos. A massive swarm of aggressive, allegedly 'militant' pigeons descended on a midtown cellular transmission tower early this morning, causing an immediate outage for thousands of vital, time-sensitive numeric messages. Authorities say the pigeons were lured by a recently opened, high-quality artisanal pretzel stand next door to the tower. Analysts confirm: If you can't get ahold of your associate to tell him to meet you at the pier at midnight, blame the carbs.",
    "New York's Hottest Nightclub is Now a Laundry Mat. In completely baffling news, Spin Cycle, a 24-hour laundromat in Flushing, Queens, has officially replaced the Tunnel as the most exclusive nightspot in the city. Witnesses report lines stretching three blocks deep, filled with club kids attempting to gain entry past a gruff bouncer demanding: 'Proof of fabric softener and $40 cover.' The owner, who was wearing a leather jacket and polishing a washing machine, stated, 'It’s got everything: damp air, loud bass, and nobody can hear the negotiations over the noise of the dryers. Best place in the city to run a quiet operation.'",
    "Hair Gel Futures Crash: Wall Street Blames Volatile Mob Tastes. The commodities market for hair products saw its most volatile session in history as the price of industrial-strength hair gel, specifically the 'wet-look' formula, plunged 60% in fifteen minutes. Experts attribute the collapse to a perceived shift in trend among 'well-dressed gentlemen' towards a slicked-back, dryer look. One panicked broker shouted, 'Sell! Sell! If Tony doesn't use it, nobody uses it! We're all going bald and bankrupt!' The immediate market instability has been blamed entirely on a single influential tailor who switched from mousse to pomade.",
    "City Hall Bans Use of Oversized Suit Jackets as Weaponry. In a bizarre legislative move, Mayor Dinkins has signed an emergency ordinance banning the use of certain large, ill-fitting suit jackets for 'non-standard applications.' The new law comes after a series of incidents where large men were reportedly using their baggy, three-button, double-breasted jackets to successfully conceal anything from small firearms to entire sides of beef, making them a menace to public safety. Police warn that anyone caught with excessive shoulder padding could face immediate charges of 'conspiracy to hide a small sedan.'"
];

const RadioPlayer: React.FC<RadioPlayerProps> = ({ channel }) => {
    const audioCtxRef = useRef<AudioContext | null>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    useEffect(() => {
        // 1. Clean up previous
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        
        // 2. Setup Audio Context
        if (channel > 0 && channel < 4) {
            if (!audioCtxRef.current) {
                audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
            if (audioCtxRef.current.state === 'suspended') {
                audioCtxRef.current.resume();
            }
        }

        const ctx = audioCtxRef.current;

        // 3. Play Logic
        if (channel === 4) {
             // NEWS (Speech) - Recursive Playback with "Tuning In" simulation
             
             // Pick a random story to start with
             let currentStoryIdx = Math.floor(Math.random() * NEWS_STORIES.length);
             
             // Split story into approximate sentences for tuning granularity (finding . ! ?)
             const getSentences = (idx: number) => NEWS_STORIES[idx].match(/[^\.!\?]+[\.!\?]+/g) || [NEWS_STORIES[idx]];
             
             let currentSentences = getSentences(currentStoryIdx);
             
             // Simulate "tuning in": Start at a random sentence index within the story
             let currentSentenceIdx = Math.floor(Math.random() * currentSentences.length);

             const speakNext = () => {
                 if (currentSentenceIdx >= currentSentences.length) {
                     // Next Story
                     currentStoryIdx = (currentStoryIdx + 1) % NEWS_STORIES.length;
                     currentSentences = getSentences(currentStoryIdx);
                     currentSentenceIdx = 0;
                 }

                 const text = currentSentences[currentSentenceIdx];
                 if (!text) return;

                 const utterance = new SpeechSynthesisUtterance(text);
                 utterance.rate = 1.05; // Slightly fast news anchor speed
                 utterance.pitch = 0.95; // Slightly deeper authoritative tone
                 utterance.volume = 0.6; // Balanced volume
                 
                 utterance.onend = () => {
                     currentSentenceIdx++;
                     speakNext();
                 };
                 
                 activeUtteranceRef.current = utterance;
                 window.speechSynthesis.speak(utterance);
             };

             // Start the loop
             speakNext();

        } else if (ctx && channel > 0) {
            // MUSIC (Procedural MIDI-like)
            const playTone = (freq: number, type: OscillatorType, duration: number, vol: number = 0.05) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = type;
                osc.frequency.setValueAtTime(freq, ctx.currentTime);
                gain.gain.setValueAtTime(vol, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + duration);
            };

            // Start step at random position to simulate tuning in mid-song
            let step = Math.floor(Math.random() * 100); 

            if (channel === 1) {
                // ITALIAN (Mafia - Slow Minor Waltz - Triangle)
                const notes = [329.63, 311.13, 329.63, 311.13, 329.63, 246.94, 293.66, 261.63, 220.00]; 
                intervalRef.current = setInterval(() => {
                    const note = notes[step % notes.length];
                    playTone(note, 'triangle', 0.8, 0.05);
                    if (step % 3 === 0) playTone(note / 2, 'sine', 0.8, 0.08); // Bass note
                    step++;
                }, 600);
            } else if (channel === 2) {
                // MEXICAN (Cartel - Fast Trumpet-ish Sawtooth)
                intervalRef.current = setInterval(() => {
                    const root = step % 8 < 4 ? 392.00 : 349.23; // G then F
                    if (step % 2 === 0) {
                        playTone(root, 'sawtooth', 0.15, 0.04);
                        playTone(root * 1.25, 'sawtooth', 0.15, 0.04); // Major 3rd
                    }
                    if (step % 4 === 0) playTone(root / 2, 'square', 0.3, 0.05);
                    step++;
                }, 180);
            } else if (channel === 3) {
                // HIP HOP (Gang - Bass Heavy Loop)
                intervalRef.current = setInterval(() => {
                    const beat = step % 8;
                    if (beat === 0) {
                        playTone(55, 'sine', 0.4, 0.3);
                    } else if (beat === 4) {
                        playTone(180, 'square', 0.15, 0.1);
                    } else if (beat % 2 !== 0) {
                        playTone(800 + Math.random()*200, 'triangle', 0.05, 0.02);
                    }
                    if (beat === 0 || beat === 3 || beat === 6) {
                        playTone(220, 'sine', 0.2, 0.05);
                    }
                    step++;
                }, 250);
            }
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (window.speechSynthesis) window.speechSynthesis.cancel();
        }
    }, [channel]);

    return null; // Logic only, no UI
};

export default RadioPlayer;