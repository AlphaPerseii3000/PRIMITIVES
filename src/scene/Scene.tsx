import { useControls } from 'leva';
import { Perf } from 'r3f-perf';
import { Lighting } from './Lighting';
import { TestMesh } from './TestMesh';
import { Controls } from './Controls';
import { PulseIndicator } from '../features/pulse';
import { useKickPlayer } from '../features/rhythm';
import { PostProcessing } from './PostProcessing';

export function Scene() {
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
            <PostProcessing />
        </>
    );
}
