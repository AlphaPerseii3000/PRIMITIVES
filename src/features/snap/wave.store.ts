/**
 * Wave Mode State Store
 * 
 * Zustand store for managing wave navigation state.
 * Handles position, velocity, damping, and speed capping.
 */
import { create } from 'zustand';
import type { WaveState, WaveActions, Vector2D } from './wave.types';
import {
    WAVE_DAMPING,
    WAVE_INERTIA_THRESHOLD,
    WAVE_MAX_SPEED,
    WAVE_SENSITIVITY
} from './wave.constants';

// ============================================================================
// Initial State
// ============================================================================

const INITIAL_STATE: WaveState = {
    position: { x: 0, z: 0 },
    velocity: { x: 0, z: 0 }
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Calculate vector magnitude
 */
const magnitude = (v: Vector2D): number => Math.sqrt(v.x * v.x + v.z * v.z);

/**
 * Clamp velocity to max speed while preserving direction
 */
const clampVelocity = (v: Vector2D, maxSpeed: number): Vector2D => {
    const mag = magnitude(v);
    if (mag <= maxSpeed) return v;
    const scale = maxSpeed / mag;
    return { x: v.x * scale, z: v.z * scale };
};

// ============================================================================
// Store
// ============================================================================

export const useWaveStore = create<WaveState & WaveActions>()((set, get) => ({
    ...INITIAL_STATE,

    updateVelocity: (delta: Vector2D) => {
        const { velocity } = get();

        // Add mouse delta to velocity (with sensitivity)
        const newVelocity: Vector2D = {
            x: velocity.x + delta.x * WAVE_SENSITIVITY,
            z: velocity.z + delta.z * WAVE_SENSITIVITY
        };

        // Clamp to max speed
        const clamped = clampVelocity(newVelocity, WAVE_MAX_SPEED);

        set({ velocity: clamped });
    },

    applyDamping: (delta: number = 1 / 60) => {
        const { velocity, position } = get();

        // Time scaling factor (relative to 60 FPS)
        // This preserves the feel of the constants which were tuned for ~60 FPS
        const timeScale = delta * 60;

        // Apply damping with exponential decay
        // velocity *= DAMPING^timeScale
        const dampingFactor = Math.pow(WAVE_DAMPING, timeScale);
        let newVx = velocity.x * dampingFactor;
        let newVz = velocity.z * dampingFactor;

        // Snap to zero if below threshold
        const mag = magnitude({ x: newVx, z: newVz });
        if (mag < WAVE_INERTIA_THRESHOLD) {
            newVx = 0;
            newVz = 0;
        }

        // Update position with velocity (scaled by time)
        const newPosition: Vector2D = {
            x: position.x + newVx * timeScale,
            z: position.z + newVz * timeScale
        };

        set({
            velocity: { x: newVx, z: newVz },
            position: newPosition
        });
    },

    setPosition: (pos: Vector2D) => {
        set({ position: pos });
    },

    reset: () => {
        set(INITIAL_STATE);
    }
}));

// ============================================================================
// Selectors
// ============================================================================

/** Get current velocity magnitude (0 to WAVE_MAX_SPEED) */
export const selectSpeed = (state: WaveState): number =>
    magnitude(state.velocity);

/** Get normalized speed (0 to 1) for UI/visual feedback */
export const selectNormalizedSpeed = (state: WaveState): number =>
    Math.min(1, magnitude(state.velocity) / WAVE_MAX_SPEED);
