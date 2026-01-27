
export const getMoonPhase = (date: Date) => {
    const synodic = 29.53058867;
    // Known new moon: Jan 9 1997 04:00 UTC
    const knownNewMoon = new Date('1997-01-09T04:00:00Z').getTime();
    const diff = date.getTime() - knownNewMoon;
    const phase = (diff / (1000 * 60 * 60 * 24)) % synodic;
    const age = phase < 0 ? phase + synodic : phase;
    
    // 8 phases
    if (age < 1.84) return { icon: '🌑', label: 'New Moon' };
    if (age < 5.53) return { icon: '🌒', label: 'Waxing Crescent' };
    if (age < 9.22) return { icon: '🌓', label: 'First Quarter' };
    if (age < 12.91) return { icon: '🌔', label: 'Waxing Gibbous' };
    if (age < 16.61) return { icon: '🌕', label: 'Full Moon' };
    if (age < 20.30) return { icon: '🌖', label: 'Waning Gibbous' };
    if (age < 23.99) return { icon: '🌗', label: 'Last Quarter' };
    if (age < 27.68) return { icon: '🌘', label: 'Waning Crescent' };
    return { icon: '🌑', label: 'New Moon' };
};

export const isNightTime = (date: Date) => {
    const m = date.getMonth(); // 0-11
    // Approximate sunrise/sunset for NYC (Month 0 = Jan)
    const sunTimes = [
        { rise: 7.3, set: 16.8 }, // Jan
        { rise: 6.8, set: 17.5 }, // Feb
        { rise: 6.1, set: 18.2 }, // Mar
        { rise: 5.3, set: 19.6 }, // Apr
        { rise: 4.8, set: 20.2 }, // May
        { rise: 4.5, set: 20.5 }, // Jun
        { rise: 4.8, set: 20.3 }, // Jul
        { rise: 5.2, set: 19.8 }, // Aug
        { rise: 5.7, set: 19.0 }, // Sep
        { rise: 6.2, set: 18.2 }, // Oct
        { rise: 6.8, set: 16.7 }, // Nov
        { rise: 7.2, set: 16.5 }, // Dec
    ];
    
    const times = sunTimes[m];
    const currentHour = date.getHours() + (date.getMinutes() / 60);
    
    return currentHour < times.rise || currentHour >= times.set;
};
