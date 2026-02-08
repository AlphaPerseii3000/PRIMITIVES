import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AudioProvider } from './AudioProvider';
import { useTone } from './useTone';
import * as Tone from 'tone';

// Mock Tone.js
vi.mock('tone', () => ({
    start: vi.fn(),
    context: { state: 'suspended' },
}));

function TestComponent() {
    const { isReady, start } = useTone();
    return (
        <div>
            <span data-testid="status">{isReady ? 'ready' : 'not-ready'}</span>
            <button onClick={start}>Start</button>
        </div>
    );
}

describe('AudioProvider', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Default state
        (Tone.context.state as any) = 'suspended';
    });

    it('starts with isReady = false', () => {
        render(
            <AudioProvider>
                <TestComponent />
            </AudioProvider>
        );
        expect(screen.getByTestId('status')).toHaveTextContent('not-ready');
    });

    it('sets isReady = true after successful start()', async () => {
        (Tone.start as any).mockResolvedValue(undefined);

        render(
            <AudioProvider>
                <TestComponent />
            </AudioProvider>
        );

        const button = screen.getByText('Start');

        // Simulate clicking start and Tone.context.state changing to running
        fireEvent.click(button);

        // In actual implementation, Tone.context.state is what we check
        (Tone.context.state as any) = 'running';

        await waitFor(() => {
            expect(screen.getByTestId('status')).toHaveTextContent('ready');
        });

        expect(Tone.start).toHaveBeenCalled();
    });

    it('remains not ready if Tone.start fails', async () => {
        (Tone.start as any).mockRejectedValue(new Error('Audio failure'));
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        render(
            <AudioProvider>
                <TestComponent />
            </AudioProvider>
        );

        fireEvent.click(screen.getByText('Start'));

        await waitFor(() => {
            expect(screen.getByTestId('status')).toHaveTextContent('not-ready');
        });

        expect(consoleSpy).toHaveBeenCalledWith('[PRIMITIVES:Audio] Failed to start AudioContext', expect.any(Error));
        consoleSpy.mockRestore();
    });
});
