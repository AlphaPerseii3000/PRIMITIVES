import { Perf } from 'r3f-perf';
import { Lighting } from './Lighting';
import { TestMesh } from './TestMesh';

export function Scene() {
    return (
        <>
            <Perf position="top-left" />
            <Lighting />
            <TestMesh />
        </>
    );
}
