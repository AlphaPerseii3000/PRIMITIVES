import { nanoid } from 'nanoid';

/**
 * Generate a unique ID for simulation nodes
 */
export const generateId = (size?: number): string => nanoid(size);
