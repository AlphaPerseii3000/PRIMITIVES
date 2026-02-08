/**
 * Snap Timing Constants
 * 
 * Default windows for rhythm precision detection.
 * Can be overridden by Leva controls.
 */

/**
 * Window for a 'Lock' (Perfect) result (±40ms)
 */
export const SNAP_PERFECT_WINDOW_MS = 40;

/**
 * Window for a 'Wobble' (Good) result (±90ms)
 */
export const SNAP_GOOD_WINDOW_MS = 90;

/**
 * Default BPM if transport is not available or initialized
 */
export const DEFAULT_BPM = 120;
