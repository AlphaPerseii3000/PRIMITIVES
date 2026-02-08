import { useContext } from 'react';
import { AudioContext } from './AudioProvider';

export function useTone() {
    const context = useContext(AudioContext);
    if (!context) {
        console.error('[PRIMITIVES:Audio] useTone must be used within AudioProvider. Returning fallback state.');
        return { isReady: false, start: async () => { } };
    }
    return context;
}
