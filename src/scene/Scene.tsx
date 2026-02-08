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
import { useWaveStore } from '../features/snap/wave.store';
import { ParticleSystem } from '../features/structures';
import {
    WAVE_DAMPING,
    WAVE_SENSITIVITY,
    WAVE_MAX_SPEED
} from '../features/snap/wave.constants';
import {
    SNAP_PERFECT_WINDOW_MS,
    SNAP_GOOD_WINDOW_MS
} from '../features/snap/snap.constants';

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
            render: () => !import.meta.env.PROD
        })
    }));

    // Sync Leva when store updates from other sources (e.g. initial load from persistence)
    // This ensures bi-directional sync
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
            hint: 'Higher = more momentum',
            onChange: (v) => useWaveStore.getState().setConfig({ damping: v })
        },
        sensitivity: {
            value: WAVE_SENSITIVITY,
            min: 0.001,
            max: 0.02,
            step: 0.001,
            label: 'Sensitivity',
            hint: 'Mouse to velocity multiplier',
            onChange: (v) => useWaveStore.getState().setConfig({ sensitivity: v })
        },
        maxSpeed: {
            value: WAVE_MAX_SPEED,
            min: 0.1,
            max: 2.0,
            step: 0.1,
            label: 'Max Speed',
            hint: 'Velocity cap',
            onChange: (v) => useWaveStore.getState().setConfig({ maxSpeed: v })
        },
        'Hold Mechanics': folder({
            holdBrakeFactor: {
                value: 0.7,
                min: 0.1,
                max: 1.0,
                step: 0.05,
                label: 'Brake Factor',
                onChange: (v) => useWaveStore.getState().setConfig({ holdBrakeFactor: v })
            },
            chargeRate: {
                value: 1.0,
                min: 0.1,
                max: 3.0,
                step: 0.1,
                label: 'Charge Rate',
                onChange: (v) => useWaveStore.getState().setConfig({ chargeRate: v })
            },
            chargeLockThreshold: {
                value: 0.99,
                min: 0.5,
                max: 1.0,
                step: 0.01,
                label: 'Lock Threshold',
                onChange: (v) => useWaveStore.getState().setConfig({ chargeLockThreshold: v })
            }
        }),
        'Timing': folder({
            perfectWindowMs: {
                value: SNAP_PERFECT_WINDOW_MS,
                min: 20,
                max: 100,
                step: 5,
                label: 'Perfect (ms)',
                onChange: (v) => useWaveStore.getState().setConfig({ perfectWindowMs: v })
            },
            goodWindowMs: {
                value: SNAP_GOOD_WINDOW_MS,
                min: 60,
                max: 200,
                step: 5,
                label: 'Good (ms)',
                onChange: (v) => useWaveStore.getState().setConfig({ goodWindowMs: v })
            },
            showTimingVisualization: {
                value: false,
                label: 'Show Visualization',
                hint: 'Display timing feedback in UI'
            }
        })
    }, {
        collapsed: true,
        render: () => !import.meta.env.PROD
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
            <ParticleSystem />
            <PostProcessing />
        </>
    );
}

