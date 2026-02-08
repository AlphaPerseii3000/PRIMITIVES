import { create } from 'zustand';
import type { TimingResult } from '../timing.types';

interface SnapState {
    /** Result of the last snap action (evaluated on release) */
    lastSnapResult: TimingResult | null;
}

interface SnapActions {
    /** Emit a new snap result (triggers subscribers) */
    emitSnap: (result: TimingResult) => void;
    /** Clear the current snap result */
    clearSnap: () => void;
}

/**
 * Snap Store (Signal Bus)
 * 
 * This store is transient (no persistence) and handles momentary event data.
 * Used to decouple audio timing detection from high-frequency visual feedback.
 */
export const useSnapStore = create<SnapState & SnapActions>()((set) => ({
    lastSnapResult: null,

    emitSnap: (result) => set({ lastSnapResult: result }),

    clearSnap: () => set({ lastSnapResult: null })
}));
