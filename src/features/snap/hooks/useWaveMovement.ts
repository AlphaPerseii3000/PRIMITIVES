/**
 * useWaveMovement Hook
 * 
 * Handles mouse input and applies wave physics for smooth, inertia-driven navigation.
 * Uses a hidden plane to capture pointer movement across the entire canvas.
 */
import { useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { useWaveStore } from '../wave.store';

/**
 * Hook that manages wave movement physics.
 * 
 * Call this hook once in your scene to enable wave navigation.
 * Returns a handler for pointer movement events.
 * 
 * The hook:
 * 1. Converts pointer movement to velocity (with sensitivity)
 * 2. Applies damping each frame for inertia
 * 3. Updates position based on velocity
 * 
 * @returns Object with pointerMoveHandler to attach to a capture mesh
 * 
 * @example
 * ```tsx
 * const { pointerMoveHandler } = useWaveMovement();
 * 
 * return (
 *   <mesh onPointerMove={pointerMoveHandler} visible={false}>
 *     <planeGeometry args={[1000, 1000]} />
 *   </mesh>
 * );
 * ```
 */
export const useWaveMovement = () => {
    const updateVelocity = useWaveStore(state => state.updateVelocity);


    /**
     * Handle pointer movement events.
     * Converts screen-space movement to velocity delta.
     */
    const pointerMoveHandler = useCallback((event: { movementX: number; movementY: number }) => {
        // Use movement delta directly (already normalized by browser)
        // movementX/Y is the delta since last event
        const deltaX = event.movementX;
        const deltaY = event.movementY;

        // Map Y movement to Z axis (screen Y → world Z)
        updateVelocity({ x: deltaX, z: deltaY });
    }, [updateVelocity]);

    /**
     * Apply damping every frame for smooth deceleration.
     * Also accumulate charge if holding.
     */
    useFrame((_state, delta) => {
        const { applyDamping, updateCharge, input } = useWaveStore.getState();

        applyDamping(delta);

        if (input.holding) {
            updateCharge(delta);
        }
    });

    return {
        pointerMoveHandler
    };
};
