import { describe, it, expect, vi } from 'vitest';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { Scene } from './Scene';


// Mock r3f-perf because it doesn't work well in headless test environment
vi.mock('r3f-perf', () => ({
    Perf: () => null,
}));

// Mock ResizeObserver for jsdom
global.ResizeObserver = class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
};

describe('Scene', () => {
    it('renders without crashing and contains required components', async () => {
        const renderer = await ReactThreeTestRenderer.create(<Scene />);

        // Use findByType to search for the specialized R3F components or Three.js objects
        // Since Lighting renders ambientLight and pointLight, we look for those
        const ambientLight = renderer.scene.findAllByType('AmbientLight');
        const pointLight = renderer.scene.findAllByType('PointLight');

        expect(ambientLight.length).toBeGreaterThan(0);
        expect(pointLight.length).toBeGreaterThan(0);

        // TestMesh renders a mesh
        const mesh = renderer.scene.findAllByType('Mesh');
        expect(mesh.length).toBeGreaterThan(0);
    });
});
