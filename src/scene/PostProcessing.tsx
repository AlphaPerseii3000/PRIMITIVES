import { EffectComposer, Bloom } from '@react-three/postprocessing';

/**
 * Post-processing effects for the scene.
 *
 * Currently applies selective bloom effect that only affects elements with
 * emissive intensity > 1.0 (e.g., PulseIndicator at beat peak).
 *
 * This approach uses luminance thresholding for selective bloom rather than
 * render layers. For more precise control, consider implementing layer-based
 * selective bloom in future stories.
 *
 * @see PulseIndicator - Uses emissiveIntensity 0.5-2.0 to trigger bloom
 */
export const PostProcessing = () => {
    return (
        <EffectComposer>
            <Bloom
                luminanceThreshold={1.0} // Only elements with emissive > 1.0 will bloom
                mipmapBlur // More efficient bloom algorithm
                intensity={1.0} // Moderate bloom intensity
            />
        </EffectComposer>
    );
};
