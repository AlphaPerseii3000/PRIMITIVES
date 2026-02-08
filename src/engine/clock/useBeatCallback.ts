import { useEffect, useRef } from 'react';
import * as Tone from 'tone';
import type { Time } from 'tone/build/esm/core/type/Units';

/**
 * Hook to register a callback that fires on specific beat events.
 * 
 * Uses Tone.Transport.scheduleRepeat internally for precise timing.
 * The callback receives the scheduled AudioContext time, useful for
 * scheduling audio events with sample-accurate precision.
 * 
 * @param callback - Function to call on each beat. Receives AudioContext time.
 *                   Can be updated without re-scheduling (uses ref internally).
 * @param interval - Tone.js Time value for the repeat interval.
 *                   Examples: "4n" (quarter note), "8n" (eighth), "1m" (measure).
 *                   ⚠️ MUST be a stable reference - avoid creating new strings inline.
 *                   Use constants or useMemo if interval comes from props/state.
 * 
 * @example
 * ```tsx
 * // ✅ Good - constant string is stable
 * useBeatCallback((time) => {
 *   synth.triggerAttackRelease('C4', '8n', time);
 * }, '4n');
 * 
 * // ✅ Good - using constant
 * const BEAT_INTERVAL = '4n';
 * useBeatCallback(handleBeat, BEAT_INTERVAL);
 * 
 * // ❌ Bad - creates new string each render, causes re-scheduling
 * useBeatCallback(handleBeat, `${division}n`);
 * ```
 */
export const useBeatCallback = (callback: (time: number) => void, interval: Time) => {
    const callbackRef = useRef(callback);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    useEffect(() => {
        const eventId = Tone.Transport.scheduleRepeat((time) => {
            callbackRef.current(time);
        }, interval);

        return () => {
            Tone.Transport.clear(eventId);
        };
    }, [interval]);
};
