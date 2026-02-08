import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSpawnParticle } from './useSpawnParticle';
import { useStore } from '../../../store';

vi.mock('../../../store', () => ({
    useStore: vi.fn(),
}));

vi.mock('../../snap/wave.store', () => {
    const getState = vi.fn(() => ({ position: { x: 5, z: 10 } }));
    const useWaveStore = vi.fn((selector) => selector(getState()));
    // Attach getState to the hook
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useWaveStore as any).getState = getState;

    return { useWaveStore };
});

describe('useSpawnParticle', () => {
    const mockAddNode = vi.fn();

    beforeEach(async () => {
        vi.clearAllMocks();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (useStore as any).mockImplementation((selector: any) => selector({ addNode: mockAddNode }));
        // Mock default state for getState
        const { useWaveStore } = await import('../../snap/wave.store');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (useWaveStore.getState as any).mockReturnValue({ position: { x: 5, z: 10 } });
    });

    it('should call addNode with correct 3D coordinates from wavePosition', () => {
        const { result } = renderHook(() => useSpawnParticle());

        result.current.spawnParticle();

        expect(mockAddNode).toHaveBeenCalledWith([5, 0, 10]);
    });

    it('should return node ID from addNode', () => {
        mockAddNode.mockReturnValue('node-123');
        const { result } = renderHook(() => useSpawnParticle());

        const id = result.current.spawnParticle();

        expect(id).toBe('node-123');
    });
});
