import { describe, it, expect, vi } from 'vitest';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { Controls } from './Controls';

const { mockOrbitControls } = vi.hoisted(() => {
  return { mockOrbitControls: vi.fn().mockImplementation(() => null) };
});

vi.mock('@react-three/drei', async () => {
  const actual = await vi.importActual('@react-three/drei');
  return {
    ...actual,
    OrbitControls: mockOrbitControls,
  };
});

describe('Controls', () => {
  it('renders with correct default props', async () => {
    await ReactThreeTestRenderer.create(<Controls />);

    // Verify OrbitControls was called with expected props as the first argument
    expect(mockOrbitControls).toHaveBeenCalled();
    const props = mockOrbitControls.mock.calls[0][0];

    expect(props).toMatchObject({
      makeDefault: true,
      enableDamping: true,
      dampingFactor: 0.05,
      minDistance: 2,
      maxDistance: 50,
    });
  });
});
