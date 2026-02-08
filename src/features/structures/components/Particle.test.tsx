import { describe, it, expect, vi, beforeEach } from 'vitest';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { Particle } from './Particle';
import { useStore } from '../../../store';
import { PARTICLE_BLOOM_INTENSITY, PARTICLE_COLOR } from '../particle.constants';

// Mock useStore
vi.mock('../../../store', () => ({
    useStore: vi.fn(),
}));

describe('Particle component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders nothing if node is not found', async () => {
        (useStore as any).mockImplementation((selector: any) => selector({ nodes: new Map() }));

        const renderer = await ReactThreeTestRenderer.create(<Particle id="none" />);
        const graph = renderer.toGraph();

        expect(graph).toEqual([]);
    });

    it('renders mesh at correct position with bloom material', async () => {
        const mockNode = {
            id: 'p1',
            position: [1, 2, 3] as [number, number, number],
            createdAt: 100,
        };
        const mockMap = new Map();
        mockMap.set('p1', mockNode);

        (useStore as any).mockImplementation((selector: any) => selector({ nodes: mockMap }));

        const renderer = await ReactThreeTestRenderer.create(<Particle id="p1" />);

        // Check if mesh exists
        const meshes = renderer.scene.findAllByType('Mesh');
        expect(meshes.length).toBeGreaterThan(0);
        const mesh = meshes[0]!;

        expect(mesh.props.position).toEqual([1, 2, 3]);

        // Find material using findAllByType
        const materials = renderer.scene.findAllByType('MeshStandardMaterial');
        expect(materials.length).toBeGreaterThan(0);

        const standardMaterial = materials[0]!;

        expect(standardMaterial.props.color).toBe(PARTICLE_COLOR);
        expect(standardMaterial.props.emissive).toBe(PARTICLE_COLOR);
        expect(standardMaterial.props.emissiveIntensity).toBe(PARTICLE_BLOOM_INTENSITY);
    });
});
