import { Color } from 'three';

// -----------------------------------------------------------------------------
// VISUAL CONSTANTS - SNAP FEEDBACK
// -----------------------------------------------------------------------------

// Colors per quality
export const SNAP_FLASH_COLOR_LOCK = new Color('#00ff88'); // Green / Cyan-ish
export const SNAP_FLASH_COLOR_WOBBLE = new Color('#ffaa00'); // Amber / Yellow
export const SNAP_FLASH_COLOR_REJECT = new Color('#ff3333'); // Red

// Bloom Intensity (Boost emissive above threshold 1.0)
export const SNAP_BLOOM_LOCK = 4.0;
export const SNAP_BLOOM_WOBBLE = 2.5;
export const SNAP_BLOOM_REJECT = 1.2;

// Burst Particle Counts
export const SNAP_BURST_COUNT_LOCK = 12;
export const SNAP_BURST_COUNT_WOBBLE = 6;
export const SNAP_BURST_COUNT_REJECT = 0;

// Timing (ms)
export const SNAP_FLASH_DURATION_MS = 300;
export const SNAP_BURST_DURATION_MS = 500;

// Animation Physics
export const SNAP_BURST_SPEED = 3.0; // Units per second
export const SNAP_BURST_FADE_RATE = 2.0;

// Configuration
export const DEFAULT_VISUAL_CONFIG = {
    enabled: true,
    bloomIntensity: SNAP_BLOOM_LOCK,
    burstCount: SNAP_BURST_COUNT_LOCK,
    burstDuration: SNAP_BURST_DURATION_MS,
};
