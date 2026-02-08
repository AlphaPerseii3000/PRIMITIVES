/** Default tempo in beats per minute - The Universal Pulse */
export const DEFAULT_BPM = 120 as const;

/** Update interval for clock state - 16th note for smooth animations (~31ms at 120 BPM) */
export const CLOCK_UPDATE_INTERVAL = '16n' as const;

/** Number of beats per measure (4/4 time signature) */
export const BEATS_PER_MEASURE = 4 as const;
