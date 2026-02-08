import { useControls, folder } from 'leva';
import { useClockStore } from '../engine/clock/clock.store';
import { MIN_BPM, MAX_BPM } from '../engine/clock/clock.constants';
import { Perf } from 'r3f-perf';
import { Lighting } from './Lighting';
import { TestMesh } from './TestMesh';
import { Controls } from './Controls';
import { PulseIndicator, SyncDebugOverlay } from '../features/pulse';
import { useKickPlayer } from '../features/rhythm';
import { PostProcessing } from './PostProcessing';
import { WaveCursor, WaveInput } from '../features/snap';
import {
    WAVE_DAMPING,
    WAVE_SENSITIVITY,
    WAVE_MAX_SPEED
} from '../features/snap/wave.constants';

export function Scene() {
    const { setBpm, bpm } = useClockStore();

    // Leva controls
    // Leva controls
    const [, set] = useControls(() => ({
        'Dev Tools': folder({
            bpm: {
                value: bpm,
                min: MIN_BPM,
                max: MAX_BPM,
                step: 1,
                label: 'BPM',
                onChange: (v) => setBpm(v),
                transient: false
            }
        }, {
            collapsed: true,
            // Hide in production to avoid cluttering the view for end users
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            render: (_get) => !import.meta.env.PROD
        })
    }));

    // Sync Leva when store updates from other sources (e.g. initial load from persistence)
    // This ensures bi-directional sync
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useClockStore.subscribe((state) => {
        set({ bpm: state.bpm });
    });

    const { kickVolume, kickMuted } = useControls('Rhythm', {
        kickVolume: { value: -6, min: -60, max: 6, step: 1, label: 'Kick Vol (dB)' },
        kickMuted: { value: false, label: 'Kick Mute' },
    });

    // Wave mode controls (Dev Tools - hidden in production)
    useControls('Wave Mode', {
        damping: {
            value: WAVE_DAMPING,
            min: 0.9,
            max: 0.99,
            step: 0.01,
            label: 'Damping',
            hint: 'Higher = more momentum'
        },
        sensitivity: {
            value: WAVE_SENSITIVITY,
            min: 0.001,
            max: 0.02,
            step: 0.001,
            label: 'Sensitivity',
            hint: 'Mouse to velocity multiplier'
        },
        maxSpeed: {
            value: WAVE_MAX_SPEED,
            min: 0.1,
            max: 2.0,
            step: 0.1,
            label: 'Max Speed',
            hint: 'Velocity cap'
        }
    }, {
        collapsed: true,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        render: (_get) => !import.meta.env.PROD
    });

    useKickPlayer(kickVolume, kickMuted);

    return (
        <>
            <Perf position="top-left" />
            <Lighting />
            <TestMesh />
            <Controls />
            <PulseIndicator />
            <SyncDebugOverlay />
            <WaveInput />
            <WaveCursor height={0.1} />
            <PostProcessing />
        </>
    );
}

