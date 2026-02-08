import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSnapFeedback } from './useSnapFeedback';
import { useSnapStore } from '../stores/snap.store';
import { snapPlayers } from '../audio/snapAudio';

// Mock Tone.js classes and methods
vi.mock('tone', () => {
    const playerMock = {
        start: vi.fn(),
        volume: { value: 0 },
    };

    const playersMock = {
        player: vi.fn(() => playerMock),
        toDestination: vi.fn().mockReturnThis(),
        has: vi.fn().mockReturnValue(true),
        loaded: true,
        volume: { value: 0 },
    };

    return {
        // Use a class to ensure 'new Tone.Players()' works
        Players: class {
            constructor() {
                return playersMock;
            }
        },
        gainToDb: vi.fn((v) => v), // Mock implementation
        now: vi.fn(() => 100),
    };
});

describe('useSnapFeedback', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset store
        act(() => {
            useSnapStore.getState().clearSnap();
        });
    });

    it('plays sound when snap result is emitted', () => {
        renderHook(() => useSnapFeedback());

        act(() => {
            useSnapStore.getState().emitSnap({
                quality: 'lock',
                beatPosition: 0,
                deltaMs: 0
            });
        });

        // Verify player was retrieved and started
        expect(snapPlayers.player).toHaveBeenCalledWith('lock');
        const lockPlayer = snapPlayers.player('lock');
        expect(lockPlayer.start).toHaveBeenCalledWith(100); // 100 is mocked Tone.now()
    });

    it('does not play sound when muted', () => {
        renderHook(() => useSnapFeedback({ muted: true }));

        act(() => {
            useSnapStore.getState().emitSnap({
                quality: 'wobble',
                beatPosition: 0,
                deltaMs: 20
            });
        });

        expect(snapPlayers.player).not.toHaveBeenCalled();
    });

    it('updates volume when config changes', () => {
        const { rerender } = renderHook((props) => useSnapFeedback(props), {
            initialProps: { volume: 0.5 }
        });

        // Initial volume setting
        expect(snapPlayers.volume.value).toBe(0.5);

        // Update volume
        rerender({ volume: 0.8 });

        expect(snapPlayers.volume.value).toBe(0.8);
    });

    it('handles missing sample gracefully', () => {
        // Mock 'has' to return false for this test
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (snapPlayers.has as any).mockReturnValueOnce(false);
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

        renderHook(() => useSnapFeedback());

        act(() => {
            useSnapStore.getState().emitSnap({
                quality: 'reject',
                beatPosition: 0,
                deltaMs: 0
            });
        });

        expect(snapPlayers.player).not.toHaveBeenCalled();
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Missing snap sample'));

        consoleSpy.mockRestore();
    });

    it('should not crash if players are not loaded', () => {
        // Mock loaded to false
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (snapPlayers as any).loaded = false;

        renderHook(() => useSnapFeedback());

        act(() => {
            useSnapStore.getState().emitSnap({
                quality: 'lock',
                beatPosition: 0,
                deltaMs: 0
            });
        });

        expect(snapPlayers.player).not.toHaveBeenCalled();

        // Reset loaded
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (snapPlayers as any).loaded = true;
    });

    it('should handle errors during player start', () => {
        const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

        // Mock player().start() to throw
        const error = new Error('Tone.js error');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (snapPlayers.player as any).mockImplementationOnce(() => ({
            start: vi.fn().mockImplementation(() => { throw error; }),
            volume: { value: 0 }
        }));

        renderHook(() => useSnapFeedback());

        act(() => {
            useSnapStore.getState().emitSnap({
                quality: 'lock',
                beatPosition: 0,
                deltaMs: 0
            });
        });

        expect(consoleSpy).toHaveBeenCalledWith(
            '[PRIMITIVES:Audio] Failed to play snap sound',
            error
        );

        consoleSpy.mockRestore();
    });
});
