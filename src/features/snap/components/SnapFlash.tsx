import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, MeshStandardMaterial, Color } from 'three';
import { snapVisualRef } from '../hooks/useSnapVisualFeedback';
import {
    SNAP_FLASH_DURATION_MS,
    SNAP_FLASH_COLOR_LOCK,
    SNAP_FLASH_COLOR_WOBBLE,
    SNAP_FLASH_COLOR_REJECT,
    SNAP_BLOOM_LOCK,
    SNAP_BLOOM_WOBBLE,
    SNAP_BLOOM_REJECT,
} from '../snap-visual.constants';

const QUALITY_CONFIG = {
    lock: { color: SNAP_FLASH_COLOR_LOCK, bloom: SNAP_BLOOM_LOCK },
    wobble: { color: SNAP_FLASH_COLOR_WOBBLE, bloom: SNAP_BLOOM_WOBBLE },
    reject: { color: SNAP_FLASH_COLOR_REJECT, bloom: SNAP_BLOOM_REJECT },
} as const;

// Pre-allocated objects — NEVER create inside useFrame
const tempColor = new Color();

export function SnapFlash() {
    const meshRef = useRef<Mesh>(null);
    const matRef = useRef<MeshStandardMaterial>(null);

    useFrame(() => {
        if (!meshRef.current || !matRef.current) return;
        const feedback = snapVisualRef.current;

        // If no active feedback, hide and return
        if (!feedback || !feedback.active) {
            meshRef.current.visible = false;
            return;
        }

        const duration = feedback.burstDuration ?? SNAP_FLASH_DURATION_MS;
        const elapsed = performance.now() - feedback.timestamp;
        const progress = Math.min(elapsed / duration, 1);

        // Safety check for invalid quality (though types prevent this)
        const config = QUALITY_CONFIG[feedback.quality] || QUALITY_CONFIG.lock;

        if (progress >= 1) {
            meshRef.current.visible = false;
            // Optionally reset active state here or let next snap override
            return;
        }

        // Position at snap location (y=0.1 to sit just above floor)
        meshRef.current.position.set(feedback.position.x, 0.1, feedback.position.z);
        meshRef.current.visible = true;

        // Scale: expand from 0.5 → 2.0
        const scale = 0.5 + progress * 1.5;
        meshRef.current.scale.setScalar(scale);

        // Emissive: decay from peak → 0 (cubic ease-out for punchy feel)
        const decay = 1 - progress;
        const eased = decay * decay * decay;

        // Update material properties
        const peakBloom = feedback.bloomIntensity ?? config.bloom;
        matRef.current.emissiveIntensity = eased * peakBloom;
        matRef.current.opacity = eased;

        // Update colors
        tempColor.set(config.color);
        matRef.current.color.copy(tempColor);
        matRef.current.emissive.copy(tempColor);
    });

    return (
        <mesh ref={meshRef} visible={false} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.3, 1.2, 32]} />
            <meshStandardMaterial
                ref={matRef}
                transparent
                opacity={0}
                depthWrite={false}
                toneMapped={false} // Allow colors to exceed 1.0 for bloom
            />
        </mesh>
    );
}
