/**
 * useWaveInteraction Hook
 * 
 * Unifies interaction handling for Wave Mode:
 * - Tap (< 200ms): Spawn Particle
 * - Hold (> 200ms): Brake & Charge
 */
import { useCallback, useRef } from 'react';
import * as Tone from 'tone';
import { useWaveStore } from '../wave.store';
import { useSpawnParticle } from '../../structures/hooks/useSpawnParticle';
import { TAP_THRESHOLD_MS } from '../wave.constants';
import type { ThreeEvent } from '@react-three/fiber';

export const useWaveInteraction = () => {
    const startHold = useWaveStore(state => state.startHold);
    const endHold = useWaveStore(state => state.endHold);
    const { spawnParticle } = useSpawnParticle();

    // interaction state refs
    const startTimeRef = useRef<number>(0);
    const isHoldingRef = useRef<boolean>(false);

    const onPointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
        // Only Left Click
        if (e.button !== 0) return;

        e.stopPropagation(); // Prevent bubbling to other inputs since we handle both here

        startTimeRef.current = Tone.Transport.seconds;
        isHoldingRef.current = true;
        startHold();
    }, [startHold]);

    const onPointerUp = useCallback(() => {
        if (!isHoldingRef.current) return;

        const durationSeconds = Tone.Transport.seconds - startTimeRef.current;
        const durationMs = durationSeconds * 1000;
        isHoldingRef.current = false;

        // Always end hold first to reset physics
        endHold();

        // If short press, treat as Tap -> Spawn
        if (durationMs < TAP_THRESHOLD_MS) {
            spawnParticle();
        }
    }, [endHold, spawnParticle]);

    const onPointerLeave = useCallback(() => {
        if (isHoldingRef.current) {
            isHoldingRef.current = false;
            endHold();
        }
    }, [endHold]);

    return {
        handlers: {
            onPointerDown,
            onPointerUp,
            onPointerLeave
        }
    };
};
