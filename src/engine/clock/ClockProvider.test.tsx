import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClockProvider } from './ClockProvider';
import { usePulse } from './usePulse';
import { useBeatCallback } from './useBeatCallback';
import * as Tone from 'tone';

// Mock Tone.js
vi.mock('tone', () => {
    return {
        Transport: {
            bpm: { value: 120 },
            position: '0:0:0',
            scheduleRepeat: vi.fn(() => 1),
            clear: vi.fn(),
            start: vi.fn(),
            stop: vi.fn(),
            ticks: 0,
            PPQ: 192,
        },
        start: vi.fn(),
    };
});

describe('Clock System', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset Transport mocks
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (Tone.Transport.scheduleRepeat as any).mockImplementation(() => {
            return 1;
        });
    });

    describe('ClockProvider', () => {
        it('provides initial clock state via usePulse', () => {
            const { result } = renderHook(() => usePulse(), {
                wrapper: ClockProvider,
            });

            expect(result.current.current).toEqual({
                position: 0,
                beat: 0,
                measure: 0,
                phase: 0,
            });
        });

        it('sets BPM to 120 on mount', () => {
            renderHook(() => usePulse(), {
                wrapper: ClockProvider,
            });
            expect(Tone.Transport.bpm.value).toBe(120);
        });

        it('schedules a repeat event on mount', () => {
            renderHook(() => usePulse(), {
                wrapper: ClockProvider,
            });
            expect(Tone.Transport.scheduleRepeat).toHaveBeenCalledWith(
                expect.any(Function),
                '16n'
            );
        });

        it('clears scheduled event on unmount', () => {
            const { unmount } = renderHook(() => usePulse(), {
                wrapper: ClockProvider,
            });

            unmount();

            // Should clear the event ID returned by scheduleRepeat (mocked as 1)
            expect(Tone.Transport.clear).toHaveBeenCalledWith(1);
        });
    });

    describe('usePulse', () => {
        it('returns fallback values when used outside ClockProvider', () => {
            // Suppress console.warn for this test
            const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

            const { result } = renderHook(() => usePulse());

            expect(result.current.current).toEqual({
                position: 0,
                beat: 0,
                measure: 0,
                phase: 0,
            });
            expect(warnSpy).toHaveBeenCalledWith(
                '[PRIMITIVES:Clock] usePulse called outside ClockProvider, using fallback values'
            );

            warnSpy.mockRestore();
        });
    });

    describe('useBeatCallback', () => {
        it('schedules and cleans up', () => {
            const callback = vi.fn();
            const { unmount } = renderHook(() => useBeatCallback(callback, '4n'), {
                wrapper: ClockProvider,
            });

            expect(Tone.Transport.scheduleRepeat).toHaveBeenCalledWith(
                expect.any(Function),
                '4n'
            );

            unmount();
            expect(Tone.Transport.clear).toHaveBeenCalled();
        });
    });
});

