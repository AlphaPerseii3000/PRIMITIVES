import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as Tone from 'tone';
import { DEFAULT_BPM, RAMP_DURATION, MIN_BPM, MAX_BPM } from './clock.constants';

/** State for the global clock / tempo management */
interface ClockState {
    /** Current beats per minute (60-180 range) */
    bpm: number;
    /** Set BPM with smooth ramp transition via Tone.Transport */
    setBpm: (bpm: number) => void;
}

export const useClockStore = create<ClockState>()(
    persist(
        (set) => ({
            bpm: DEFAULT_BPM,
            setBpm: (newBpm: number) => {
                // Clamp value between MIN and MAX
                const clampedBpm = Math.max(MIN_BPM, Math.min(MAX_BPM, newBpm));

                // Update Tone.Transport
                // user-gesture safety: only works if Transport is initialized, which it typically is in the app
                if (Tone.Transport) {
                    Tone.Transport.bpm.rampTo(clampedBpm, RAMP_DURATION);
                }

                set({ bpm: clampedBpm });
            },
        }),
        {
            name: 'clock-storage', // unique name
            partialize: (state) => ({ bpm: state.bpm }), // Only persist bpm
        }
    )
);
