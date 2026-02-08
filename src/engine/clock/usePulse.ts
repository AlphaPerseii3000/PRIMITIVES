import { useContext, useRef } from 'react';
import type { MutableRefObject } from 'react';
import { ClockContext } from './clock.context';
import type { ClockState } from './clock.types';

/** Default clock state used as fallback when outside ClockProvider */
const DEFAULT_CLOCK_STATE: ClockState = {
    position: 0,
    beat: 0,
    measure: 0,
    phase: 0,
};

/**
 * Hook to access the shared clock state.
 * 
 * Returns a stable ref that is updated every 16th note by the ClockProvider.
 * Safe to use inside R3F useFrame - no re-renders caused.
 * 
 * @returns MutableRefObject<ClockState> - Access `.current` for latest clock values
 * 
 * @example
 * ```tsx
 * function PulseVisual() {
 *   const clockRef = usePulse();
 *   
 *   useFrame(() => {
 *     const { phase, beat } = clockRef.current;
 *     meshRef.current.scale.setScalar(1 + phase * 0.2);
 *   });
 * }
 * ```
 * 
 * @note Returns a fallback ref with default values if used outside ClockProvider.
 * This allows components to render without crashing in tests or isolation.
 */
export const usePulse = (): MutableRefObject<ClockState> => {
    const context = useContext(ClockContext);
    const fallbackRef = useRef<ClockState>(DEFAULT_CLOCK_STATE);

    if (!context) {
        console.warn('[PRIMITIVES:Clock] usePulse called outside ClockProvider, using fallback values');
        return fallbackRef;
    }
    return context;
};
