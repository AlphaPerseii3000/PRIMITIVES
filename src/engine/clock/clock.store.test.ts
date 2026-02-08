import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useClockStore } from './clock.store';
import * as Tone from 'tone';
import { DEFAULT_BPM, RAMP_DURATION, MIN_BPM, MAX_BPM } from './clock.constants';

// Mock Tone.js
vi.mock('tone', () => ({
    Transport: {
        bpm: {
            rampTo: vi.fn(),
            value: 120
        }
    }
}));

describe('useClockStore', () => {
    beforeEach(() => {
        useClockStore.setState({ bpm: DEFAULT_BPM });
        vi.clearAllMocks();
    });

    it('should have default BPM', () => {
        expect(useClockStore.getState().bpm).toBe(DEFAULT_BPM);
    });

    it('should update BPM and call Transport.rampTo', () => {
        const newBpm = 140;
        useClockStore.getState().setBpm(newBpm);

        expect(useClockStore.getState().bpm).toBe(newBpm);
        expect(Tone.Transport.bpm.rampTo).toHaveBeenCalledWith(newBpm, RAMP_DURATION);
    });

    it('should clamp BPM to minimum', () => {
        const lowBpm = MIN_BPM - 10;
        useClockStore.getState().setBpm(lowBpm);

        expect(useClockStore.getState().bpm).toBe(MIN_BPM);
        expect(Tone.Transport.bpm.rampTo).toHaveBeenCalledWith(MIN_BPM, RAMP_DURATION);
    });

    it('should clamp BPM to maximum', () => {
        const highBpm = MAX_BPM + 10;
        useClockStore.getState().setBpm(highBpm);

        expect(useClockStore.getState().bpm).toBe(MAX_BPM);
        expect(Tone.Transport.bpm.rampTo).toHaveBeenCalledWith(MAX_BPM, RAMP_DURATION);
    });
});
