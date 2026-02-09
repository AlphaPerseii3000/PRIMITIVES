import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { create, act } from '@react-three/test-renderer';
import { SnapBurst } from './SnapBurst';
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

describe('SnapBurst', () => {
    beforeEach(() => {
        snapVisualRef.current = null;
        vi.useFakeTimers();
        (useFrame as unknown as ReturnType<typeof vi.fn>).mockClear();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should render instancedMesh with correct max count', async () => {
        const renderer = await create(<SnapBurst />);
        const mesh = renderer.scene.children[0];

        expect(mesh).toBeDefined();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect((mesh.props as any).args![2]).toBe(16); // MAX_BURST
    });

    it('should be hidden (count=0) when inactive', async () => {
        const renderer = await create(<SnapBurst />);
        const mesh = renderer.scene.children[0];

        // Capture useFrame callback
        const frameCallback = (useFrame as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0];

        // Execute frame if captured
        if (frameCallback) {
            await act(async () => {
                frameCallback({ clock: { elapsedTime: 0 } }, 0.016);
            });
        }

        // Check instance count directly
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect((mesh as any).instance.count).toBe(0);
    });

    it('should set count and update instances when active', async () => {
        snapVisualRef.current = {
            active: true,
            quality: 'lock',
            position: { x: 0, z: 0 },
            timestamp: performance.now(),
            burstCount: 12, // Explicit count
            bloomIntensity: 4.0,
            burstDuration: 500
        };

        const renderer = await create(<SnapBurst />);
        const mesh = renderer.scene.children[0];

        // Capture useFrame callback
        const frameCallback = (useFrame as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0];

        if (frameCallback) {
            await act(async () => {
                frameCallback({ clock: { elapsedTime: 0 } }, 0.016);
            });
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const instance = (mesh as any).instance;
        expect(instance.count).toBe(12);
    });

    it('should update material emission based on quality', async () => {
        snapVisualRef.current = {
            active: true,
            quality: 'reject', // Red
            position: { x: 0, z: 0 },
            timestamp: performance.now(),
            burstCount: 5,
            bloomIntensity: 1.0,
            burstDuration: 500
        };

        const renderer = await create(<SnapBurst />);
        const mesh = renderer.scene.children[0];

        // Capture useFrame callback
        const frameCallback = (useFrame as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0];

        if (frameCallback) {
            await act(async () => {
                frameCallback({ clock: { elapsedTime: 0 } }, 0.016);
            });
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const material = (mesh as any).instance.material;
        expect(material.emissive.getHexString()).toBe('ff3333'); // Red
        expect(material.emissiveIntensity).toBe(1.0);
    });
});
