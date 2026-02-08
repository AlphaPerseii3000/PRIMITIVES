import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import * as Tone from 'tone';
import { ClockContext } from './clock.context';
import type { ClockState } from './clock.types';
import { BEATS_PER_MEASURE, CLOCK_UPDATE_INTERVAL, DEFAULT_BPM } from './clock.constants';

/**
 * ClockProvider - Master clock context for PRIMITIVES
 * 
 * Provides a shared, non-reactive clock state reference to all child components.
 * Uses Tone.Transport.scheduleRepeat for high-precision timing updates.
 * 
 * ## Architecture Notes
 * 
 * - **Single Source of Truth:** Tone.Transport is the master clock for all timing
 * - **No Re-renders:** Uses useRef instead of useState - clock ticks don't trigger React updates
 * - **High Resolution:** Updates every 16th note (~31ms at 120 BPM) for smooth animations
 * 
 * ## Cleanup Behavior
 * 
 * On unmount, this provider clears its scheduled repeat event but does NOT stop
 * Tone.Transport. Transport lifecycle is managed by AudioProvider, as stopping
 * Transport here would break other components that depend on it.
 * 
 * @example
 * ```tsx
 * <AudioProvider>
 *   <ClockProvider>
 *     <Canvas>
 *       {/* Child components can use usePulse() here *\/}
 *     </Canvas>
 *   </ClockProvider>
 * </AudioProvider>
 * ```
 */
export const ClockProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const clockRef = useRef<ClockState>({
        position: 0,
        beat: 0,
        measure: 0,
        phase: 0,
    });

    useEffect(() => {
        // Set BPM
        Tone.Transport.bpm.value = DEFAULT_BPM;

        // Schedule repeat
        const eventId = Tone.Transport.scheduleRepeat(() => {
            const ticks = Tone.Transport.ticks;
            const ppq = Tone.Transport.PPQ;
            const beatPos = ticks / ppq;

            clockRef.current = {
                position: beatPos,
                beat: Math.floor(beatPos) % BEATS_PER_MEASURE,
                measure: Math.floor(beatPos / BEATS_PER_MEASURE),
                phase: beatPos % 1,
            };
        }, CLOCK_UPDATE_INTERVAL);

        // Cleanup
        return () => {
            Tone.Transport.clear(eventId);
        };
    }, []);

    return (
        <ClockContext.Provider value={clockRef}>
            {children}
        </ClockContext.Provider>
    );
};
