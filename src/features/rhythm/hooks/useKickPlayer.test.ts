import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKickPlayer } from './useKickPlayer';

const { mockSynth, mockUseBeatCallback, MembraneSynthMock } = vi.hoisted(() => {
    const ms = {
        toDestination: vi.fn().mockReturnThis(),
        triggerAttackRelease: vi.fn(),
        dispose: vi.fn(),
        volume: { value: 0 },
    };
    const sm = vi.fn().mockImplementation(function () {
        return ms;
    });
    return {
        mockSynth: ms,
        mockUseBeatCallback: vi.fn(),
        MembraneSynthMock: sm,
    };
});

// Mock Tone.js
vi.mock('tone', () => ({
    MembraneSynth: MembraneSynthMock,
    getContext: vi.fn().mockReturnValue({ state: 'running', currentTime: 10 }),
    context: { currentTime: 10 },
    Transport: {
        scheduleRepeat: vi.fn().mockReturnValue(123),
        clear: vi.fn(),
    }
}));

// Mock useSyncStore
vi.mock('../../pulse', () => ({
    useSyncStore: () => vi.fn(),
}));

// Mock useBeatCallback
vi.mock('../../../engine/clock', () => ({
    useBeatCallback: mockUseBeatCallback,
}));

describe('useKickPlayer', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockSynth.volume.value = 0;
    });

    it('initializes synth with correct config', () => {
        renderHook(() => useKickPlayer());
        expect(MembraneSynthMock).toHaveBeenCalledWith(expect.objectContaining({
            pitchDecay: 0.05,
            octaves: 10,
        }));
    });

    it('schedules on quarter notes via useBeatCallback', () => {
        renderHook(() => useKickPlayer());
        expect(mockUseBeatCallback).toHaveBeenCalledWith(expect.any(Function), '4n');
    });

    it('updates volume without recreating synth', () => {
        const { rerender } = renderHook(({ vol }) => useKickPlayer(vol), {
            initialProps: { vol: -10 },
        });

        expect(mockSynth.volume.value).toBe(-10);
        expect(MembraneSynthMock).toHaveBeenCalledTimes(1);

        // Rerender with new volume
        rerender({ vol: -20 });

        expect(mockSynth.volume.value).toBe(-20);
        expect(MembraneSynthMock).toHaveBeenCalledTimes(1); // Should NOT have been called again
    });

    it('sets volume to -Infinity when muted', () => {
        const { rerender } = renderHook(({ muted }) => useKickPlayer(0, muted), {
            initialProps: { muted: false },
        });

        expect(mockSynth.volume.value).toBe(0);

        rerender({ muted: true });

        expect(mockSynth.volume.value).toBe(-Infinity);
    });

    it('disposes synth on unmount', () => {
        const { unmount } = renderHook(() => useKickPlayer());
        unmount();
        expect(mockSynth.dispose).toHaveBeenCalled();
    });
});
