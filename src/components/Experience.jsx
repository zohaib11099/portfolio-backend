import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Experience.css';

gsap.registerPlugin(ScrollTrigger);

const experienceData = [
    { year: 'Present', role: 'Back-end Developer', company: 'DevelopersHub', icon: '01', desc: 'Scalable architectures aur robust API integrations par kaam.' },
    { year: '2025-26', role: 'Full-Stack Developer', company: 'Independent', icon: '02', desc: 'JobSplit aur OmniFlow jaise complex modules develop kiye.' },
    { year: 'Ongoing', role: 'Web Expert', company: 'Aptech', icon: '03', desc: 'Modern frameworks aur industry standards mein perfection.' },
    { year: 'Academic', role: 'Bachelor Degree', company: 'Iqra University', icon: '04', desc: 'Computer Science ki solid foundation aur logic building.' }
];

const Experience = () => {
    const sectionRef = useRef(null);
    const cylinderRef = useRef(null);

    useEffect(() => {
        // Layout recalculation for smooth pinning
        ScrollTrigger.refresh();

        const ctx = gsap.context(() => {
            gsap.to(cylinderRef.current, {
                rotationY: -360,
                ease: "none",
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top top",
                    end: "+=2500", // Scroll distance
                    pin: true,
                    scrub: 1,
                    anticipatePin: 1, // Pinning glitches ko khatam karne ke liye
                    onUpdate: (self) => {
                        // Visual check for debugging if needed
                    }
                }
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section className="spatial-experience" ref={sectionRef} id="experience">
            <div className="bg-hologram-text">JOURNEY</div>

            <div className="spatial-header">
                <h2>Spatial <span className="accent">Journey.</span></h2>
                <p>Scroll to interact with the 3D hologram.</p>
            </div>

            <div className="scene-3d">
                <div className="cylinder-3d" ref={cylinderRef}>
                    {experienceData.map((item, index) => (
                        <div
                            className="spatial-card"
                            key={index}
                            style={{ transform: `rotateY(${index * 90}deg) translateZ(280px)` }}
                        >
                            <div className="card-glass-panel">
                                <div className="watermark-number">{item.icon}</div>
                                <span className="spatial-year">{item.year}</span>
                                <h3 className="spatial-role">{item.role}</h3>
                                <h4 className="spatial-company">{item.company}</h4>
                                <p className="spatial-desc">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Experience;