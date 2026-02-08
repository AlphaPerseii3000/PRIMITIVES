/**
 * WaveInput Component
 * 
 * Invisible plane that captures pointer movement for wave navigation.
 * Sits at Y=0 on the XZ plane, rotated to face up.
 */
import { useWaveMovement } from '../hooks/useWaveMovement';
import type { ThreeEvent } from '@react-three/fiber';

// Large enough to capture all pointer events
const CAPTURE_PLANE_SIZE = 2000;

/**
 * Input handler component for wave mode navigation.
 * 
 * Uses an invisible plane to capture pointer movement across the entire viewport.
 * The plane is positioned at Y=0 (ground level) and rotated to face up.
 * 
 * @example
 * ```tsx
 * <WaveInput />
 * <WaveCursor />
 * ```
 */
export const WaveInput = () => {
    const { pointerMoveHandler } = useWaveMovement();

    return (
        <mesh
            visible={false}
            position={[0, 0, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            onPointerMove={(e: ThreeEvent<PointerEvent>) => {
                // Use native event for movementX/Y
                pointerMoveHandler({
                    movementX: e.nativeEvent.movementX,
                    movementY: e.nativeEvent.movementY
                });
            }}
        >
            <planeGeometry args={[CAPTURE_PLANE_SIZE, CAPTURE_PLANE_SIZE]} />
            <meshBasicMaterial transparent opacity={0} />
        </mesh>
    );
};
