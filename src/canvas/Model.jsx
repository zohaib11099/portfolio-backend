import React, { useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

const Model = () => {
    // Yahan apni file ka exact path do jo public folder mein hai
    const { scene } = useGLTF('/scene.glb');
    const modelRef = useRef();

    // Model ko float karwane ke liye ultra-smooth animation
    useFrame((state) => {
        if (modelRef.current) {
            // Time ke hisaab se Y-axis par halka sa up-down move karega
            modelRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1 - 1;
        }
    });

    return (
        // Scale ko apne model ke hisaab se adjust kar lena (1, 1.5, ya 2)
        // src/canvas/Model.jsx

// Scale ko 1.2 se barha kar 1.8 ya 2.0 karein
<mesh ref={modelRef} position={[0, -1, 0]} scale={1.8}>
  <primitive object={scene} />
</mesh>
    );
};

export default Model;

// Agar model load hone se pehle hi canvas crash ho jaye, toh scene mein Suspense lagana zaroori hai