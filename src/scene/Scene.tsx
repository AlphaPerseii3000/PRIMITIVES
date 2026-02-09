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
import { useSnapFeedback } from '../features/snap/hooks/useSnapFeedback';
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
import { SnapFlash, SnapBurst, GhostPreview } from '../features/snap';
import {
    GHOST_OPACITY_MIN,
    GHOST_OPACITY_MAX,
    GHOST_EMISSIVE_PULSE_BOOST
} from '../features/snap/ghost-preview.constants';
import { useSnapVisualFeedback } from '../features/snap/hooks/useSnapVisualFeedback';

export function Scene() {
    const { setBpm, bpm } = useClockStore();

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

    // Snap Audio Controls
    const { snapVolume, snapMuted } = useControls('Snap Audio', {
        snapVolume: {
            value: 0.8,
            min: 0,
            max: 1,
            step: 0.05,
            label: 'Volume',
            hint: 'Linear gain (0-1)'
        },
        snapMuted: { value: false, label: 'Mute' },
    }, { collapsed: true });

    useSnapFeedback({ volume: snapVolume, muted: snapMuted });

    // Snap Visual Controls
    const { snapVisualEnabled, burstCount, burstDuration, bloomIntensity } = useControls('Snap Visual', {
        snapVisualEnabled: { value: true, label: 'Enabled' },
        burstCount: { value: 12, min: 0, max: 16, step: 1, label: 'Burst Count' },
        burstDuration: { value: 500, min: 100, max: 1000, step: 50, label: 'Duration (ms)' },
        bloomIntensity: { value: 4.0, min: 0, max: 10, step: 0.1, label: 'Bloom Intensity' },
    }, { collapsed: true });

    useSnapVisualFeedback({
        enabled: snapVisualEnabled,
        burstCount,
        burstDuration,
        bloomIntensity,
    });

    // Ghost Preview Controls
    const { ghostEnabled, ghostOpacityMin, ghostOpacityMax, ghostPulseIntensity } = useControls('Ghost Preview', {
        ghostEnabled: { value: true, label: 'Enabled' },
        ghostOpacityMin: { value: GHOST_OPACITY_MIN, min: 0, max: 0.5, step: 0.01, label: 'Opacity Min' },
        ghostOpacityMax: { value: GHOST_OPACITY_MAX, min: 0.3, max: 1.0, step: 0.01, label: 'Opacity Max' },
        ghostPulseIntensity: { value: GHOST_EMISSIVE_PULSE_BOOST, min: 0, max: 3, step: 0.1, label: 'Pulse Intensity' },
    }, { collapsed: true });

    useKickPlayer(kickVolume, kickMuted);

    return (
        <>
            <Perf position="top-left" />
            <Lighting />
            <TestMesh />
            <Controls />
            <PulseIndicator />
            <SyncDebugOverlay />
            <SnapFlash />
            <SnapBurst />
            <WaveInput />
            <WaveCursor height={0.1} />
            <GhostPreview
                enabled={ghostEnabled}
                opacityMin={ghostOpacityMin}
                opacityMax={ghostOpacityMax}
                pulseIntensity={ghostPulseIntensity}
                height={0.1}
            />
            <ParticleSystem />
            <PostProcessing />
        </>
    );
}
