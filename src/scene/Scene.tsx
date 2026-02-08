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
            render: (get) => !import.meta.env.PROD
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

    useKickPlayer(kickVolume, kickMuted);

    return (
        <>
            <Perf position="top-left" />
            <Lighting />
            <TestMesh />
            <Controls />
            <PulseIndicator />
            <SyncDebugOverlay />
            <PostProcessing />
        </>
    );
}
