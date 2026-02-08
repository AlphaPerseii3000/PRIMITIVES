import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useStore } from './index';
import { MAX_PARTICLES } from '../features/structures/particle.constants';
import type { Vector3Tuple } from 'three';

describe('simulationSlice', () => {
    beforeEach(() => {
        // Mock Tone.Transport.seconds
        vi.mock('tone', () => ({
            Transport: {
                seconds: 100
            }
        }));

        useStore.getState().clearNodes();
    });

    it('initially has no nodes', () => {
        const state = useStore.getState();
        expect(state.nodes.size).toBe(0);
        expect(state.nodeCount).toBe(0);
    });

    it('addNode adds a particle with correct position and id', () => {
        const position: Vector3Tuple = [10, 0, 20];
        const id = useStore.getState().addNode(position);

        expect(id).toBeDefined();
        const state = useStore.getState();
        expect(state.nodes.size).toBe(1);
        expect(state.nodeCount).toBe(1);

        const node = state.getNode(id!);
        expect(node).toEqual({
            id,
            position,
            createdAt: expect.any(Number),
        });
    });

    it('addNode returns null when MAX_PARTICLES is reached', () => {
        const position: Vector3Tuple = [0, 0, 0];

        // Fill up to max
        for (let i = 0; i < MAX_PARTICLES; i++) {
            useStore.getState().addNode(position);
        }

        const stateAtMax = useStore.getState();
        expect(stateAtMax.nodeCount).toBe(MAX_PARTICLES);

        // Try to add one more
        const spy = vi.spyOn(console, 'warn').mockImplementation(() => { });
        const id = useStore.getState().addNode(position);

        expect(id).toBeNull();
        expect(useStore.getState().nodeCount).toBe(MAX_PARTICLES);
        expect(spy).toHaveBeenCalled();
        spy.mockRestore();
    });

    it('removeNode successfully removes a particle', () => {
        const id = useStore.getState().addNode([0, 0, 0])!;
        expect(useStore.getState().nodes.has(id)).toBe(true);

        const result = useStore.getState().removeNode(id);
        expect(result).toBe(true);
        expect(useStore.getState().nodes.has(id)).toBe(false);
        expect(useStore.getState().nodeCount).toBe(0);
    });

    it('removeNode returns false for non-existent id', () => {
        const result = useStore.getState().removeNode('non-existent');
        expect(result).toBe(false);
    });

    it('clearNodes removes all particles', () => {
        useStore.getState().addNode([1, 1, 1]);
        useStore.getState().addNode([2, 2, 2]);
        expect(useStore.getState().nodeCount).toBe(2);

        useStore.getState().clearNodes();
        expect(useStore.getState().nodeCount).toBe(0);
        expect(useStore.getState().nodes.size).toBe(0);
    });
});
