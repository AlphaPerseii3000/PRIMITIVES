import { useEffect } from 'react';
import * as Tone from 'tone';
import { useSnapStore } from '../stores/snap.store';
import { snapPlayers } from '../audio/snapAudio';

interface SnapFeedbackConfig {
    volume?: number;
    muted?: boolean;
}

/**
 * Hook to trigger audio feedback when snap results occur.
 * Subscribes to the transient Snap Signal Bus (snap.store).
 */
export function useSnapFeedback(config: SnapFeedbackConfig = {}) {
    const { volume = 1, muted = false } = config;
    const lastResult = useSnapStore(state => state.lastSnapResult);

    // Apply volume changes to the main players output node
    useEffect(() => {
        if (snapPlayers) {
            // Tone.gainToDb(0) is -Infinity
            snapPlayers.volume.value = Tone.gainToDb(muted ? 0 : volume);
        }
    }, [volume, muted]);

    // Trigger sound on new result
    useEffect(() => {
        if (!lastResult || muted) return;

        try {
            if (snapPlayers.loaded) {
                if (snapPlayers.has(lastResult.quality)) {
                    snapPlayers.player(lastResult.quality).start(Tone.now());
                } else {
                    console.warn(`[PRIMITIVES:Audio] Missing snap sample for quality: ${lastResult.quality}`);
                }
            }
        } catch (error) {
            console.warn('[PRIMITIVES:Audio] Failed to play snap sound', error);
        }
    }, [lastResult, muted]);
}
