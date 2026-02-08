/**
 * Wave Mode Navigation Constants
 * 
 * Physics parameters for the "surfing on waves" movement feel.
 * All values are tuned for smooth, inertia-driven movement.
 */

// ============================================================================
// Damping & Inertia
// ============================================================================

/**
 * Damping factor applied to velocity each frame (0.92-0.98 range).
 * Higher = more momentum (slides longer), Lower = quicker stop.
 * @default 0.95 - Balanced feel between responsive and floaty
 */
export const WAVE_DAMPING = 0.95;

/**
 * Minimum velocity magnitude before snapping to zero.
 * Prevents endless micro-movements.
 * @default 0.001 - Nearly imperceptible threshold
 */
export const WAVE_INERTIA_THRESHOLD = 0.001;

// ============================================================================
// Speed & Sensitivity
// ============================================================================

/**
 * Sensitivity multiplier for mouse movement to velocity conversion.
 * Higher = faster response to mouse movement.
 * @default 0.005 - Tuned for smooth acceleration
 */
export const WAVE_SENSITIVITY = 0.005;

/**
 * Maximum velocity magnitude (units per frame at 60fps).
 * Prevents disorientation from too-fast movement.
 * @default 0.5 - Fast but controllable
 */
export const WAVE_MAX_SPEED = 0.5;

// ============================================================================
// Interaction & Timing
// ============================================================================

/**
 * Maximum duration for a "tap" interaction (milliseconds).
 * Below this = Spawn, Above this = Brake/Charge.
 * @default 200
 */
export const TAP_THRESHOLD_MS = 200;

// ============================================================================
// Hold & Charge Mechanics
// ============================================================================

/**
 * Damping factor applied when holding brake (multiplied by WAVE_DAMPING).
 * Lower = Stronger braking.
 * @default 0.7 - Stronger deceleration than normal
 */
export const HOLD_BRAKE_FACTOR = 0.7;

/**
 * Rate at which charge accumulates per second.
 * 1.0 means 1 second to full charge.
 * @default 1.0
 */
export const CHARGE_RATE = 1.0;

/**
 * Charge threshold to trigger position lock.
 * @default 0.99
 */
export const CHARGE_LOCK_THRESHOLD = 0.99;

/**
 * Visual scale boost for cursor when fully charged.
 * @default 2.0
 */
export const CHARGE_VISUAL_SCALE_BOOST = 2.0;

// ============================================================================
// Cursor Visual
// ============================================================================

/**
 * Base scale of the wave cursor mesh
 * @default 0.2 - Small but visible indicator
 */
export const CURSOR_BASE_SCALE = 0.2;

/**
 * Scale multiplier when moving at max speed (1.0 + BOOST = 1.5)
 * @default 0.5 - 50% bigger when moving fast
 */
export const CURSOR_SCALE_BOOST = 0.5;

/**
 * Base emissive intensity for the cursor (for bloom)
 * @default 0.5 - Visible but not overwhelming
 */
export const CURSOR_EMISSIVE_BASE = 0.5;

/**
 * Emissive intensity boost when moving (base + boost = 2.0)
 * @default 1.5 - Strong bloom when active
 */
export const CURSOR_EMISSIVE_BOOST = 1.5;

/**
 * Cursor color (matches pulse indicator aesthetic)
 * @default '#ff00ff' - Magenta for contrast with cyan pulse
 */
export const CURSOR_COLOR = '#ff00ff';
