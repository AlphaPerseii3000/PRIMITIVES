import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useWaveInteraction } from './useWaveInteraction';
import { useWaveStore } from '../wave.store';
import { useStore } from '../../../store'; // Root store for particles which useSpawnParticle uses

// Mock Tone.js
interface MockTransport {
    seconds: number;
}

vi.mock('tone', () => ({
    Transport: {
        seconds: 0,
    }
}));

import * as Tone from 'tone';

const transport = Tone.Transport as unknown as MockTransport;

// Date.now is no longer used, we use Tone.Transport.seconds

describe('useWaveInteraction', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        useWaveStore.getState().reset();
        useStore.getState().reset(); // functionality depends on root store (particles)

        // Spy on actions
        vi.spyOn(useWaveStore.getState(), 'startHold');
        vi.spyOn(useWaveStore.getState(), 'endHold');

        // Mock addNode which is called by spawnParticle
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        useStore.setState({ addNode: vi.fn() as unknown as any });
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    it('should start hold on pointer down', () => {
        const { result } = renderHook(() => useWaveInteraction());
        const { handlers } = result.current;

        const stopPropagation = vi.fn();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handlers.onPointerDown({ button: 0, stopPropagation } as any);

        expect(useWaveStore.getState().startHold).toHaveBeenCalled();
        expect(stopPropagation).toHaveBeenCalled();
    });

    it('should spawn particle on short tap (<200ms)', () => {
        const { result } = renderHook(() => useWaveInteraction());
        const { handlers } = result.current;

        // Mock time sequence
        transport.seconds = 1.0; // 1s

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handlers.onPointerDown({ button: 0, stopPropagation: vi.fn() } as any);

        transport.seconds = 1.1; // 1.1s (100ms later)
        handlers.onPointerUp();

        expect(useWaveStore.getState().endHold).toHaveBeenCalled();
        // check if addNode was called (proxy for spawnParticle success)
        expect(useStore.getState().addNode).toHaveBeenCalled();
    });

    it('should NOT spawn particle on long hold (>200ms)', () => {
        const { result } = renderHook(() => useWaveInteraction());
        const { handlers } = result.current;

        // Mock time sequence
        transport.seconds = 1.0;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handlers.onPointerDown({ button: 0, stopPropagation: vi.fn() } as any);

        transport.seconds = 1.5; // 500ms later
        handlers.onPointerUp();

        expect(useWaveStore.getState().endHold).toHaveBeenCalled();
        expect(useStore.getState().addNode).not.toHaveBeenCalled();
    });

    it('should end hold on pointer leave', () => {
        const { result } = renderHook(() => useWaveInteraction());
        const { handlers } = result.current;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        handlers.onPointerDown({ button: 0, stopPropagation: vi.fn() } as any);
        handlers.onPointerLeave();

        expect(useWaveStore.getState().endHold).toHaveBeenCalled();
    });
});
