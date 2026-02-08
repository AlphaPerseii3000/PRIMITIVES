import * as Tone from 'tone';
import { AUDIO_ASSETS } from '../../../engine/audio/audio.constants';

/**
 * Centralized Tone.Players instance for Snap feedback sounds.
 * Initialized at module level to ensure preloading via Tone.loaded().
 */
export const snapPlayers = new Tone.Players({
    urls: {
        lock: AUDIO_ASSETS.SNAP_LOCK,
        wobble: AUDIO_ASSETS.SNAP_WOBBLE,
        reject: AUDIO_ASSETS.SNAP_REJECT,
    },
    // URLs in constants are absolute paths from public root
    baseUrl: '',
    onload: () => console.log('[PRIMITIVES:Audio] Snap samples loaded'),
}).toDestination();
