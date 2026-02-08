/** Default tempo in beats per minute - The Universal Pulse */
export const DEFAULT_BPM = 120 as const;

/** Minimum allowed BPM */
export const MIN_BPM = 60 as const;

/** Maximum allowed BPM */
export const MAX_BPM = 180 as const;

/** Duration in seconds for smooth tempo transitions to avoid audio glitches */
export const RAMP_DURATION = 0.2 as const;

/** Update interval for clock state - 16th note for smooth animations (~31ms at 120 BPM) */
export const CLOCK_UPDATE_INTERVAL = '16n' as const;

/** Number of beats per measure (4/4 time signature) */
export const BEATS_PER_MEASURE = 4 as const;
