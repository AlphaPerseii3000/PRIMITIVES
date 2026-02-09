import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { ThreeEvent } from '@react-three/fiber';
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

// Use vi.hoisted to share spies with the hoisted vi.mock
const { mockEvaluateRelease, mockEmitSnap } = vi.hoisted(() => ({
    mockEvaluateRelease: vi.fn(),
    mockEmitSnap: vi.fn()
}));

vi.mock('./useSnapTiming', () => ({
    useSnapTiming: () => ({
        evaluateRelease: mockEvaluateRelease
    })
}));

vi.mock('../stores/snap.store', () => ({
    useSnapStore: Object.assign(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        vi.fn((selector: (state: any) => any) => selector({
            lastSnapResult: null,
            emitSnap: mockEmitSnap,
            clearSnap: vi.fn()
        })),
        {
            getState: () => ({ lastSnapResult: null, emitSnap: mockEmitSnap, clearSnap: vi.fn() }),
            subscribe: vi.fn()
        }
    )
}));

import { useSnapStore } from '../stores/snap.store';

describe('useWaveInteraction', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        useWaveStore.getState().reset();
        useStore.getState().reset();

        // Spy on actions
        vi.spyOn(useWaveStore.getState(), 'startHold');
        vi.spyOn(useWaveStore.getState(), 'endHold');

        // Mock addNode which is called by spawnParticle
        useStore.setState({ addNode: vi.fn() });

        // Reset our top-level spies
        mockEvaluateRelease.mockReset();
        mockEmitSnap.mockReset();

        // Default mock return
        mockEvaluateRelease.mockReturnValue({ quality: 'lock', deltaMs: 0, beatPosition: 1 });

        // Mocking zustand store selection for the hook
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        vi.mocked(useSnapStore).mockImplementation((selector: (state: any) => any) =>
            selector({
                lastSnapResult: null,
                emitSnap: mockEmitSnap,
                clearSnap: vi.fn()
            })
        );
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    it('should start hold on pointer down', () => {
        const { result } = renderHook(() => useWaveInteraction());
        const { handlers } = result.current;

        const stopPropagation = vi.fn();

        handlers.onPointerDown({ button: 0, stopPropagation } as unknown as ThreeEvent<PointerEvent>);

        expect(useWaveStore.getState().startHold).toHaveBeenCalled();
        expect(stopPropagation).toHaveBeenCalled();
    });

    it('should spawn particle on short tap (<200ms)', () => {
        const { result } = renderHook(() => useWaveInteraction());
        const { handlers } = result.current;

        transport.seconds = 1.0;

        handlers.onPointerDown({ button: 0, stopPropagation: vi.fn() } as unknown as ThreeEvent<PointerEvent>);

        transport.seconds = 1.1; // 100ms
        handlers.onPointerUp();

        expect(useWaveStore.getState().endHold).toHaveBeenCalled();
        expect(useStore.getState().addNode).toHaveBeenCalled();
        expect(mockEmitSnap).toHaveBeenCalled();
    });

    it('should spawn particle on correctly timed long hold (>200ms)', () => {
        mockEvaluateRelease.mockReturnValue({ quality: 'lock', deltaMs: 0, beatPosition: 1 });

        const { result } = renderHook(() => useWaveInteraction());
        const { handlers } = result.current;

        transport.seconds = 1.0;

        handlers.onPointerDown({ button: 0, stopPropagation: vi.fn() } as unknown as ThreeEvent<PointerEvent>);

        transport.seconds = 1.5; // 500ms
        handlers.onPointerUp();

        expect(useWaveStore.getState().endHold).toHaveBeenCalled();
        expect(useStore.getState().addNode).toHaveBeenCalled();
        expect(mockEmitSnap).toHaveBeenCalledWith(expect.objectContaining({ quality: 'lock' }));
    });

    it('should NOT spawn particle on poorly timed long hold (reject)', () => {
        mockEvaluateRelease.mockReturnValue({ quality: 'reject', deltaMs: 200, beatPosition: 1 });

        const { result } = renderHook(() => useWaveInteraction());
        const { handlers } = result.current;

        transport.seconds = 1.0;

        handlers.onPointerDown({ button: 0, stopPropagation: vi.fn() } as unknown as ThreeEvent<PointerEvent>);

        transport.seconds = 1.5; // 500ms
        handlers.onPointerUp();

        expect(useWaveStore.getState().endHold).toHaveBeenCalled();
        expect(useStore.getState().addNode).not.toHaveBeenCalled();
        expect(mockEmitSnap).toHaveBeenCalledWith(expect.objectContaining({ quality: 'reject' }));
    });

    it('should end hold on pointer leave', () => {
        const { result } = renderHook(() => useWaveInteraction());
        const { handlers } = result.current;


        handlers.onPointerDown({ button: 0, stopPropagation: vi.fn() } as unknown as ThreeEvent<PointerEvent>);
        handlers.onPointerLeave();

        expect(useWaveStore.getState().endHold).toHaveBeenCalled();
    });
});
