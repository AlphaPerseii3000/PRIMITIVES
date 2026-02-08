import { useSyncStore } from '../stores/sync.store';
import { THRESHOLD_PERFECT, THRESHOLD_GOOD } from '../components/SyncDebugOverlay';

/**
 * Hook to provide sync synchronization metrics and status.
 * Derived from the global sync store.
 */
export const useSyncMonitor = () => {
    const store = useSyncStore();

    const absDelta = Math.abs(store.currentDelta);
    const isPerfect = absDelta <= THRESHOLD_PERFECT;
    const isGood = absDelta <= THRESHOLD_GOOD;

    const status = isPerfect ? 'perfect' : isGood ? 'good' : 'poor';
    const statusColor = isPerfect ? '#4ade80' : isGood ? '#facc15' : '#ef4444';

    return {
        ...store,
        status,
        statusColor,
        isPerfect,
        isGood
    };
};
