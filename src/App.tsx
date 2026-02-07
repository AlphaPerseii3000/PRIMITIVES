import { Canvas } from '@react-three/fiber';
import { Scene } from './scene/Scene';
import './App.css';

export function App() {
  return (
    <div id="canvas-container">
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
        camera={{ position: [0, 0, 5], fov: 75 }}
        frameloop="always"
        flat
      >
        <Scene />
      </Canvas>
    </div>
  );
}
