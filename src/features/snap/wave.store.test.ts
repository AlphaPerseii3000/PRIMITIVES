import { describe, it, expect, beforeEach } from 'vitest';
import { useWaveStore, selectSpeed, selectNormalizedSpeed } from './wave.store';
import { WAVE_MAX_SPEED, WAVE_DAMPING, WAVE_INERTIA_THRESHOLD, WAVE_SENSITIVITY } from './wave.constants';

describe('wave.store', () => {
    beforeEach(() => {
        // Reset store state before each test
        useWaveStore.getState().reset();
    });

    describe('initial state', () => {
        it('should start with zero position', () => {
            const { position } = useWaveStore.getState();
            expect(position.x).toBe(0);
            expect(position.z).toBe(0);
        });

        it('should start with zero velocity', () => {
            const { velocity } = useWaveStore.getState();
            expect(velocity.x).toBe(0);
            expect(velocity.z).toBe(0);
        });
    });

    describe('updateVelocity', () => {
        it('should add delta to velocity with sensitivity', () => {
            const { updateVelocity } = useWaveStore.getState();

            updateVelocity({ x: 10, z: 20 });

            const { velocity } = useWaveStore.getState();
            expect(velocity.x).toBeCloseTo(10 * WAVE_SENSITIVITY);
            expect(velocity.z).toBeCloseTo(20 * WAVE_SENSITIVITY);
        });

        it('should accumulate velocity across multiple updates', () => {
            const { updateVelocity } = useWaveStore.getState();

            updateVelocity({ x: 10, z: 0 });
            updateVelocity({ x: 10, z: 0 });

            const { velocity } = useWaveStore.getState();
            expect(velocity.x).toBeCloseTo(20 * WAVE_SENSITIVITY);
        });

        it('should clamp velocity to max speed', () => {
            const { updateVelocity } = useWaveStore.getState();

            // Apply very large delta
            updateVelocity({ x: 10000, z: 10000 });

            const { velocity } = useWaveStore.getState();
            const speed = Math.sqrt(velocity.x ** 2 + velocity.z ** 2);

            expect(speed).toBeCloseTo(WAVE_MAX_SPEED);
        });

        it('should preserve direction when clamping', () => {
            const { updateVelocity } = useWaveStore.getState();

            // Apply diagonal delta
            updateVelocity({ x: 10000, z: 10000 });

            const { velocity } = useWaveStore.getState();
            // Both components should be equal for 45-degree angle
            expect(velocity.x).toBeCloseTo(velocity.z);
        });
    });

    describe('applyDamping', () => {
        it('should reduce velocity by damping factor', () => {
            const store = useWaveStore.getState();
            store.updateVelocity({ x: 100, z: 0 });

            const initialVx = useWaveStore.getState().velocity.x;

            useWaveStore.getState().applyDamping();

            const { velocity } = useWaveStore.getState();
            expect(velocity.x).toBeCloseTo(initialVx * WAVE_DAMPING);
        });

        it('should update position based on velocity', () => {
            const store = useWaveStore.getState();
            store.updateVelocity({ x: 100, z: 50 });

            const vx = useWaveStore.getState().velocity.x;
            const vz = useWaveStore.getState().velocity.z;

            store.applyDamping();

            const { position } = useWaveStore.getState();
            // Position should increase by damped velocity
            expect(position.x).toBeCloseTo(vx * WAVE_DAMPING);
            expect(position.z).toBeCloseTo(vz * WAVE_DAMPING);
        });

        it('should snap to zero when below threshold', () => {
            const store = useWaveStore.getState();

            // Set very small velocity directly using updateVelocity
            // We need to be clever here - set a velocity that after damping is below threshold
            const tinyDelta = WAVE_INERTIA_THRESHOLD / WAVE_SENSITIVITY / 10;
            store.updateVelocity({ x: tinyDelta, z: 0 });

            // Apply damping multiple times until below threshold
            for (let i = 0; i < 100; i++) {
                store.applyDamping();
            }

            const { velocity } = useWaveStore.getState();
            expect(velocity.x).toBe(0);
            expect(velocity.z).toBe(0);
        });

        it('should accumulate position over multiple frames', () => {
            const store = useWaveStore.getState();
            store.updateVelocity({ x: 100, z: 0 });

            // Apply damping 3 times
            store.applyDamping();
            store.applyDamping();
            store.applyDamping();

            const { position } = useWaveStore.getState();
            // Position should be accumulated
            expect(position.x).toBeGreaterThan(0);
        });

        it('should scale damping based on delta time', () => {
            const store = useWaveStore.getState();
            store.updateVelocity({ x: 100, z: 0 });

            const initialVx = useWaveStore.getState().velocity.x;

            // Apply damping with very small delta (small effect)
            store.applyDamping(0.001);
            const fastVx = useWaveStore.getState().velocity.x;

            // Reset
            store.reset();
            store.updateVelocity({ x: 100, z: 0 });

            // Apply damping with large delta (large effect)
            store.applyDamping(1.0);
            const slowVx = useWaveStore.getState().velocity.x;

            // Larger time step = More damping = Lower resulting velocity
            expect(slowVx).toBeLessThan(fastVx);
            expect(slowVx).toBeLessThan(initialVx);
        });
    });

    describe('setPosition', () => {
        it('should set position directly', () => {
            const { setPosition } = useWaveStore.getState();

            setPosition({ x: 5, z: 10 });

            const { position } = useWaveStore.getState();
            expect(position.x).toBe(5);
            expect(position.z).toBe(10);
        });

        it('should not affect velocity', () => {
            const store = useWaveStore.getState();
            store.updateVelocity({ x: 100, z: 50 });

            const velocityBefore = { ...useWaveStore.getState().velocity };

            store.setPosition({ x: 999, z: 999 });

            const { velocity } = useWaveStore.getState();
            expect(velocity.x).toBe(velocityBefore.x);
            expect(velocity.z).toBe(velocityBefore.z);
        });
    });

    describe('reset', () => {
        it('should reset position to zero', () => {
            const store = useWaveStore.getState();
            store.setPosition({ x: 100, z: 200 });

            store.reset();

            const { position } = useWaveStore.getState();
            expect(position.x).toBe(0);
            expect(position.z).toBe(0);
        });

        it('should reset velocity to zero', () => {
            const store = useWaveStore.getState();
            store.updateVelocity({ x: 100, z: 100 });

            store.reset();

            const { velocity } = useWaveStore.getState();
            expect(velocity.x).toBe(0);
            expect(velocity.z).toBe(0);
        });
    });

    describe('selectors', () => {
        it('selectSpeed should return velocity magnitude', () => {
            const store = useWaveStore.getState();
            store.updateVelocity({ x: 60, z: 80 }); // 3-4-5 triangle scaled

            const state = useWaveStore.getState();
            const speed = selectSpeed(state);

            // magnitude of (60*sens, 80*sens) = 100*sens
            const expectedSpeed = Math.sqrt(
                (60 * WAVE_SENSITIVITY) ** 2 + (80 * WAVE_SENSITIVITY) ** 2
            );
            expect(speed).toBeCloseTo(expectedSpeed);
        });

        it('selectNormalizedSpeed should return 0-1 value', () => {
            const store = useWaveStore.getState();

            // At zero velocity
            expect(selectNormalizedSpeed(useWaveStore.getState())).toBe(0);

            // At max speed
            store.updateVelocity({ x: 10000, z: 10000 });
            expect(selectNormalizedSpeed(useWaveStore.getState())).toBeCloseTo(1);
        });

        it('selectNormalizedSpeed should clamp to 1', () => {
            // Even if something weird happens, never exceed 1
            const mockState = {
                position: { x: 0, z: 0 },
                velocity: { x: 1000, z: 1000 }
            };

            expect(selectNormalizedSpeed(mockState)).toBe(1);
        });
    });
});
