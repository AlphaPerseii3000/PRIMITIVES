export interface AudioContextValue {
    isReady: boolean;
    start: () => Promise<void>;
}

export type AudioState = 'suspended' | 'running' | 'closed';
