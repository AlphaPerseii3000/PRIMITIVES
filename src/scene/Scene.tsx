import { Perf } from 'r3f-perf';
import { Lighting } from './Lighting';
import { TestMesh } from './TestMesh';
import { Controls } from './Controls';
import { PulseIndicator } from '../features/pulse';
import { PostProcessing } from './PostProcessing';

export function Scene() {
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
