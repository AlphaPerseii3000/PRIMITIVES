import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, MeshStandardMaterial, MathUtils } from 'three';
import { useWaveStore } from '../wave.store';
import { usePulse } from '../../../engine/clock';
import { PARTICLE_RADIUS, PARTICLE_COLOR } from '../../structures/particle.constants';
import {
    GHOST_OPACITY_MIN,
    GHOST_OPACITY_MAX,
    GHOST_EMISSIVE_BASE,
    GHOST_EMISSIVE_PULSE_BOOST,
    GHOST_CHARGE_PULSE_THRESHOLD,
    GHOST_SCALE_FACTOR,
} from '../ghost-preview.constants';

export interface GhostPreviewProps {
    enabled?: boolean;
    opacityMin?: number;
    opacityMax?: number;
    pulseIntensity?: number;
    /** Y position of the ghost (height above XZ plane). Defaults to 0.1 */
    height?: number;
}

export function GhostPreview({
    enabled = true,
    opacityMin = GHOST_OPACITY_MIN,
    opacityMax = GHOST_OPACITY_MAX,
    pulseIntensity = GHOST_EMISSIVE_PULSE_BOOST,
    height = 0.1,
}: GhostPreviewProps) {
    const meshRef = useRef<Mesh>(null);
    const materialRef = useRef<MeshStandardMaterial>(null);
    const clockRef = usePulse();

    useFrame(() => {
        if (!meshRef.current || !materialRef.current) return;

        if (!enabled) {
            meshRef.current.visible = false;
            return;
        }

        const { input } = useWaveStore.getState();
        const { holding, charge, lockPosition } = input;

        if (!holding || !lockPosition) {
            meshRef.current.visible = false;
            return;
        }

        // Show ghost at lock position
        meshRef.current.visible = true;
        meshRef.current.position.set(lockPosition.x, height, lockPosition.z);

        // Opacity: interpolate with charge
        const opacity = MathUtils.lerp(opacityMin, opacityMax, charge);
        materialRef.current.opacity = opacity;

        // Emissive: base + beat pulse (increases with charge)
        let emissiveIntensity = GHOST_EMISSIVE_BASE;

        if (charge > GHOST_CHARGE_PULSE_THRESHOLD && clockRef.current) {
            const { phase } = clockRef.current;
            const pulse = Math.sin(phase * Math.PI * 2) * 0.5 + 0.5;
            emissiveIntensity += pulse * pulseIntensity * charge;
        }

        materialRef.current.emissiveIntensity = emissiveIntensity;
    });

    return (
        <mesh ref={meshRef} visible={false} scale={GHOST_SCALE_FACTOR}>
            <sphereGeometry args={[PARTICLE_RADIUS, 32, 32]} />
            <meshStandardMaterial
                ref={materialRef}
                color={PARTICLE_COLOR}
                emissive={PARTICLE_COLOR}
                transparent
                opacity={0}
                depthWrite={false}
            />
        </mesh>
    );
}
