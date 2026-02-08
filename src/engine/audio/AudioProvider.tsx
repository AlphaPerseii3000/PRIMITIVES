import * as Tone from 'tone';
import { createContext, useState, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { AudioContextValue } from './audio.types';

export const AudioContext = createContext<AudioContextValue | null>(null);

export interface AudioProviderProps {
    children: ReactNode;
}

export function AudioProvider({ children }: { children: ReactNode }) {
    const [isReady, setIsReady] = useState(false);

    const start = useCallback(async () => {
        try {
            await Tone.start();
            if (Tone.context.state === 'running') {
                setIsReady(true);
                console.log('[PRIMITIVES:Audio] AudioContext started');
            }
        } catch (error) {
            console.error('[PRIMITIVES:Audio] Failed to start AudioContext', error);
        }
    }, []);

    const value = useMemo(() => ({ isReady, start }), [isReady, start]);

    return (
        <AudioContext.Provider value={value}>
            {children}
        </AudioContext.Provider>
    );
}

