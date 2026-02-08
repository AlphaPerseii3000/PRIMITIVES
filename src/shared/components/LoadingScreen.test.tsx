import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoadingScreen } from './LoadingScreen';
import { useTone } from '../../engine/audio';

vi.mock('../../engine/audio', () => ({
    useTone: vi.fn(),
}));

describe('LoadingScreen', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders PRIMITIVES text', () => {
        (useTone as any).mockReturnValue({ isReady: false, start: vi.fn() });
        render(<LoadingScreen />);
        expect(screen.getByText('PRIMITIVES')).toBeInTheDocument();
    });

    it('calls start on click', () => {
        const start = vi.fn();
        (useTone as any).mockReturnValue({ isReady: false, start });
        render(<LoadingScreen />);
        fireEvent.click(screen.getByText('PRIMITIVES'));
        expect(start).toHaveBeenCalled();
    });

    it('fades out when isReady becomes true', async () => {
        const { rerender } = render(<LoadingScreen />);

        // Initial state
        (useTone as any).mockReturnValue({ isReady: false, start: vi.fn() });
        expect(screen.getByText('PRIMITIVES')).toBeVisible();

        // Update to ready
        (useTone as any).mockReturnValue({ isReady: true, start: vi.fn() });
        rerender(<LoadingScreen />);

        // Should have fading class/style
        const screenDiv = screen.getByText('PRIMITIVES').closest('div');
        expect(screenDiv).toHaveStyle('opacity: 0');

        // Should eventually disappear
        await waitFor(() => {
            expect(screen.queryByText('PRIMITIVES')).not.toBeInTheDocument();
        }, { timeout: 1000 });
    });
});
