import type { StateCreator } from 'zustand';
import * as Tone from 'tone';
import type { NodeId, ParticleNode, NodeMap } from '../features/structures/particle.types';
import { MAX_PARTICLES } from '../features/structures/particle.constants';
import { generateId } from '../shared/utils/id.utils';
import type { Vector3Tuple } from 'three';

export interface SimulationState {
    nodes: NodeMap;
    nodeCount: number;
}

export interface SimulationActions {
    addNode: (position: Vector3Tuple) => NodeId | null;
    removeNode: (id: NodeId) => boolean;
    clearNodes: () => void;
    getNode: (id: NodeId) => ParticleNode | undefined;
    reset: () => void;
}

export type SimulationSlice = SimulationState & SimulationActions;

const INITIAL_STATE: SimulationState = {
    nodes: new Map(),
    nodeCount: 0,
};

export const createSimulationSlice: StateCreator<
    SimulationSlice,
    [],
    [],
    SimulationSlice
> = (set, get) => ({
    ...INITIAL_STATE,

    addNode: (position: Vector3Tuple) => {
        const { nodeCount, nodes } = get();

        if (nodeCount >= MAX_PARTICLES) {
            console.warn(`[Simulation] Max particles limit reached (${MAX_PARTICLES})`);
            return null;
        }

        const id = generateId();
        const newNode: ParticleNode = {
            id,
            position,
            createdAt: Tone.Transport.seconds,
        };

        const newNodes = new Map(nodes);
        newNodes.set(id, newNode);

        set({
            nodes: newNodes,
            nodeCount: newNodes.size,
        });

        return id;
    },

    removeNode: (id: NodeId) => {
        const { nodes } = get();
        if (!nodes.has(id)) return false;

        const newNodes = new Map(nodes);
        newNodes.delete(id);

        set({
            nodes: newNodes,
            nodeCount: newNodes.size,
        });

        return true;
    },

    clearNodes: () => {
        set({ ...INITIAL_STATE });
    },

    getNode: (id: NodeId) => {
        return get().nodes.get(id);
    },

    reset: () => {
        set({ ...INITIAL_STATE, nodes: new Map() });
    },
});
