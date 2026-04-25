import React, { useRef, useMemo, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, Sphere, Stars, Text, Trail } from "@react-three/drei";
import * as THREE from "three";
import "./SkillsPlanet.css"; 

// --- Custom Shader for Glowing Central Earth ---
const earthVertexShader = `
varying vec2 vUv;
varying vec3 vNormal;
void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const earthFragmentShader = `
uniform sampler2D earthTexture;
uniform sampler2D nightTexture;
varying vec2 vUv;
varying vec3 vNormal;
void main() {
    vec3 dayColor = texture2D(earthTexture, vUv).rgb;
    vec3 nightColor = texture2D(nightTexture, vUv).rgb;
    float alpha = max(0.2, texture2D(earthTexture, vUv).a); 
    
    float intensity = pow(0.65 - dot(vNormal, vec3(1.0, 0.0, 0.0)), 3.0);
    vec3 finalColor = mix(dayColor, nightColor, intensity);
    
    finalColor += vec3(0.0, 0.3, 0.7) * alpha; 
    gl_FragColor = vec4(finalColor, 1.0);
}
`;

const CentralWorld = React.forwardRef(({ dayTexture, nightTexture, radius }, ref) => {
    useFrame(({ clock }) => {
        if (ref.current) {
            ref.current.rotation.y = clock.getElapsedTime() * 0.1; 
        }
    });

    const uniforms = useMemo(() => ({
        earthTexture: { value: new THREE.TextureLoader().load(dayTexture) },
        nightTexture: { value: new THREE.TextureLoader().load(nightTexture) },
    }), [dayTexture, nightTexture]);

    return (
        <Sphere ref={ref} args={[radius, 64, 64]} position={[0, 0, 0]}>
            <shaderMaterial
                uniforms={uniforms}
                vertexShader={earthVertexShader}
                fragmentShader={earthFragmentShader}
                transparent={true}
                depthWrite={true}
            />
        </Sphere>
    );
});

// 🔥 Skill Planet Component (CRASH & NaN FIXED 100%)
const SkillPlanet = ({ skill, isPaused, onClick, centralWorldRef }) => {
    const orbitGroupRef = useRef();
    const planetRef = useRef();

    // 🛡️ Safety Fallbacks
    const sRadius = skill.radius || 10;
    const sSpeed = skill.speed || 0.2;
    const sAngle = skill.initialAngle || 0;
    const sColor = skill.color || "#ffffff";

    const yOffset = Math.sin(sAngle * 3) * 1.5; 

    useFrame((_, delta) => {
        if (!isPaused && orbitGroupRef.current) {
            orbitGroupRef.current.rotation.y -= sSpeed * delta; 
        }
        if (!isPaused && planetRef.current) {
            planetRef.current.rotation.y += delta * 0.8;
            planetRef.current.rotation.x += delta * 0.4;
        }
    });

    const handlePlanetClick = (e) => {
        e.stopPropagation();
        const worldPos = new THREE.Vector3();
        planetRef.current.getWorldPosition(worldPos);
        onClick(skill, worldPos);
    };

    // 🔥 MAIN FIX: Length ko hamesha ek mukammal number (Integer) banaya hai taake NaN error na aaye
    const trailLength = Math.max(20, Math.round(sRadius * 4));

    return (
        <group ref={orbitGroupRef} rotation={[0, sAngle, 0]}>
            
            {/* Trail mein ab decimal point wali length nahi jayegi */}
            <Trail width={0.6} length={trailLength} color={sColor} attenuation={(t) => t * t}>
                
                <group position={[sRadius, yOffset, 0]}>
                    <Sphere 
                        ref={planetRef} 
                        args={[1.5, 32, 32]} 
                        onClick={handlePlanetClick}
                    >
                        <meshStandardMaterial 
                            color={sColor} 
                            emissive={sColor} 
                            emissiveIntensity={0.6} 
                            roughness={0.2} 
                            metalness={0.8} 
                        />
                    </Sphere>

                    <Html distanceFactor={15} center zIndexRange={[100, 0]} occlude={[centralWorldRef]}>
                        <div 
                            className="sp-skill-icon-wrapper" 
                            onClick={handlePlanetClick}
                            style={{ 
                                borderColor: sColor, 
                                boxShadow: `0 0 25px ${sColor}90`,
                                background: 'rgba(10, 15, 30, 0.7)'
                            }}
                        >
                            <img src={skill.icon} alt={skill.name} className="sp-skill-icon" />
                        </div>
                    </Html>

                    <Text position={[0, -2.2, 0]} fontSize={0.45} color={sColor} anchorX="center" anchorY="middle" outlineWidth={0.03} outlineColor="#000">
                        {skill.name}
                    </Text>
                </group>

            </Trail>
        </group>
    );
};

// 🎥 Cinematic Camera Controller
const CameraController = ({ selectedPos }) => {
    useFrame((state) => {
        if (selectedPos) {
            const targetPos = new THREE.Vector3(selectedPos.x * 1.2, selectedPos.y + 3.5, selectedPos.z * 1.2 + 12);
            state.camera.position.lerp(targetPos, 0.05);
            state.camera.lookAt(selectedPos.x, selectedPos.y, selectedPos.z);
        } else {
            state.camera.position.lerp(new THREE.Vector3(0, 22, 48), 0.03);
            state.camera.lookAt(0, 0, 0);
        }
    });
    return null;
};

const SkillInfoPanel = ({ skill, onClose }) => {
    return (
        <div className="sp-info-panel" style={{ border: `1px solid ${skill.color}`, boxShadow: `0 0 30px ${skill.color}40 inset` }}>
            <div className="sp-info-header" style={{ borderBottom: `1px solid ${skill.color}40` }}>
                <h3 className="sp-info-title" style={{ color: skill.color, textShadow: `0 0 10px ${skill.color}80` }}>{skill.name}</h3>
                <button onClick={onClose} className="sp-close-btn" style={{ color: skill.color }}>&times;</button>
            </div>
            <p className="sp-info-desc">{skill.description}</p>
        </div>
    );
};

const Scene = ({ skills, selectedSkill, setSelectedSkill }) => {
    const centralWorldRef = useRef();
    const timeoutRef = useRef(null);
    const [selectedPos, setSelectedPos] = useState(null);

    const handleSkillClick = (skill, position) => {
        setSelectedSkill(skill);
        setSelectedPos(position);
    };

    useEffect(() => {
        if (selectedSkill) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => {
                setSelectedSkill(null);
                setSelectedPos(null);
            }, 5000);
        }
        return () => clearTimeout(timeoutRef.current);
    }, [selectedSkill, setSelectedSkill]);

    return (
        <>
            <fog attach="fog" args={["#020205", 10, 80]} />
            <Stars radius={120} depth={50} count={5000} factor={4} fade speed={1.5} />
            <ambientLight intensity={0.6} />
            <pointLight position={[0, 0, 0]} intensity={2.5} color="#ffffff" distance={60} />
            
            <group position={[0, -3.0, 0]}>
                <Suspense fallback={null}>
                    <CentralWorld
                        ref={centralWorldRef}
                        dayTexture="https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg"
                        nightTexture="https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_lights_2048.png"
                        radius={6.5} 
                    />
                    
                    {skills.map((skill, index) => (
                        <SkillPlanet 
                            key={index} 
                            skill={skill} 
                            isPaused={!!selectedSkill} 
                            onClick={handleSkillClick}
                            centralWorldRef={centralWorldRef}
                        />
                    ))}
                </Suspense>
            </group>

            <CameraController selectedPos={selectedPos} />
        </>
    );
};

export default function SkillsPlanet() {
    const [selectedSkill, setSelectedSkill] = useState(null);

    const skills = useMemo(() => [
        { name: "Laravel", color: "#FF2D20", radius: 10.5, speed: 0.35, initialAngle: 0, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/laravel/laravel-original.svg", description: "Expert in building complex SaaS products like SalesFlow CRM, managing WhatsApp bot engines and database relations." },
        { name: "Angular", color: "#DD0031", radius: 11.5, speed: 0.32, initialAngle: 1.5, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/angular/angular-original.svg", description: "Experienced in developing enterprise-scale Single Page Applications (SPA) with modular architecture and RxJS." },
        { name: "React", color: "#61DAFB", radius: 12.5, speed: 0.30, initialAngle: 3, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg", description: "Building advanced dashboards and AI-integrated front-ends like OmniFlow for seamless user experiences." },
        { name: "TypeScript", color: "#3178C6", radius: 13.5, speed: 0.28, initialAngle: 4.5, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg", description: "Utilizing strongly typed JavaScript to write maintainable, error-free code for large-scale frontend projects." },
        { name: "Node.js", color: "#339933", radius: 14.5, speed: 0.26, initialAngle: 6, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg", description: "Specialized in building real-time bot engines and scalable backend services for automation tools." },
        { name: ".NET", color: "#512BD4", radius: 15.5, speed: 0.24, initialAngle: 1, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/dot-net/dot-net-original.svg", description: "Experienced in building scalable enterprise applications and cross-platform services using the .NET framework." },
        { name: "C#", color: "#239120", radius: 16.5, speed: 0.22, initialAngle: 2.5, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/csharp/csharp-original.svg", description: "Strong command of C# for developing secure backend logic, desktop tools, and high-performance services." },
        { name: "SQL Server", color: "#CC292B", radius: 17.5, speed: 0.20, initialAngle: 4, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/microsoftsqlserver/microsoftsqlserver-plain-wordmark.svg", description: "Designing complex schemas and optimizing stored procedures for high-performance enterprise data management." },
        { name: "MySQL", color: "#4479A1", radius: 18.5, speed: 0.18, initialAngle: 5.5, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mysql/mysql-original.svg", description: "Expertise in designing optimized relational database schemas for high-traffic management systems." },
        { name: "Gemini AI", color: "#8E75B2", radius: 19.5, speed: 0.16, initialAngle: 0.5, icon: "https://www.gstatic.com/lamda/images/favicon_v2_16x16.png", description: "Integrating Google's Generative AI into lead management systems to automate customer interactions." },
        { name: "Python", color: "#3776AB", radius: 20.5, speed: 0.14, initialAngle: 2, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg", description: "Using Python for backend logic, especially in health insurance fraud detection and risk scoring systems." },
        { name: "YOLOv8", color: "#00FFFF", radius: 21.5, speed: 0.12, initialAngle: 3.5, icon: "https://avatars.githubusercontent.com/u/26461388?s=200&v=4", description: "Implementing Computer Vision for object detection and automated image analysis in custom AI workflows." },
        { name: "JavaScript", color: "#F7DF1E", radius: 11, speed: 0.34, initialAngle: 5, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg", description: "Mastery in core JS, DOM manipulation, and asynchronous logic for complex web functionalities." },
        { name: "HTML5", color: "#E34F26", radius: 13, speed: 0.29, initialAngle: 1.2, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg", description: "Crafting semantic, accessible, and SEO-friendly structures for modern web applications." },
        { name: "CSS3", color: "#1572B6", radius: 15, speed: 0.25, initialAngle: 2.8, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg", description: "Expert in advanced styling, animations, and responsive layouts to deliver premium user interfaces." },
        { name: "Git", color: "#F05032", radius: 17, speed: 0.21, initialAngle: 4.2, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg", description: "Managing version control and collaborating on multi-member team projects efficiently via GitHub." },
        { name: "Three.js", color: "#FFFFFF", radius: 19, speed: 0.17, initialAngle: 5.8, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/threejs/threejs-original.svg", description: "Developing immersive 3D visualizations and interactive web elements for high-end portfolio sections." },
        { name: "PHP", color: "#777BB4", radius: 21, speed: 0.13, initialAngle: 0.8, icon: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/php/php-original.svg", description: "Core backend development mastery, building secure and modular logic for professional web applications." }
    ], []);

    return (
        <div className="skills-planet-wrapper">
            <div className="sp-title-container">
                <h1 className="sp-main-title">My Tech Arsenal</h1>
                <p className="sp-subtitle">Dive into my Universe of Expertise</p>
            </div>

            <div className="sp-canvas-container">
                <Canvas camera={{ position: [0, 22, 48], fov: 50 }} gl={{ antialias: true, alpha: false }}>
                    <Suspense fallback={null}>
                        <Scene
                            skills={skills}
                            selectedSkill={selectedSkill}
                            setSelectedSkill={setSelectedSkill}
                        />
                    </Suspense>
                </Canvas>
                
                {selectedSkill && <SkillInfoPanel skill={selectedSkill} onClose={() => setSelectedSkill(null)} />}
            </div>
        </div>
    );
}