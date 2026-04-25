import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Float, PerspectiveCamera } from '@react-three/drei';

// Model loading component
const PCModel = () => {
  const { scene } = useGLTF('/scene.glb');
  return (
    <primitive 
      object={scene} 
      // Jani, yahan scale chota kiya hai (0.7). Agar aur chota chahiye toh 0.5 kar dena.
      scale={0.7} 
      // Model ko thoda neechay (y: -1) aur thoda right (x: 0.5) kiya hai
      position={[0.5, -1, 0]} 
      rotation={[0, -0.5, 0]} 
    />
  );
};

const Hero = () => {
  return (
    <section className="hero-wrapper" style={{ 
      display: 'flex', 
      width: '100%', 
      height: '100vh', 
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
      
      {/* Left Side: Humara Text Content */}
      <div className="hero-content-left" style={{ 
        flex: 1, 
        paddingLeft: '10%', 
        zIndex: 2,
        pointerEvents: 'none' // Taake mouse clicks model tak ja sakein
      }}>
        <h1 style={{ fontSize: '4.5rem', fontWeight: '900', lineHeight: '1.1' }}>
          into Real Projects<br/>that Deliver Results.
        </h1>
        
        <p style={{ fontSize: '1.2rem', color: '#a0a0a0', marginTop: '20px', maxWidth: '500px' }}>
          Hi, we're a full-stack developer team with a passion for building ultra-next-level web and mobile experiences.
        </p>

        <div className="hero-stats" style={{ display: 'flex', gap: '50px', marginTop: '50px' }}>
          <div>
            <h2 style={{ fontSize: '2.5rem', margin: 0 }}>15+</h2>
            <p style={{ color: '#666', fontSize: '0.8rem' }}>PROJECTS DELIVERED</p>
          </div>
          <div>
            <h2 style={{ fontSize: '2.5rem', margin: 0 }}>100%</h2>
            <p style={{ color: '#666', fontSize: '0.8rem' }}>CLIENT SATISFACTION</p>
          </div>
        </div>
      </div>

      {/* Right Side: 3D Model Canvas */}
      <div className="hero-model-right" style={{ 
        flex: 1, 
        height: '100%', 
        position: 'relative' 
      }}>
        <Canvas shadows dpr={[1, 2]}>
          {/* VIP Lighting taake model ke colors pop karein */}
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} />
          <pointLight position={[-10, -10, -10]} color="#00ffcc" intensity={1} />
          <directionalLight position={[0, 5, 5]} intensity={1.5} />

          <Suspense fallback={null}>
            {/* Float animation se model hawa mein tairta rahay ga */}
            <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
              <PCModel />
            </Float>
          </Suspense>

          <OrbitControls 
            enableZoom={false} 
            // Rotation ko limit kiya hai taake model hamesha front side dikhaye
            minPolarAngle={Math.PI / 2.5}
            maxPolarAngle={Math.PI / 2}
          />
        </Canvas>
      </div>

    </section>
  );
};

export default Hero;