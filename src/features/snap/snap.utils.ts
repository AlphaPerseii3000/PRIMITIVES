import type { TimingQuality, TimingResult } from './timing.types';

/**
 * Calculates the delta in milliseconds from the nearest beat.
 * 
 * @param releaseTimeSeconds - Time of release from Tone.Transport.seconds
 * @param bpm - Current BPM from Tone.Transport.bpm.value
 * @param offsetMs - Sync offset from useSyncStore.syncOffset
 * @returns Time from nearest beat in ms (negative = early, positive = late)
 */
export const calculateTimingDelta = (
    releaseTimeSeconds: number,
    bpm: number,
    offsetMs: number
): number => {
    // 1. Adjust time by sync offset (compensate for latency)
    const adjustedTime = releaseTimeSeconds - (offsetMs / 1000);

    // 2. Calculate beat duration
    const beatDurationSeconds = 60 / bpm;

    // 3. Find current position in beats
    const currentBeatPosition = adjustedTime / beatDurationSeconds;

    // 4. Find nearest beat index
    const nearestBeat = Math.round(currentBeatPosition);

    // 5. Calculate delta to nearest beat
    const deltaSeconds = adjustedTime - (nearestBeat * beatDurationSeconds);

    return deltaSeconds * 1000;
};

/**
 * Classifies a timing delta into a quality category.
 * 
 * @param deltaMs - Milliseconds from beat
 * @param perfectWindowMs - Threshold for 'lock' (±ms)
 * @param goodWindowMs - Threshold for 'wobble' (±ms)
 * @returns TimingQuality category
 */
export const classifyTiming = (
    deltaMs: number,
    perfectWindowMs: number,
    goodWindowMs: number
): TimingQuality => {
    const absDeltaMs = Math.abs(deltaMs);

    if (absDeltaMs <= perfectWindowMs) {
        return 'lock';
    }

    if (absDeltaMs <= goodWindowMs) {
        return 'wobble';
    }

    return 'reject';
};

/**
 * Gets the beat index closest to the given transport time.
 * 
 * @param transportSeconds - Time from Tone.Transport.seconds
 * @param bpm - Current BPM
 * @param offsetMs - Sync offset
 * @returns Nearest beat position (can be fractional if used for progress)
 */
export const getNearestBeatPosition = (
    transportSeconds: number,
    bpm: number,
    offsetMs: number
): number => {
    const adjustedTime = transportSeconds - (offsetMs / 1000);
    const beatDurationSeconds = 60 / bpm;
    return Math.round(adjustedTime / beatDurationSeconds);
};

/**
 * Orchestrates the full timing evaluation.
 */
export const evaluateTiming = (
    releaseTimeSeconds: number,
    bpm: number,
    offsetMs: number,
    perfectWindowMs: number,
    goodWindowMs: number
): TimingResult => {
    const deltaMs = calculateTimingDelta(releaseTimeSeconds, bpm, offsetMs);
    const quality = classifyTiming(deltaMs, perfectWindowMs, goodWindowMs);
    const beatPosition = getNearestBeatPosition(releaseTimeSeconds, bpm, offsetMs);

    return {
        quality,
        deltaMs,
        beatPosition
    };
};
