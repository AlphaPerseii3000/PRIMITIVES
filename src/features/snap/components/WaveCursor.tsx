/**
 * WaveCursor Component
 * 
 * Visual indicator showing player position in wave mode.
 * Animates scale and emissive intensity based on velocity for dynamic feedback.
 */
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, MeshStandardMaterial } from 'three';
import { useWaveStore, selectNormalizedSpeed } from '../wave.store';
import {
    CHARGE_VISUAL_SCALE_BOOST,
    CURSOR_BASE_SCALE,
    CURSOR_COLOR,
    CURSOR_EMISSIVE_BASE,
    CURSOR_SCALE_BOOST
} from '../wave.constants';
import { usePulse } from '../../../engine/clock';

export interface WaveCursorProps {
    /** Y position of the cursor (height above XZ plane) */
    height?: number;
}

/**
 * Visual cursor that follows the player's wave position.
 * 
 * Features:
 * - Ring geometry that sits on the XZ plane
 * - Scale animation: grows when moving fast
 * - Emissive animation: brighter when moving (selective bloom)
 * - Position updates via ref for performance (no useState in useFrame)
 * 
 * @example
 * ```tsx
 * <WaveCursor height={0.1} />
 * ```
 */
export const WaveCursor = ({ height = 0.1 }: WaveCursorProps) => {
    const meshRef = useRef<Mesh>(null);
    const materialRef = useRef<MeshStandardMaterial>(null);
    const clockRef = usePulse();

    useFrame(() => {
        if (!meshRef.current || !materialRef.current) return;

        const state = useWaveStore.getState();
        const { position } = state;
        const speedNorm = selectNormalizedSpeed(state);
        const { charge } = state.input;

        // Update position (XZ plane, constant Y height from prop)
        meshRef.current.position.set(position.x, height, position.z);

        // Base scale from speed
        // CURSOR_BASE_SCALE (0.2) + speedNorm * CURSOR_SCALE_BOOST (0.5)
        let scale = CURSOR_BASE_SCALE + speedNorm * CURSOR_SCALE_BOOST;

        // Add charge scale boost
        // Interpolate factor from 1.0 to CHARGE_VISUAL_SCALE_BOOST (2.0)
        const chargeScaleFactor = 1 + charge * (CHARGE_VISUAL_SCALE_BOOST - 1);
        scale *= chargeScaleFactor;

        // Emissive intensity
        // CURSOR_EMISSIVE_BASE (0.5) + speedNorm * 1.0 (arbitrary but matches previous logic, simplified)
        let emissiveIntensity = CURSOR_EMISSIVE_BASE + speedNorm;

        // Add charge pulse
        if (charge > 0) {
            emissiveIntensity += charge * 2.0;

            // Pulse effect when near full charge
            if (charge > 0.8 && clockRef.current) {
                const { phase } = clockRef.current;
                const pulse = Math.sin(phase * Math.PI * 2) * 0.5 + 0.5;
                emissiveIntensity += pulse * 1.0;
            }
        }

        meshRef.current.scale.setScalar(scale);
        materialRef.current.emissiveIntensity = emissiveIntensity;
    });

    return (
        <mesh ref={meshRef} position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.5, 0.6, 32]} />
            <meshStandardMaterial
                ref={materialRef}
                color={CURSOR_COLOR}
                emissive={CURSOR_COLOR}
                emissiveIntensity={CURSOR_EMISSIVE_BASE}
                transparent
                opacity={0.8}
            />
        </mesh>
    );
};
