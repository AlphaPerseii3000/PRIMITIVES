/**
 * Represents the current state of the master clock
 */
export interface ClockState {
    /** Current beat position (float) */
    position: number;
    /** Current beat number (0-3 for 4/4) */
    beat: number;
    /** Current measure count */
    measure: number;
    /** 0-1 normalized within current beat */
    phase: number;
}
