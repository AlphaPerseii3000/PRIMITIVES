import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { InstancedMesh, Matrix4, Vector3, Color } from 'three';
import { snapVisualRef } from '../hooks/useSnapVisualFeedback';
import {
    SNAP_BURST_DURATION_MS,
    SNAP_BURST_SPEED,
    SNAP_FLASH_COLOR_LOCK,
    SNAP_FLASH_COLOR_WOBBLE,
    SNAP_FLASH_COLOR_REJECT
} from '../snap-visual.constants';

const MAX_BURST = 16;

const QUALITY_COLORS = {
    lock: SNAP_FLASH_COLOR_LOCK,
    wobble: SNAP_FLASH_COLOR_WOBBLE,
    reject: SNAP_FLASH_COLOR_REJECT,
} as const;

// Pre-allocated
const tempColor = new Color();

export function SnapBurst() {
    const meshRef = useRef<InstancedMesh>(null);

    // Pre-allocate direction vectors and temp matrix
    const directions = useMemo(() => {
        const arr = [];
        for (let i = 0; i < MAX_BURST; i++) {
            const angle = (i / MAX_BURST) * Math.PI * 2; // Deterministic distribution
            arr.push(new Vector3(Math.cos(angle), 0, Math.sin(angle)));
        }
        return arr;
    }, []);

    const tempMatrix = useMemo(() => new Matrix4(), []);
    const tempPos = useMemo(() => new Vector3(), []);

    useFrame(() => {
        if (!meshRef.current) return;
        const feedback = snapVisualRef.current;

        // If inactive, hide instances
        if (!feedback || !feedback.active || feedback.burstCount === 0) {
            meshRef.current.count = 0;
            return;
        }

        const duration = feedback.burstDuration ?? SNAP_BURST_DURATION_MS;
        const elapsed = performance.now() - feedback.timestamp;
        const progress = Math.min(elapsed / duration, 1);

        if (progress >= 1) {
            meshRef.current.count = 0;
            return;
        }

        // Set active count
        meshRef.current.count = Math.min(feedback.burstCount, MAX_BURST);

        const decay = 1 - progress;
        const scale = decay * 0.15; // Shrink as they expand (starts small)

        // Eased distance
        const easeOutQuad = 1 - (1 - progress) * (1 - progress);
        const distance = easeOutQuad * SNAP_BURST_SPEED;

        // Color & Intensity
        const color = QUALITY_COLORS[feedback.quality] || QUALITY_COLORS.lock;
        const intensity = feedback.bloomIntensity ?? 3.0; // Default if null

        // Apply to material for ALL instances (simplification vs setColorAt which is per-instance)
        // Since all burst particles are same color for a single snap, we can update material directly.
        // If we needed mixed colors, we'd use setColorAt.
        // Ideally we shouldn't mutate material in useFrame if shared, but here it's specific to this component.
        // However, to be safe and performant for instanced mesh, let's just set the material color.
        // NOTE: InstancedMesh usually shares material. If we have multiple bursts overlapping with different colors,
        // we MUST use setColorAt. But SnapVisualFeedback is singleton-ish (one active snap at a time logic in ref).
        // Let's use setColorAt to be safe and proper R3F.

        // Actually, looking at requirements, "Color matches quality".
        // Let's use setColorAt for robust implementation.
        tempColor.copy(color);
        // Emissive intensity is on material, so we might need to update material if we want bloom control.
        // But setColorAt only sets albedo/color. 
        // Emissive color is usually linked to color in standard material if we want it to match.
        // For bloom we need high values. 
        // Strategy: Set mesh color to [r*intensity, g*intensity, b*intensity] ? 
        // No, standard material handles emissive separately.
        // If we want dynamic emissive intensity per instance, we can't easily do it without custom shader or attributes.
        // Fallback: Update material uniform since we likely only have one burst active at a time effectively.
        // If we really need overlap, we'd need a custom shader. 
        // Given complexity constraint, let's update material properties, assuming sequential snaps.
        if (Array.isArray(meshRef.current.material)) {
            // Should be single material
        } else {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const mat = meshRef.current.material as any;
            mat.emissive.copy(color);
            mat.emissiveIntensity = intensity;
        }

        for (let i = 0; i < meshRef.current.count; i++) {
            tempPos.set(
                feedback.position.x + directions[i].x * distance,
                0.1,
                feedback.position.z + directions[i].z * distance
            );
            tempMatrix.makeScale(scale, scale, scale);
            tempMatrix.setPosition(tempPos);
            meshRef.current.setMatrixAt(i, tempMatrix);

            // If using colored instances (optional if material is global color)
            // meshRef.current.setColorAt(i, tempColor);
        }
        meshRef.current.instanceMatrix.needsUpdate = true;
        // meshRef.current.instanceColor!.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, MAX_BURST]} frustumCulled={false}>
            <sphereGeometry args={[0.5, 8, 8]} />
            <meshStandardMaterial
                emissive="#00ff88" // Initial, overridden by useFrame
                emissiveIntensity={3.0}
                transparent
                opacity={0.8}
                depthWrite={false}
                toneMapped={false}
            />
        </instancedMesh>
    );
}
