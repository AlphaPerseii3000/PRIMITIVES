import { createContext } from 'react';
import type { MutableRefObject } from 'react';
import type { ClockState } from './clock.types';

export const ClockContext = createContext<MutableRefObject<ClockState> | null>(null);
