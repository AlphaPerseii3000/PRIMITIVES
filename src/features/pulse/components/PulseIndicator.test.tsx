import { describe, it, expect, vi } from 'vitest';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import type { Mesh, MeshStandardMaterial } from 'three';
import { PulseIndicator } from './PulseIndicator';

// Mock usePulse to return a controlled clock state
vi.mock('../../../engine/clock', () => ({
    usePulse: () => ({
        current: {
            position: 0,
            beat: 0,
            measure: 0,
            phase: 0.5,
            sixteenth: 0,
        },
    }),
}));

// Mock Leva to avoid Stitches issues
vi.mock('leva', () => ({
    useControls: vi.fn().mockImplementation((_nameOrConfig, config) => {
        const values = { syncOffset: 0 };
        const set = vi.fn();

        // If config is provided, it's the factory version [values, set]
        if (config) {
            return [values, set];
        }
        // Otherwise it's the simple version
        return values;
    }),
}));

// Mock useSyncStore
vi.mock('../../pulse', () => ({
    useSyncStore: () => vi.fn(),
}));

describe('PulseIndicator', () => {
    it('renders without crashing', async () => {
        const renderer = await ReactThreeTestRenderer.create(<PulseIndicator />);
        expect(renderer).toBeDefined();
    });

    it('renders a mesh with sphere geometry', async () => {
        const renderer = await ReactThreeTestRenderer.create(<PulseIndicator />);

        // Find the mesh in the scene graph
        const meshes = renderer.scene.findAllByType('Mesh');
        expect(meshes.length).toBe(1);

        // Verify it has geometry (SphereGeometry becomes BufferGeometry in Three.js)
        // Non-null assertion safe after length check above
        const mesh = meshes[0]!;
        expect(mesh.instance).toBeDefined();
    });

    it('accepts custom position prop', async () => {
        const customPosition: [number, number, number] = [1, 2, 3];
        const renderer = await ReactThreeTestRenderer.create(
            <PulseIndicator position={customPosition} />
        );

        const meshes = renderer.scene.findAllByType('Mesh');
        expect(meshes.length).toBe(1);

        // Non-null assertion safe after length check above
        const mesh = meshes[0]!;
        const meshInstance = mesh.instance as Mesh;
        expect(meshInstance.position.x).toBe(1);
        expect(meshInstance.position.y).toBe(2);
        expect(meshInstance.position.z).toBe(3);
    });

    it('uses emissive material for bloom pickup', async () => {
        const renderer = await ReactThreeTestRenderer.create(<PulseIndicator />);

        const meshes = renderer.scene.findAllByType('Mesh');
        expect(meshes.length).toBe(1);

        // Non-null assertion safe after length check above
        const mesh = meshes[0]!;
        const meshInstance = mesh.instance as Mesh;
        const material = meshInstance.material as MeshStandardMaterial;
        expect(material).toBeDefined();
        expect(material.emissive).toBeDefined();
        expect(material.emissiveIntensity).toBeGreaterThan(0);
    });
});
