/**
 * Calculates the delta between an audio event and a visual event.
 * Positive delta means visual is late (visualTime > audioTime).
 * Negative delta means visual is early (visualTime < audioTime).
 * 
 * @param audioTime - The timestamp of the audio event (in ms)
 * @param visualTime - The timestamp of the visual event (in ms)
 * @returns The delta in milliseconds
 */
export const measureSyncDelta = (audioTime: number, visualTime: number): number => {
    return visualTime - audioTime;
};

/**
 * Calculates the rolling average of a list of numbers.
 * 
 * @param values - Array of numbers to average
 * @returns The average value, or 0 if array is empty
 */
export const calculateRollingAverage = (values: number[]): number => {
    if (values.length === 0) return 0;
    const sum = values.reduce((a, b) => a + b, 0);
    return sum / values.length;
};
