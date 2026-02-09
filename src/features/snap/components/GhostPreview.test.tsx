import { describe, it, expect, vi, beforeEach } from 'vitest';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { GhostPreview } from './GhostPreview';
import { useWaveStore } from '../wave.store';
import { PARTICLE_RADIUS, PARTICLE_COLOR } from '../../structures/particle.constants';
import * as THREE from 'three';

// Mock dependencies
vi.mock('../wave.store', () => ({
    useWaveStore: {
        getState: vi.fn(),
        subscribe: vi.fn(() => () => { })
    }
}));

vi.mock('../../../engine/clock', () => ({
    usePulse: () => ({ current: { phase: 0, beat: 0, measure: 0, position: 0 } })
}));

describe('GhostPreview', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let mockGetState: any;

    beforeEach(() => {
        vi.clearAllMocks();
        mockGetState = vi.fn(() => ({
            input: {
                holding: false,
                charge: 0,
                lockPosition: null
            }
        }));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (useWaveStore as any).getState = mockGetState;
    });

    it('renders mesh with correct geometry and material', async () => {
        const renderer = await ReactThreeTestRenderer.create(<GhostPreview />);

        const mesh = renderer.scene.findByType('Mesh');
        const geometry = mesh.findByType('SphereGeometry');
        const material = mesh.findByType('MeshStandardMaterial');

        expect(geometry.props.args[0]).toBe(PARTICLE_RADIUS);
        expect(material.props.color).toBe(PARTICLE_COLOR);
        expect(material.props.transparent).toBe(true);
        expect(material.props.depthWrite).toBe(false);
    });

    it('is initially invisible when not holding', async () => {
        const renderer = await ReactThreeTestRenderer.create(<GhostPreview />);
        const mesh = renderer.scene.findByType('Mesh');

        // Initial state is holding=false
        await renderer.advanceFrames(1, 0.016);

        expect(mesh.instance.visible).toBe(false);
    });

    it('becomes visible when holding and lockPosition exists', async () => {
        const renderer = await ReactThreeTestRenderer.create(<GhostPreview />);
        const mesh = renderer.scene.findByType('Mesh');

        // Update state to holding
        mockGetState.mockReturnValue({
            input: {
                holding: true,
                charge: 0.5,
                lockPosition: { x: 10, z: 20 }
            }
        });

        // Advance frame to trigger update
        await renderer.advanceFrames(1, 0.016);

        expect(mesh.instance.visible).toBe(true);
        expect(mesh.instance.position.x).toBe(10);
        expect(mesh.instance.position.z).toBe(20);

        // Check materiality based on charge. 
        const meshInstance = mesh.instance as THREE.Mesh;
        const material = meshInstance.material as THREE.MeshStandardMaterial;
        expect(material.opacity).toBeGreaterThan(0.15);

        // Check Y position matches height prop (M2)
        expect(mesh.instance.position.y).toBe(0.1);
    });

    it('uses custom height prop correctly', async () => {
        const renderer = await ReactThreeTestRenderer.create(<GhostPreview height={1.5} />);
        const mesh = renderer.scene.findByType('Mesh');

        mockGetState.mockReturnValue({
            input: {
                holding: true,
                charge: 0.5,
                lockPosition: { x: 10, z: 20 }
            }
        });

        await renderer.advanceFrames(1, 0.016);
        expect(mesh.instance.position.y).toBe(1.5);
    });

    it('respects enabled flag even when holding', async () => {
        const renderer = await ReactThreeTestRenderer.create(<GhostPreview enabled={false} />);
        const mesh = renderer.scene.findByType('Mesh');

        mockGetState.mockReturnValue({
            input: {
                holding: true,
                charge: 0.5,
                lockPosition: { x: 10, z: 20 }
            }
        });

        await renderer.advanceFrames(1, 0.016);
        expect(mesh.instance.visible).toBe(false);
    });

    it('hides when holding stops', async () => {
        // Start with holding=true
        mockGetState.mockReturnValue({
            input: {
                holding: true,
                charge: 0.5,
                lockPosition: { x: 10, z: 20 }
            }
        });

        const renderer = await ReactThreeTestRenderer.create(<GhostPreview />);
        const mesh = renderer.scene.findByType('Mesh');
        await renderer.advanceFrames(1, 0.016);
        expect(mesh.instance.visible).toBe(true);

        // Stop holding
        mockGetState.mockReturnValue({
            input: {
                holding: false,
                charge: 0,
                lockPosition: null
            }
        });

        await renderer.advanceFrames(1, 0.016);
        expect(mesh.instance.visible).toBe(false);
    });

    it('remains invisible if holding but no lockPosition', async () => {
        mockGetState.mockReturnValue({
            input: {
                holding: true,
                charge: 0,
                lockPosition: null
            }
        });

        const renderer = await ReactThreeTestRenderer.create(<GhostPreview />);
        const mesh = renderer.scene.findByType('Mesh');
        await renderer.advanceFrames(1, 0.016);

        expect(mesh.instance.visible).toBe(false);
    });
});
