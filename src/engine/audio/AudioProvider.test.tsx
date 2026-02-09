import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AudioProvider } from './AudioProvider';
import { useTone } from './useTone';
import * as Tone from 'tone';

// Mock Tone.js
vi.mock('tone', () => ({
    start: vi.fn(),
    loaded: vi.fn().mockResolvedValue(undefined),
    context: { state: 'suspended' },
    Transport: {
        start: vi.fn(),
        stop: vi.fn(),
    },
    Players: class {
        constructor() {
            return {
                toDestination: vi.fn().mockReturnThis(),
            };
        }
    },
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
        (Tone.context as { state: string }).state = 'suspended';
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
        // Mock implementation that updates the state
        vi.mocked(Tone.start).mockImplementation(async () => {
            (Tone.context as { state: string }).state = 'running';
        });

        render(
            <AudioProvider>
                <TestComponent />
            </AudioProvider>
        );

        const button = screen.getByText('Start');
        fireEvent.click(button);

        await waitFor(() => {
            expect(screen.getByTestId('status')).toHaveTextContent('ready');
        });

        expect(Tone.start).toHaveBeenCalled();
    });

    it('remains not ready if Tone.start fails', async () => {
        vi.mocked(Tone.start).mockRejectedValue(new Error('Audio failure'));
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
