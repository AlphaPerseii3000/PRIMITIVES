import { create } from 'zustand';
import type { SimulationSlice } from './simulation.slice';
import { createSimulationSlice } from './simulation.slice';

export type RootState = SimulationSlice;

export const useStore = create<RootState>()((...a) => ({
    ...createSimulationSlice(...a),
}));
