import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSyncMonitor } from './useSyncMonitor';
import { useSyncStore } from '../stores/sync.store';

// Mock Leva to avoid Stitches issues in JSDOM
vi.mock('leva', () => ({
    useControls: vi.fn().mockReturnValue({}),
}));

describe('useSyncMonitor', () => {
    beforeEach(() => {
        // Reset store before each test
        const store = useSyncStore.getState();
        store.resetStats();
    });

    it('initializes with zero stats', () => {
        const { result } = renderHook(() => useSyncMonitor());
        expect(result.current.currentDelta).toBe(0);
        expect(result.current.averageDelta).toBe(0);
        expect(result.current.history).toEqual([]);
    });

    it('updates stats when matching audio and visual events occur', () => {
        const { result } = renderHook(() => useSyncMonitor());

        act(() => {
            result.current.logAudioEvent(1000);
            result.current.logVisualEvent(1020);
        });

        expect(result.current.currentDelta).toBe(20);
        expect(result.current.averageDelta).toBe(20);
        expect(result.current.maxDelta).toBe(20);
        expect(result.current.history).toHaveLength(1);
    });

    it('ignores visual events without preceding audio events', () => {
        const { result } = renderHook(() => useSyncMonitor());

        act(() => {
            result.current.logVisualEvent(1000);
        });

        expect(result.current.currentDelta).toBe(0);
        expect(result.current.history).toHaveLength(0);
    });

    it('maintains rolling average and history size', () => {
        const { result } = renderHook(() => useSyncMonitor());

        // Add 4 events
        const events = [
            { audio: 1000, visual: 1010 },
            { audio: 2000, visual: 2020 },
            { audio: 3000, visual: 3030 },
            { audio: 4000, visual: 4040 },
        ];

        events.forEach(evt => {
            act(() => {
                result.current.logAudioEvent(evt.audio);
                result.current.logVisualEvent(evt.visual);
            });
        });

        expect(result.current.history).toHaveLength(4);
        expect(result.current.history).toEqual([10, 20, 30, 40]);
        // Average of 10, 20, 30, 40 is 25
        expect(result.current.averageDelta).toBe(25);
    });

    it('ignores stale audio events (outside window)', () => {
        const { result } = renderHook(() => useSyncMonitor());

        act(() => {
            result.current.logAudioEvent(1000);
            result.current.logVisualEvent(3000);
        });

        expect(result.current.currentDelta).toBe(0);
        expect(result.current.history).toHaveLength(0);
    });
});
