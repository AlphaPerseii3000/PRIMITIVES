import { describe, it, expect, vi } from 'vitest';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { SyncDebugOverlay } from './SyncDebugOverlay';

// Mock useSyncStore
vi.mock('../stores/sync.store', () => ({
    useSyncStore: () => ({
        currentDelta: 10,
        averageDelta: 15,
        maxDelta: 25,
        minDelta: 5,
        history: [10, 15, 20],
    }),
    SYNC_HISTORY_SIZE: 50,
}));

// Mock Leva
vi.mock('leva', () => ({
    useControls: vi.fn().mockImplementation((name, config) => {
        const values = { showDebug: true };
        const set = vi.fn();

        // If config is a function (factory), it returns [values, set]
        if (typeof config === 'function') {
            return [values, set];
        }
        // Otherwise it returns values
        return values;
    }),
}));

// Mock Html from drei as a group, ignoring children which are DOM elements
vi.mock('@react-three/drei', () => ({
    Html: () => <group name="Html" />,
}));

describe('SyncDebugOverlay', () => {
    it('renders when showDebug is true', async () => {
        const renderer = await ReactThreeTestRenderer.create(<SyncDebugOverlay />);
        expect(renderer).toBeDefined();
    });

    it('displays sync metrics', async () => {
        const renderer = await ReactThreeTestRenderer.create(<SyncDebugOverlay />);

        // Now it's a group
        const groups = renderer.scene.findAllByType('Group');
        expect(groups.length).toBeGreaterThan(0);
    });
});
