import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { Canvas } from '@react-three/fiber';
import { PostProcessing } from './PostProcessing';

// Mock @react-three/postprocessing to avoid WebGL context issues in tests
vi.mock('@react-three/postprocessing', () => ({
    EffectComposer: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    Bloom: () => null,
}));

describe('PostProcessing', () => {
    it('renders without crashing', () => {
        // PostProcessing uses EffectComposer which requires a Canvas context
        const { container } = render(
            <Canvas>
                <PostProcessing />
            </Canvas>
        );
        expect(container).toBeDefined();
    });
});
