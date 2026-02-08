import { useContext } from 'react';
import { AudioContext } from './AudioProvider';

export function useTone() {
    const context = useContext(AudioContext);
    if (!context) {
        throw new Error('useTone must be used within AudioProvider');
    }
    return context;
}
