// src/canvas/Scene.jsx
import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei'; // OrbitControls add karein
import Model from './Model';

const Scene = () => {
  return (
    <Canvas camera={{ position: [0, 2, 9], fov: 45 }} className="webgl-canvas w-full h-full">      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} color="#00ffcc" />

      <Environment preset="city" />

      <Suspense fallback={null}>
        <Model />
      </Suspense>

      {/* Ab is model ko mouse se rotate/zoom kiya ja sakta hai! */}
      <OrbitControls enableZoom={true} enableRotate={true} />
    </Canvas>
  );
};

export default Scene;