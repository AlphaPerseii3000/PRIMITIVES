/**
 * Strictly typed manifest of all audio assets in the project.
 * All paths are relative to the public/ directory.
 */
export const AUDIO_ASSETS = {
    SNAP_LOCK: '/audio/snap/snap-lock.wav',
    SNAP_WOBBLE: '/audio/snap/snap-wobble.wav',
    SNAP_REJECT: '/audio/snap/snap-reject.wav',
} as const;

export type AudioAssetName = keyof typeof AUDIO_ASSETS;
