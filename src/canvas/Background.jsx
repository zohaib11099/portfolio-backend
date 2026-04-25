import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Sparkles } from '@react-three/drei';

const MovingUniverse = () => {
  const universeRef = useRef();

  // Slow VIP rotation animation
  useFrame((state, delta) => {
    if (universeRef.current) {
      universeRef.current.rotation.x -= delta * 0.02;
      universeRef.current.rotation.y -= delta * 0.03;
    }
  });

  return (
    <group ref={universeRef}>
      {/* Deep Space Stars (White/Gray) */}
      <Stars 
        radius={50} 
        depth={50} 
        count={3000} 
        factor={4} 
        saturation={0} 
        fade 
        speed={1} 
      />
      
      {/* Signature Teal Glowing Sparkles / Cyber Dust */}
      <Sparkles 
        count={300} 
        scale={25} 
        size={4} 
        speed={0.4} 
        opacity={0.3} 
        color="#00ffcc" 
      />
    </group>
  );
};

const Background = () => {
  return (
    <div className="vip-global-background">
      <Canvas camera={{ position: [0, 0, 1] }}>
        <MovingUniverse />
      </Canvas>
    </div>
  );
};

export default Background;