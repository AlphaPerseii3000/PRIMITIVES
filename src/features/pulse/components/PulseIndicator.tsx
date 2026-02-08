import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, MeshStandardMaterial } from 'three';
import { usePulse } from '../../../engine/clock';

// ============================================================================
// Animation Constants
// ============================================================================
/** Factor by which the sphere scales at beat peak (1.0 + SCALE_FACTOR = 1.3) */
const SCALE_FACTOR = 0.3;
/** Base emissive intensity when not at beat peak */
const EMISSIVE_BASE = 0.5;
/** Additional emissive intensity added at beat peak (0.5 + 1.5 = 2.0) */
const EMISSIVE_BOOST = 1.5;
/** Sphere radius in world units */
const SPHERE_RADIUS = 1;
/** Sphere geometry segments for smooth appearance */
const SPHERE_SEGMENTS = 32;
/** Pulse indicator color (cyan) */
const PULSE_COLOR = '#00ffff';

export interface PulseIndicatorProps {
    /** Position in 3D space, defaults to scene center */
    position?: [number, number, number];
}

/**
 * Visual pulse indicator that animates in sync with the game's 120 BPM rhythm.
 *
 * Uses the `usePulse` hook to access the clock's phase (0-1) and applies:
 * - Scale animation: 1.0 (rest) → 1.3 (beat peak)
 * - Emissive intensity: 0.5 (rest) → 2.0 (beat peak) for bloom pickup
 *
 * Animation uses cubic ease-out for a punchy "hit" feel with smooth decay.
 *
 * @example
 * ```tsx
 * <PulseIndicator position={[0, 0, 0]} />
 * ```
 */
export const PulseIndicator = ({ position = [0, 0, 0] }: PulseIndicatorProps) => {
    const meshRef = useRef<Mesh>(null);
    const materialRef = useRef<MeshStandardMaterial>(null);
    const clockRef = usePulse();

    useFrame(() => {
        if (!meshRef.current || !materialRef.current || !clockRef.current) return;

        const { phase } = clockRef.current;

        // Phase is 0 at beat hit, approaching 1 just before next beat.
        // Invert to get 1 at beat hit, 0 at rest.
        const t = 1 - phase;

        // Cubic ease-out: quick attack, slow decay (punchy "hit" feel)
        const eased = t * t * t;

        // Apply scale: base (1.0) + eased factor (0.0 to 0.3)
        const scale = 1 + eased * SCALE_FACTOR;
        meshRef.current.scale.setScalar(scale);

        // Apply emissive intensity for bloom: base (0.5) + boost (0.0 to 1.5)
        // Intensity > 1.0 triggers bloom via PostProcessing luminanceThreshold
        const intensity = EMISSIVE_BASE + eased * EMISSIVE_BOOST;
        materialRef.current.emissiveIntensity = intensity;
    });

    return (
        <mesh ref={meshRef} position={position}>
            <sphereGeometry args={[SPHERE_RADIUS, SPHERE_SEGMENTS, SPHERE_SEGMENTS]} />
            <meshStandardMaterial
                ref={materialRef}
                color={PULSE_COLOR}
                emissive={PULSE_COLOR}
                emissiveIntensity={EMISSIVE_BASE}
            />
        </mesh>
    );
};
