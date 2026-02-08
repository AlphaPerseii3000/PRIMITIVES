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
    WAVE_SENSITIVITY,
    HOLD_BRAKE_FACTOR,
    CHARGE_RATE,
    CHARGE_LOCK_THRESHOLD
} from './wave.constants';
import { MathUtils } from 'three';

// ============================================================================
// Initial State
// ============================================================================

const INITIAL_STATE: WaveState = {
    position: { x: 0, z: 0 },
    velocity: { x: 0, z: 0 },
    input: {
        holding: false,
        charge: 0,
        lockPosition: null
    },
    config: {
        holdBrakeFactor: HOLD_BRAKE_FACTOR,
        chargeRate: CHARGE_RATE,
        chargeLockThreshold: CHARGE_LOCK_THRESHOLD,
        damping: WAVE_DAMPING,
        sensitivity: WAVE_SENSITIVITY,
        maxSpeed: WAVE_MAX_SPEED,
        perfectWindowMs: 40,
        goodWindowMs: 90
    }
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
        const { velocity, config } = get();

        // Add mouse delta to velocity (with sensitivity)
        const newVelocity: Vector2D = {
            x: velocity.x + delta.x * config.sensitivity,
            z: velocity.z + delta.z * config.sensitivity
        };

        // Clamp to max speed
        const clamped = clampVelocity(newVelocity, config.maxSpeed);

        set({ velocity: clamped });
    },

    applyDamping: (delta: number = 1 / 60) => {
        const { velocity, position, input, config } = get();

        // Check for position lock (full charge)
        if (input.holding && input.charge >= config.chargeLockThreshold && input.lockPosition) {
            // Lerp towards lock position
            const lerpFactor = 10 * delta; // Fast snap
            const newX = MathUtils.lerp(position.x, input.lockPosition.x, lerpFactor);
            const newZ = MathUtils.lerp(position.z, input.lockPosition.z, lerpFactor);

            set({
                position: { x: newX, z: newZ },
                velocity: { x: 0, z: 0 }
            });
            return;
        }

        // Time scaling factor (relative to 60 FPS)
        const timeScale = delta * 60;

        // Apply damping with exponential decay
        // If holding, apply stronger braking
        const dampingBase = input.holding ? (config.damping * config.holdBrakeFactor) : config.damping;

        const dampingFactor = Math.pow(dampingBase, timeScale);
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
    },

    startHold: () => {
        const { position } = get();
        set(state => ({
            input: {
                ...state.input,
                holding: true,
                lockPosition: { ...position } // Capture current position
            }
        }));
    },

    endHold: () => {
        set(state => ({
            input: {
                ...state.input,
                holding: false,
                charge: 0,
                lockPosition: null
            }
        }));
    },

    updateCharge: (delta: number) => {
        set(state => {
            const newCharge = state.input.charge + delta * state.config.chargeRate;
            return {
                input: {
                    ...state.input,
                    charge: Math.min(1.0, Math.max(0, newCharge))
                }
            };
        });
    },

    setConfig: (newConfig) => {
        set(state => ({
            config: { ...state.config, ...newConfig }
        }));
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
    Math.min(1, magnitude(state.velocity) / state.config.maxSpeed);
