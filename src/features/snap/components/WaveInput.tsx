/**
 * WaveInput Component
 * 
 * Invisible plane that captures pointer movement for wave navigation.
 * Also handles "Tap to Spawn" and "Hold to Brake/Charge" interactions.
 * Sits at Y=0 on the XZ plane, rotated to face up.
 */
import { useWaveMovement } from '../hooks/useWaveMovement';
import { useWaveInteraction } from '../hooks/useWaveInteraction';
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
    const { handlers: interactionHandlers } = useWaveInteraction();

    return (
        <mesh
            visible={false}
            position={[0, 0, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            onPointerDown={interactionHandlers.onPointerDown}
            onPointerUp={interactionHandlers.onPointerUp}
            onPointerLeave={interactionHandlers.onPointerLeave}
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
