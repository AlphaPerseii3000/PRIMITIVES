import * as Tone from 'tone';
import { createContext, useState, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { AudioContextValue, AudioState } from './audio.types';
import '../../features/snap/audio/snapAudio'; // Import to register players for preloading

const AudioContext = createContext<AudioContextValue | null>(null);
export { AudioContext };

export interface AudioProviderProps {
    children: ReactNode;
}

export function AudioProvider({ children }: AudioProviderProps) {
    const [isReady, setIsReady] = useState(false);

    const start = useCallback(async () => {
        try {
            await Tone.start();
            await Tone.loaded();
            const state = Tone.context.state as AudioState;
            if (state === 'running') {
                Tone.Transport.start();
                setIsReady(true);
                console.log('[PRIMITIVES:Audio] AudioContext started, Transport started');
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

