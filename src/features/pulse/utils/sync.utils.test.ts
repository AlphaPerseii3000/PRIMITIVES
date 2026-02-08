import { describe, it, expect } from 'vitest';
import { measureSyncDelta, calculateRollingAverage } from './sync.utils';

describe('sync.utils', () => {
    describe('measureSyncDelta', () => {
        it('calculates positive delta when visual is late', () => {
            // Audio at 1000ms, Visual at 1020ms -> 20ms late
            expect(measureSyncDelta(1000, 1020)).toBe(20);
        });

        it('calculates negative delta when visual is early', () => {
            // Audio at 1000ms, Visual at 980ms -> 20ms early (-20ms)
            expect(measureSyncDelta(1000, 980)).toBe(-20);
        });

        it('calculates zero delta when perfectly synced', () => {
            expect(measureSyncDelta(1000, 1000)).toBe(0);
        });
    });

    describe('calculateRollingAverage', () => {
        it('calculates average of recent deltas', () => {
            const deltas = [10, 20, 30, 40, 50];
            // Sum = 150, Count = 5, Avg = 30
            expect(calculateRollingAverage(deltas)).toBe(30);
        });

        it('returns 0 for empty array', () => {
            expect(calculateRollingAverage([])).toBe(0);
        });

        it('handles negative numbers correctly', () => {
            const deltas = [-10, 10, -20, 20];
            expect(calculateRollingAverage(deltas)).toBe(0);
        });

        it('handles floating point precision reasonably', () => {
            const deltas = [10.5, 20.5];
            expect(calculateRollingAverage(deltas)).toBe(15.5);
        });
    });
});
