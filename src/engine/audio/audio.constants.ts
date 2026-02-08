/**
 * Strictly typed manifest of all audio assets in the project.
 * All paths are relative to the public/ directory.
 */
export const AUDIO_ASSETS = {
    // Future: SNARE: '/audio/snare.wav',
} as const;

export type AudioAssetName = keyof typeof AUDIO_ASSETS;
