import { describe, it, expect } from 'vitest';
import { calculateTimingDelta, classifyTiming, evaluateTiming, getNearestBeatPosition } from './snap.utils';

describe('Snap Timing Utilities', () => {
    describe('calculateTimingDelta', () => {
        const BPM = 120; // 0.5s per beat
        const OFFSET = 0;

        it('should return 0 when exactly on the beat', () => {
            expect(calculateTimingDelta(0.5, BPM, OFFSET)).toBeCloseTo(0);
            expect(calculateTimingDelta(1.0, BPM, OFFSET)).toBeCloseTo(0);
            expect(calculateTimingDelta(0, BPM, OFFSET)).toBeCloseTo(0);
        });

        it('should return positive delta for late release', () => {
            // 0.5s is beat 1. 0.55s is 50ms late.
            expect(calculateTimingDelta(0.55, BPM, OFFSET)).toBeCloseTo(50);
        });

        it('should return negative delta for early release', () => {
            // 0.5s is beat 1. 0.45s is 50ms early.
            expect(calculateTimingDelta(0.45, BPM, OFFSET)).toBeCloseTo(-50);
        });

        it('should handle sync offset correctly', () => {
            // If offset is 100ms, then adjustedTime = 0.6 - 0.1 = 0.5 (exact beat)
            expect(calculateTimingDelta(0.6, BPM, 100)).toBeCloseTo(0);
        });

        it('should correctly identify the nearest beat at large times', () => {
            // Beat at 10.0s (beat 20 at 120bpm)
            expect(calculateTimingDelta(10.01, BPM, 0)).toBeCloseTo(10);
            expect(calculateTimingDelta(9.99, BPM, 0)).toBeCloseTo(-10);
        });
    });

    describe('classifyTiming', () => {
        const PERFECT = 40;
        const GOOD = 90;

        it('should classify as lock within perfect window', () => {
            expect(classifyTiming(0, PERFECT, GOOD)).toBe('lock');
            expect(classifyTiming(40, PERFECT, GOOD)).toBe('lock');
            expect(classifyTiming(-40, PERFECT, GOOD)).toBe('lock');
        });

        it('should classify as wobble within good window but outside perfect', () => {
            expect(classifyTiming(41, PERFECT, GOOD)).toBe('wobble');
            expect(classifyTiming(90, PERFECT, GOOD)).toBe('wobble');
            expect(classifyTiming(-41, PERFECT, GOOD)).toBe('wobble');
            expect(classifyTiming(-90, PERFECT, GOOD)).toBe('wobble');
        });

        it('should classify as reject outside good window', () => {
            expect(classifyTiming(91, PERFECT, GOOD)).toBe('reject');
            expect(classifyTiming(-91, PERFECT, GOOD)).toBe('reject');
            expect(classifyTiming(200, PERFECT, GOOD)).toBe('reject');
        });
    });

    describe('evaluateTiming', () => {
        it('should return complete TimingResult', () => {
            const result = evaluateTiming(0.55, 120, 0, 40, 90);
            expect(result).toEqual({
                quality: 'wobble',
                deltaMs: expect.any(Number),
                beatPosition: 1
            });
            expect(result.deltaMs).toBeCloseTo(50);
        });
    });

    describe('getNearestBeatPosition', () => {
        const BPM = 60; // 1s per beat
        const OFFSET = 0;

        it('should return 0 for times near 0', () => {
            expect(getNearestBeatPosition(0.1, BPM, OFFSET)).toBe(0);
            expect(Math.abs(getNearestBeatPosition(-0.1, BPM, OFFSET))).toBe(0);
        });

        it('should round to nearest beat', () => {
            // Beat 1 at 1.0s
            expect(getNearestBeatPosition(0.9, BPM, OFFSET)).toBe(1);
            expect(getNearestBeatPosition(1.1, BPM, OFFSET)).toBe(1);
            expect(getNearestBeatPosition(1.49, BPM, OFFSET)).toBe(1);
            expect(getNearestBeatPosition(1.51, BPM, OFFSET)).toBe(2);
        });

        it('should handle large beat counts', () => {
            // Beat 100 at 100.0s
            expect(getNearestBeatPosition(100.2, BPM, OFFSET)).toBe(100);
        });
    });
});
