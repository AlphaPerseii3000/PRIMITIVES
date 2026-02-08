import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useWaveMovement } from './useWaveMovement';
import { useWaveStore } from '../wave.store';
import { WAVE_SENSITIVITY } from '../wave.constants';
import * as R3F from '@react-three/fiber';

// Mock React Three Fiber hooks
vi.mock('@react-three/fiber', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual as object,
        useFrame: vi.fn((_callback) => {
            // Mock implementation
            return null;
        }),
        useThree: vi.fn(() => ({
            size: { width: 1920, height: 1080 }
        }))
    };
});

describe('useWaveMovement', () => {
    beforeEach(() => {
        // Reset the wave store
        useWaveStore.getState().reset();
    });

    it('should update velocity when pointer moves', () => {
        const { result } = renderHook(() => useWaveMovement());

        // Simulate pointer movement (Right 50, Up 30)
        // Up is negative Y in screen space
        result.current.pointerMoveHandler({ movementX: 50, movementY: -30 });

        const { velocity } = useWaveStore.getState();

        // X should be positive
        expect(velocity.x).toBeCloseTo(50 * WAVE_SENSITIVITY);

        // Z should be negative (Forward) because Y is negative (Up)
        // Control Scheme: Mouse UP (-Y) -> Forward (-Z)
        expect(velocity.z).toBeCloseTo(-30 * WAVE_SENSITIVITY);
    });

    it('should map screen Y movement to world Z axis correctly (inverted flight)', () => {
        const { result } = renderHook(() => useWaveMovement());

        // Simulate: movementY positive (down) => z should be positive (Backward)
        result.current.pointerMoveHandler({ movementX: 0, movementY: 10 });

        const { velocity } = useWaveStore.getState();
        expect(velocity.z).toBeGreaterThan(0);

        // Simulate: movementY negative (up) => z should be negative (Forward)
        result.current.pointerMoveHandler({ movementX: 0, movementY: -20 });

        // Previous +10 velocity, added -20 -> -10
        // But we need to check the DELTA effect
        // Reset store first to be clean
        useWaveStore.getState().reset();

        result.current.pointerMoveHandler({ movementX: 0, movementY: -10 });
        expect(useWaveStore.getState().velocity.z).toBeLessThan(0);
    });

    it('should apply damping using delta time', () => {
        const frameMock = vi.mocked(R3F.useFrame);

        // Render hook to register useFrame
        renderHook(() => useWaveMovement());

        // Verify useFrame was called
        expect(frameMock).toHaveBeenCalled();

        // Get the callback passed to useFrame
        const calls = frameMock.mock.calls;
        if (!calls || !calls[0]) throw new Error('useFrame was not called');
        const frameCallback = calls[0][0];

        // Add velocity
        useWaveStore.getState().updateVelocity({ x: 100, z: 0 });
        const initialVx = useWaveStore.getState().velocity.x;

        // Trigger frame with specific delta (e.g., 1 second)
        // At 1.0s delta, damping should be applied heavily (DAMPING^60)
        // Cast null to any to satisfy RootState type requirement in test
        frameCallback(null as any, 1.0);

        const { velocity } = useWaveStore.getState();
        expect(velocity.x).toBeLessThan(initialVx);

        // Should rely on store's time-based damping
        // We verified the math in store tests, here we verify the connection
    });
});
