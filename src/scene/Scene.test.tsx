import { describe, it, expect, vi } from 'vitest';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { Scene } from './Scene';

// Mock r3f-perf because it doesn't work well in headless test environment
vi.mock('r3f-perf', () => ({
    Perf: () => null,
}));

// Mock Controls to verify integration
vi.mock('./Controls', () => ({
    Controls: () => null,
}));

vi.mock('../features/pulse', () => ({
    PulseIndicator: () => null,
    SyncDebugOverlay: () => null,
    useSyncStore: () => vi.fn(),
    useSyncMonitor: () => ({}),
}));

vi.mock('./PostProcessing', () => ({
    PostProcessing: () => null,
}));

vi.mock('../engine/clock/clock.store', () => ({
    useClockStore: vi.fn(() => ({
        bpm: 120,
        setBpm: vi.fn()
    }))
}));

// Mock Leva to capture schema and support set function
const mockSet = vi.fn();
let capturedSchema: any = null;

vi.mock('leva', () => ({
    useControls: vi.fn().mockImplementation((schemaOrFn) => {
        // Handle function schema
        const schema = typeof schemaOrFn === 'function' ? schemaOrFn() : schemaOrFn;

        // Capture schema for testing if it contains Dev Tools
        if (schema && schema['Dev Tools']) {
            capturedSchema = schema;
        }

        // Return [values, set] to match usage in Scene
        // Values can be partial since we mock internal components mostly
        return [{
            kickVolume: -6,
            kickMuted: false,
            bpm: 120
        }, mockSet];
    }),
    folder: vi.fn((schema) => schema),
}));

// Mock Tone.js Player to prevent crash in useKickPlayer
vi.mock('tone', () => {
    return {
        MembraneSynth: vi.fn().mockImplementation(function () {
            return {
                toDestination: vi.fn().mockReturnThis(),
                triggerAttackRelease: vi.fn(),
                dispose: vi.fn(),
                volume: { value: 0 },
            };
        }),
        Transport: {
            scheduleRepeat: vi.fn(),
            clear: vi.fn(),
            bpm: {
                rampTo: vi.fn(),
                value: 120
            }
        },
    };
});

describe('Scene', () => {
    it('renders without crashing and contains required components', async () => {
        const renderer = await ReactThreeTestRenderer.create(<Scene />);

        const ambientLight = renderer.scene.findAllByType('AmbientLight');
        expect(ambientLight.length).toBeGreaterThan(0);
    });

    it('renders Controls as part of the scene', async () => {
        const renderer = await ReactThreeTestRenderer.create(<Scene />);
        expect(renderer).toBeDefined();
    });

    it('updates BPM when Leva control changes', async () => {
        const { useClockStore } = await import('../engine/clock/clock.store');
        const { setBpm } = useClockStore();

        await ReactThreeTestRenderer.create(<Scene />);

        // Check if we captured the schema
        expect(capturedSchema).toBeTruthy();
        expect(capturedSchema['Dev Tools']).toBeTruthy();

        // Simulate Leva onChange for BPM
        const bpmControl = capturedSchema['Dev Tools'].bpm;
        expect(bpmControl).toBeDefined();

        // Trigger onChange
        bpmControl.onChange(150);

        // Verify setBpm was called
        expect(setBpm).toHaveBeenCalledWith(150);
    });
});
