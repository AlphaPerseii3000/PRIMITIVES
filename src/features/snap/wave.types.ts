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
 * Input state for hold-to-brake mechanic
 */
export interface InputState {
    /** Whether the user is holding the interaction button (Left Click) */
    holding: boolean;
    /** Current charge level (0.0 to 1.0) */
    charge: number;
    /** Position to lock to when fully charged */
    lockPosition: Vector2D | null;
}



/**
 * Configuration for wave mechanics (tunable via Leva)
 */
export interface WaveConfig {
    /** Damping factor multiplier when holding (0.0 to 1.0) */
    holdBrakeFactor: number;
    /** Rate at which charge accumulates per second */
    chargeRate: number;
    /** Charge threshold to trigger position lock */
    chargeLockThreshold: number;
    /** Base damping factor (0.92 to 0.98) */
    damping: number;
    /** Mouse sensitivity multiplier */
    sensitivity: number;
    /** Maximum velocity magnitude */
    maxSpeed: number;
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
    /** Input state for hold/charge mechanics */
    input: InputState;
    /** Runtime configuration */
    config: WaveConfig;
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
    /** Start holding brake/charge */
    startHold: () => void;
    /** Release brake/charge */
    endHold: () => void;
    /** Update charge level */
    updateCharge: (delta: number) => void;
    /** Update configuration */
    setConfig: (config: Partial<import('./wave.types').WaveConfig>) => void;
}
