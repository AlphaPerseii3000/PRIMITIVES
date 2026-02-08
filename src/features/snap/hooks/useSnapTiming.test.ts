import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSnapTiming } from './useSnapTiming';
import * as Tone from 'tone';
import { useSyncStore } from '../../pulse/stores/sync.store';

// Mock Tone.js
vi.mock('tone', () => ({
    Transport: {
        seconds: 0.5,
        bpm: {
            value: 120
        }
    }
}));

// Mock Sync Store
const mockSyncState = {
    syncOffset: 0,
    currentDelta: 0,
    averageDelta: 0,
    maxDelta: 0,
    minDelta: 0,
    history: [],
    lastAudioTime: null,
    logAudioEvent: vi.fn(),
    logVisualEvent: vi.fn(),
    setSyncOffset: vi.fn(),
    resetStats: vi.fn()
};

vi.mock('../../pulse/stores/sync.store', () => ({
    useSyncStore: Object.assign(
        vi.fn((selector) => selector(mockSyncState)),
        {
            getState: () => mockSyncState,
            subscribe: vi.fn()
        }
    )
}));

vi.mock('../wave.store', () => ({
    useWaveStore: vi.fn((selector) => selector({
        config: {
            perfectWindowMs: 40,
            goodWindowMs: 90
        }
    }))
}));

describe('useSnapTiming', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should evaluate release correctly using Transport time', () => {
        // Set up mock values
        Tone.Transport.seconds = 0.5; // Beat 1 at 120bpm
        Tone.Transport.bpm.value = 120;

        const { result } = renderHook(() => useSnapTiming());
        const evaluation = result.current.evaluateRelease();

        expect(evaluation.quality).toBe('lock');
        expect(evaluation.deltaMs).toBeCloseTo(0);
        expect(evaluation.beatPosition).toBe(1);
    });

    it('should account for sync offset in evaluation', () => {
        Tone.Transport.seconds = 0.55; // 50ms late

        // Mock syncOffset = 50ms
        const useSyncStoreMock = vi.mocked(useSyncStore);
        useSyncStoreMock.mockImplementation((selector: (state: typeof mockSyncState) => unknown) => selector({ ...mockSyncState, syncOffset: 50 }));

        const { result } = renderHook(() => useSnapTiming());
        const evaluation = result.current.evaluateRelease();

        // 0.55 - 0.05 = 0.5 (Lock)
        expect(evaluation.quality).toBe('lock');
        expect(evaluation.deltaMs).toBeCloseTo(0);
    });
});
