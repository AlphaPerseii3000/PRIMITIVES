import { useEffect } from 'react';
import { useSnapStore } from '../stores/snap.store';
import { useWaveStore } from '../wave.store';
import {
    SNAP_BURST_COUNT_LOCK,
    SNAP_BURST_COUNT_WOBBLE,
    SNAP_BURST_COUNT_REJECT,
} from '../snap-visual.constants';

export interface SnapVisualState {
    active: boolean;
    quality: 'lock' | 'wobble' | 'reject';
    position: { x: number; z: number };
    timestamp: number;
    burstCount: number;
    bloomIntensity: number | null;
    burstDuration: number | null;
}

// Module-level ref — shared between hook, SnapFlash, and SnapBurst
// No React re-renders. Components read in useFrame.
export const snapVisualRef: { current: SnapVisualState | null } = { current: null };

const QUALITY_BURST_MAP = {
    lock: SNAP_BURST_COUNT_LOCK,
    wobble: SNAP_BURST_COUNT_WOBBLE,
    reject: SNAP_BURST_COUNT_REJECT,
} as const;

export interface UseSnapVisualFeedbackConfig {
    enabled?: boolean;
    burstCount?: number;
    bloomIntensity?: number;
    burstDuration?: number;
}

export function useSnapVisualFeedback(config: UseSnapVisualFeedbackConfig = {}) {
    const { enabled = true } = config;
    const lastResult = useSnapStore(s => s.lastSnapResult);

    useEffect(() => {
        if (!lastResult || !enabled) return;

        // Get current position from wave store (transient read, no subscription)
        const { position } = useWaveStore.getState();

        snapVisualRef.current = {
            active: true,
            quality: lastResult.quality,
            position: { x: position.x, z: position.z },
            timestamp: performance.now(),
            burstCount: config.burstCount ?? QUALITY_BURST_MAP[lastResult.quality],
            bloomIntensity: config.bloomIntensity ?? null,
            burstDuration: config.burstDuration ?? null,
        };

        return () => {
            snapVisualRef.current = null;
        };
    }, [lastResult, enabled, config.burstCount, config.bloomIntensity, config.burstDuration]);
}
