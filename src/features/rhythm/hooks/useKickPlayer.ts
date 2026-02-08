import { useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { useBeatCallback } from '../../../engine/clock';

/**
 * Hook to play a synthesized kick drum on every quarter note beat.
 * Synchronized with the master Tone.Transport clock.
 * 
 * @param volume - Volume in decibels (default: 0)
 * @param muted - Whether the kick should be muted (default: false)
 */
export const useKickPlayer = (volume: number = 0, muted: boolean = false) => {
    const synthRef = useRef<Tone.MembraneSynth | null>(null);

    // Initial setup
    useEffect(() => {
        const synth = new Tone.MembraneSynth({
            pitchDecay: 0.05,
            octaves: 10,
            oscillator: { type: 'sine' },
            envelope: {
                attack: 0.001,
                decay: 0.4,
                sustain: 0,
                release: 1.4,
            },
        }).toDestination();

        synthRef.current = synth;

        return () => {
            synth.dispose();
            synthRef.current = null;
        };
    }, []);

    // Efficiently update volume and mute state without recreating the synth
    useEffect(() => {
        if (synthRef.current) {
            // Tone.js uses decibels. -Infinity is silent/muted.
            synthRef.current.volume.value = muted ? -Infinity : volume;
        }
    }, [volume, muted]);

    // Schedule playback on every quarter note ("4n")
    useBeatCallback((time) => {
        if (synthRef.current && !muted) {
            // Precise trigger with Tone.Transport time
            synthRef.current.triggerAttackRelease('C1', '8n', time);
        }
    }, '4n');
};
