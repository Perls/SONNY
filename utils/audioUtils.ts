
export const playSound = (type: 'level_up' | 'cash' | 'error' | 'success') => {
    try {
        const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
        if (!AudioContextClass) return;
        const ctx = new AudioContextClass();
        // Browser autoplay policy fix
        if (ctx.state === 'suspended') ctx.resume();
        
        const now = ctx.currentTime;

        if (type === 'level_up') {
            // Major 7 Arpeggio (C6) - The 'Level Up' Chime
            const frequencies = [1046.50, 1318.51, 1567.98, 2093.00]; 
            
            frequencies.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                
                osc.type = 'sine'; 
                osc.frequency.setValueAtTime(freq, now + (i * 0.08)); 
                
                gain.gain.setValueAtTime(0, now + (i * 0.08));
                gain.gain.linearRampToValueAtTime(0.15, now + (i * 0.08) + 0.05); 
                gain.gain.exponentialRampToValueAtTime(0.001, now + (i * 0.08) + 1.2); 
                
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now + (i * 0.08));
                osc.stop(now + (i * 0.08) + 1.5);
            });
        } 
        else if (type === 'cash') {
            // Cash Register / Coin sound
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'square';
            osc.frequency.setValueAtTime(1200, now);
            osc.frequency.exponentialRampToValueAtTime(2000, now + 0.1);
            
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.2);
        }
        else if (type === 'error') {
            // Low error buzz
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.linearRampToValueAtTime(100, now + 0.2);

            gain.gain.setValueAtTime(0.1, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.2);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.2);
        }
        else if (type === 'success') {
            // Simple high ping
             const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, now);
            
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.5);
        }

    } catch (e) {
        console.error("Audio Context Error", e);
    }
};
