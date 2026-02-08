import { useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { useBeatCallback } from '../../../engine/clock';
import { useSyncStore } from '../../pulse';

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
    const logAudioEvent = useSyncStore(state => state.logAudioEvent);

    useBeatCallback((time) => {
        if (synthRef.current && !muted) {
            // Precise trigger with Tone.Transport time
            synthRef.current.triggerAttackRelease('C1', '8n', time);

            // Log for sync monitor (convert Tone time to Performance time)
            // time is AudioContext time in seconds
            // performance.now() is milliseconds
            const audioContextTime = Tone.context.currentTime;
            const perfNow = performance.now();
            const offset = perfNow - (audioContextTime * 1000);
            const triggerTimeMs = (time * 1000) + offset;

            logAudioEvent(triggerTimeMs);
        }
    }, '4n');
};
