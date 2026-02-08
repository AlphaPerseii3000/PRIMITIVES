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
import { useSnapTiming } from './useSnapTiming';
import { useSnapStore } from '../stores/snap.store';
import type { ThreeEvent } from '@react-three/fiber';

export const useWaveInteraction = () => {
    const startHold = useWaveStore(state => state.startHold);
    const endHold = useWaveStore(state => state.endHold);
    const { spawnParticle } = useSpawnParticle();
    const { evaluateRelease } = useSnapTiming();
    const emitSnap = useSnapStore(state => state.emitSnap);

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

        isHoldingRef.current = false;

        // 1. Evaluate timing on release
        const timingResult = evaluateRelease();

        // 2. Emit result to Signal Bus
        emitSnap(timingResult);

        // 3. Reset physics state
        endHold();

        // 4. Decision logic (AC5):
        // Only spawn if quality is Lock or Wobble, regardless of duration.
        if (timingResult.quality !== 'reject') {
            spawnParticle();
        }
    }, [endHold, spawnParticle, evaluateRelease, emitSnap]);

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
