import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSnapVisualFeedback, snapVisualRef } from './useSnapVisualFeedback';
import { useSnapStore } from '../stores/snap.store';

// Mock stores
vi.mock('../stores/snap.store', () => ({
    useSnapStore: vi.fn(),
}));

vi.mock('../wave.store', () => ({
    useWaveStore: {
        getState: vi.fn(() => ({ position: { x: 10, z: 20 } })),
    },
}));

describe('useSnapVisualFeedback', () => {
    beforeEach(() => {
        snapVisualRef.current = null;
        vi.clearAllMocks();
    });

    it('should update snapVisualRef when a new snap result occurs', () => {
        // Mock useSnapStore to return a 'lock' result
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (useSnapStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: any) =>
            selector({ lastSnapResult: { quality: 'lock', deltaMs: 0, beatPosition: 0 } })
        );

        renderHook(() => useSnapVisualFeedback());

        expect(snapVisualRef.current).not.toBeNull();
        expect(snapVisualRef.current?.quality).toBe('lock');
        expect(snapVisualRef.current?.position).toEqual({ x: 10, z: 20 });
        expect(snapVisualRef.current?.active).toBe(true);
    });

    it('should not update ref if enabled is false', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (useSnapStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: any) =>
            selector({ lastSnapResult: { quality: 'lock', deltaMs: 0, beatPosition: 0 } })
        );

        renderHook(() => useSnapVisualFeedback({ enabled: false }));

        expect(snapVisualRef.current).toBeNull();
    });

    it('should use override burst count if provided', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (useSnapStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: any) =>
            selector({ lastSnapResult: { quality: 'lock', deltaMs: 0, beatPosition: 0 } })
        );

        renderHook(() => useSnapVisualFeedback({ burstCount: 99 }));

        expect(snapVisualRef.current?.burstCount).toBe(99);
    });

    it('should pass bloomIntensity and burstDuration to ref', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (useSnapStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: any) =>
            selector({ lastSnapResult: { quality: 'lock', deltaMs: 0, beatPosition: 0 } })
        );

        renderHook(() => useSnapVisualFeedback({ bloomIntensity: 5.5, burstDuration: 1234 }));

        expect(snapVisualRef.current?.bloomIntensity).toBe(5.5);
        expect(snapVisualRef.current?.burstDuration).toBe(1234);
    });

    it('should default burst count based on quality', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (useSnapStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: any) =>
            selector({ lastSnapResult: { quality: 'wobble', deltaMs: 0, beatPosition: 0 } })
        );

        renderHook(() => useSnapVisualFeedback());

        // Wobble count is 6 (from constants, assume mocked logic holds true if we imported constants, 
        // but here we are testing the hook logic which imports constants. 
        // We rely on the real constants being imported by the hook.)
        expect(snapVisualRef.current?.burstCount).toBe(6);
    });
});
