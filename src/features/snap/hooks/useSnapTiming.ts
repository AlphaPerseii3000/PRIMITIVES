import { useCallback } from 'react';
import * as Tone from 'tone';
import { useSyncStore } from '../../pulse/stores/sync.store';
import { evaluateTiming } from '../snap.utils';
import { SNAP_PERFECT_WINDOW_MS, SNAP_GOOD_WINDOW_MS } from '../snap.constants';
import type { TimingResult } from '../timing.types';
import { useWaveStore } from '../wave.store';

/**
 * Hook to evaluate snap timing based on the current master clock.
 */
export const useSnapTiming = () => {
    // Current sync offset from calibrated store
    const syncOffset = useSyncStore(state => state.syncOffset);

    // Configurable timing windows from wave store
    const perfectWindowMs = useWaveStore(state => state.config.perfectWindowMs);
    const goodWindowMs = useWaveStore(state => state.config.goodWindowMs);

    const evaluateRelease = useCallback((): TimingResult => {
        // 1. Capture release time immediately from Master Clock
        const releaseTimeSeconds = Tone.Transport.seconds;

        // 2. Get current BPM
        const bpm = Tone.Transport.bpm.value;

        // 3. Perform evaluation
        return evaluateTiming(
            releaseTimeSeconds,
            bpm,
            syncOffset,
            perfectWindowMs ?? SNAP_PERFECT_WINDOW_MS,
            goodWindowMs ?? SNAP_GOOD_WINDOW_MS
        );
    }, [syncOffset, perfectWindowMs, goodWindowMs]);

    return { evaluateRelease };
};
