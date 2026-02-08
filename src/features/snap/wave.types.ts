/**
 * Wave Mode Navigation Types
 * 
 * Types for the "surfing on waves of energy" navigation system.
 * Player movement uses inertia/momentum for fluid, wavy movement.
 */

/**
 * 2D vector for XZ plane movement
 */
export interface Vector2D {
    x: number;
    z: number;
}

/**
 * Wave state for player navigation
 * Position is on the XZ plane (horizontal movement)
 * Velocity has momentum and damping for "wavy" feel
 */
export interface WaveState {
    /** Current position on XZ plane */
    position: Vector2D;
    /** Current velocity vector (applies damping each frame) */
    velocity: Vector2D;
}

/**
 * Actions available on the wave store
 */
export interface WaveActions {
    /** Add velocity from input delta */
    updateVelocity: (delta: Vector2D) => void;
    /** Apply damping to current velocity (call every frame) */
    applyDamping: (delta?: number) => void;
    /** Set position directly (for reset/teleport) */
    setPosition: (pos: Vector2D) => void;
    /** Reset wave state to initial values */
    reset: () => void;
}
