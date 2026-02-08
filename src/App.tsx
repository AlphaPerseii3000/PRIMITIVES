import { Canvas } from '@react-three/fiber';
import { Scene } from './scene/Scene';
import { AudioProvider } from './engine/audio';
import { LoadingScreen } from './shared/components/LoadingScreen';
import './App.css';

export function App() {
  return (
    <AudioProvider>
      <div id="canvas-container">
        <LoadingScreen />
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
    </AudioProvider>
  );
}
