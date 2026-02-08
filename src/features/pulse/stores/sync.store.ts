import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { measureSyncDelta, calculateRollingAverage } from '../utils/sync.utils';

// ============================================================================
// Constants
// ============================================================================
/** Maximum time window (ms) for an audio/visual event pair to be considered a sync event */
export const SYNC_WINDOW_MS = 500;
/** Number of recent samples to keep for the rolling average */
export const SYNC_HISTORY_SIZE = 50;
/** Storage key for persisting sync settings */
const SYNC_STORAGE_KEY = 'primitives-sync-settings';

interface SyncState {
    /** Current delta between last audio and visual event (ms) */
    currentDelta: number;
    /** Rolling average of recent deltas (ms) */
    averageDelta: number;
    /** Maximum recorded delta (ms) */
    maxDelta: number;
    /** Minimum recorded delta (ms) */
    minDelta: number;
    /** History of recent deltas for visualization */
    history: number[];
    /** Timestamp of the last audio trigger event */
    lastAudioTime: number | null;
    /** User-calibrated offset for visual animation (ms) */
    syncOffset: number;
}

interface SyncActions {
    /** Logs a new audio trigger event timestamp */
    logAudioEvent: (time: number) => void;
    /** Logs a new visual peak event timestamp and calculates delta if within window */
    logVisualEvent: (time: number) => void;
    /** Sets the manual sync offset (ms) */
    setSyncOffset: (offset: number) => void;
    /** Resets all collected statistics */
    resetStats: () => void;
}

const INITIAL_STATE: Omit<SyncState, 'syncOffset'> = {
    currentDelta: 0,
    averageDelta: 0,
    maxDelta: 0,
    minDelta: 0,
    history: [],
    lastAudioTime: null,
};

export const useSyncStore = create<SyncState & SyncActions>()(
    persist(
        (set, get) => ({
            ...INITIAL_STATE,
            syncOffset: 0,

            logAudioEvent: (time) => {
                set({ lastAudioTime: time });
            },

            logVisualEvent: (time) => {
                const { lastAudioTime, history, maxDelta, minDelta } = get();

                if (lastAudioTime === null) return;

                // Check if event is within window
                const diff = Math.abs(time - lastAudioTime);
                if (diff < SYNC_WINDOW_MS) {
                    const delta = measureSyncDelta(lastAudioTime, time);

                    // Keep history limited to HISTORY_SIZE entries
                    const newHistory = [...history, delta].slice(-SYNC_HISTORY_SIZE);
                    const avg = calculateRollingAverage(newHistory);

                    set({
                        currentDelta: delta,
                        averageDelta: avg,
                        maxDelta: Math.max(maxDelta, delta),
                        minDelta: minDelta === 0 ? delta : Math.min(minDelta, delta),
                        history: newHistory
                    });
                }
            },

            setSyncOffset: (offset) => set({ syncOffset: offset }),

            resetStats: () => set((state) => ({ ...INITIAL_STATE, syncOffset: state.syncOffset }))
        }),
        {
            name: SYNC_STORAGE_KEY,
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ syncOffset: state.syncOffset }), // Only persist offset
        }
    )
);
