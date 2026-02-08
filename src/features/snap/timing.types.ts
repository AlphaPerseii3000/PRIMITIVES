/**
 * Snap Timing Types
 */

/**
 * Categorization of how well a release timed with the beat.
 * - 'lock': Perfect/Near-perfect precision (±40ms)
 * - 'wobble': Close enough but slightly off (±90ms)
 * - 'reject': Too far from the beat or mistimed
 */
export type TimingQuality = 'lock' | 'wobble' | 'reject';

/**
 * Detailed result of a timing evaluation.
 */
export interface TimingResult {
    /** The classification of the timing quality */
    quality: TimingQuality;
    /** Time difference from the nearest beat in milliseconds (negative = early, positive = late) */
    deltaMs: number;
    /** The beat index/position this release was closest to */
    beatPosition: number;
}
