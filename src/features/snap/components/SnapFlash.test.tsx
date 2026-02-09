import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { create, act } from '@react-three/test-renderer';
import { SnapFlash } from './SnapFlash';
import { snapVisualRef } from '../hooks/useSnapVisualFeedback';
import { useFrame } from '@react-three/fiber';

// Mock THREE
vi.mock('three', async () => {
    const actual = await vi.importActual('three');
    return {
        ...actual,
        WebGLRenderer: vi.fn(),
    };
});

// Mock R3F
vi.mock('@react-three/fiber', async () => {
    const actual = await vi.importActual('@react-three/fiber');
    return {
        ...actual,
        useFrame: vi.fn(),
    };
});

describe('SnapFlash', () => {
    beforeEach(() => {
        snapVisualRef.current = null;
        vi.useFakeTimers();
        (useFrame as unknown as ReturnType<typeof vi.fn>).mockClear();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should be invisible when inactive', async () => {
        const renderer = await create(<SnapFlash />);
        const mesh = renderer.scene.children[0];

        // Capture useFrame callback
        const frameCallback = (useFrame as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0];

        if (frameCallback) {
            await act(async () => {
                frameCallback({ clock: { elapsedTime: 0 } }, 0.016);
            });
        }

        // Check instance visibility (imperative update)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect((mesh as any).instance.visible).toBe(false);
    });

    it('should become visible and positioned on snap', async () => {
        // Set timestamp in past to simulate active duration
        const now = performance.now();
        snapVisualRef.current = {
            active: true,
            quality: 'lock',
            position: { x: 10, z: -5 },
            timestamp: now - 50, // 50ms elapsed
            burstCount: 0,
            bloomIntensity: 4.0,
            burstDuration: 500
        };

        const renderer = await create(<SnapFlash />);
        const mesh = renderer.scene.children[0];

        // Capture useFrame callback
        const frameCallback = (useFrame as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0];

        if (frameCallback) {
            await act(async () => {
                frameCallback({ clock: { elapsedTime: 0.05 } }, 0.016);
            });

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const instance = (mesh as any).instance;
            expect(instance.visible).toBe(true);
            expect(instance.position.x).toBe(10);
            expect(instance.position.z).toBe(-5);
            expect(instance.scale.x).toBeGreaterThan(0.5); // Expanding
        }
    });

    it('should hide after duration', async () => {
        // Set timestamp past duration
        const now = performance.now();
        const duration = 100;
        snapVisualRef.current = {
            active: true,
            quality: 'lock',
            position: { x: 0, z: 0 },
            timestamp: now - (duration + 50), // 150ms elapsed
            burstCount: 0,
            bloomIntensity: 4.0,
            burstDuration: duration
        };

        const renderer = await create(<SnapFlash />);
        const mesh = renderer.scene.children[0];

        // Capture useFrame callback
        const frameCallback = (useFrame as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0];

        if (frameCallback) {
            await act(async () => {
                frameCallback({ clock: { elapsedTime: 0.15 } }, 0.016);
            });

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expect((mesh as any).instance.visible).toBe(false);
        }
    });
});
