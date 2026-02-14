
import { useState, useEffect, useMemo } from 'react';
import { getMoonPhase, isNightTime } from './timeUtils';

export interface WeatherCondition {
    temp: number;
    description: string;
    icon: string;
    isNight: boolean;
    moonPhase: { icon: string, label: string };
    nextEvent: { label: string, time: string, timeUntil: string };
}

export const useCityTime = () => {
    // Initialize with current time but force date to Dec 9, 2025
    const getSimulatedDate = () => {
        const now = new Date();
        return new Date(2025, 11, 9, now.getHours(), now.getMinutes(), now.getSeconds());
    };

    const [currentTime, setCurrentTime] = useState(getSimulatedDate());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(getSimulatedDate());
        }, 60000); // Throttled: weather/time only needs per-minute precision
        return () => clearInterval(timer);
    }, []);

    // December 9th, 2025 Weather Simulation for NYC
    const getWeather = (date: Date): WeatherCondition => {
        const hour = date.getHours();
        const minutes = date.getMinutes();
        const decimalTime = hour + minutes / 60;
        const isNight = isNightTime(date);

        // Temperature Curve for Dec 9 (Low ~38F, High ~46F)
        // Coldest at 5 AM, Warmest at 2 PM
        const tempBase = 42;
        const tempSwing = 4;
        const temp = Math.round(tempBase + Math.sin((decimalTime - 9) * (Math.PI / 12)) * tempSwing);

        // Conditions based on time of day
        let description = 'Overcast';
        let icon = '☁️';

        if (decimalTime >= 6 && decimalTime < 9) {
            description = 'Morning Mist';
            icon = '🌫️';
        } else if (decimalTime >= 9 && decimalTime < 13) {
            description = 'Cloudy';
            icon = '☁️';
        } else if (decimalTime >= 13 && decimalTime < 16) {
            description = 'Cold Breeze';
            icon = '🍃';
        } else if (decimalTime >= 16 && decimalTime < 20) {
            description = 'Light Drizzle';
            icon = '🌧️';
        } else {
            description = 'Clear & Cold';
            icon = isNight ? '🌙' : '☀️';
        }

        // Sun Times for Dec (from timeUtils: Rise 7.2, Set 16.5)
        // Dec 9 Rise: ~7:12 AM, Set: ~4:30 PM
        const riseTime = 7.2;
        const setTime = 16.5;

        let nextEventLabel = 'Dawn';
        let nextEventTime = '07:12';
        let delta = 0;

        const decimalToTime = (dec: number) => {
            const h = Math.floor(dec);
            const m = Math.floor((dec - h) * 60);
            return `${h}:${m.toString().padStart(2, '0')}`;
        };

        if (decimalTime < riseTime) {
            nextEventLabel = 'Dawn';
            nextEventTime = decimalToTime(riseTime);
            delta = riseTime - decimalTime;
        } else if (decimalTime < setTime) {
            nextEventLabel = 'Dusk';
            nextEventTime = decimalToTime(setTime);
            delta = setTime - decimalTime;
        } else {
            nextEventLabel = 'Dawn';
            nextEventTime = decimalToTime(riseTime);
            delta = (24 - decimalTime) + riseTime;
        }

        const dh = Math.floor(delta);
        const dm = Math.floor((delta - dh) * 60);
        const timeUntil = `${dh}h ${dm}m`;

        return {
            temp,
            description,
            icon,
            isNight,
            moonPhase: getMoonPhase(date),
            nextEvent: { label: nextEventLabel, time: nextEventTime, timeUntil }
        };
    };

    // Memoize weather to avoid recalculating on every consumer render
    const weather = useMemo(() => getWeather(currentTime), [currentTime]);

    return {
        currentTime,
        weather
    };
};
