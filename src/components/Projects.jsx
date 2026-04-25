import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import './Projects.css';

const projectsData = [
  {
    title: 'SalesFlow',
    category: 'E-Commerce CRM',
    img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop', 
    year: '2026'
  },
  {
    title: 'Smart AI',
    category: 'Fraud Detection System',
    img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2670&auto=format&fit=crop',
    year: '2025'
  },
  {
    title: 'Spurdle',
    category: 'Game Data Exporter',
    img: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2670&auto=format&fit=crop',
    year: '2025'
  },
  {
    title: 'OmniFlow',
    category: 'Enterprise CRM Suite',
    img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2670&auto=format&fit=crop',
    year: '2026'
  }
];

const Projects = () => {
  const cursorRef = useRef(null);
  const sectionRef = useRef(null);
  
  // Track currently clicked project
  const [activeIndex, setActiveIndex] = useState(null);
  const [activeImage, setActiveImage] = useState('');

  useEffect(() => {
    // Ultra-smooth cursor following
    const xMove = gsap.quickTo(cursorRef.current, "left", { duration: 0.4, ease: "power3" });
    const yMove = gsap.quickTo(cursorRef.current, "top", { duration: 0.4, ease: "power3" });

    const handleMouseMove = (e) => {
      xMove(e.clientX);
      yMove(e.clientY);
    };

    const section = sectionRef.current;
    section.addEventListener('mousemove', handleMouseMove);

    return () => {
      section.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Handle Click Logic
  const handleProjectClick = (index, img) => {
    if (activeIndex === index) {
      // Agar same project par click kiya toh band kar do
      setActiveIndex(null);
      gsap.to(cursorRef.current, { scale: 0, autoAlpha: 0, duration: 0.3, ease: "power2.in" });
    } else {
      // Naye project par click kiya toh open karo
      setActiveIndex(index);
      setActiveImage(img);
      gsap.to(cursorRef.current, { scale: 1, autoAlpha: 1, duration: 0.3, ease: "power2.out" });
    }
  };

  return (
    <section className="awwwards-projects" ref={sectionRef} id="work">
      
      <div 
        className="project-image-cursor" 
        ref={cursorRef}
        style={{ backgroundImage: `url(${activeImage})` }}
      ></div>

      <div className="projects-list-container">
        <div className="list-header">
          <p>Recent Works</p>
          <p>Click to View</p>
        </div>

        <ul className="project-list">
          {projectsData.map((project, index) => {
            // Check if this item is active, or if another item is active (to dim this one)
            const isActive = activeIndex === index;
            const isDimmed = activeIndex !== null && activeIndex !== index;

            return (
              <li 
                key={index} 
                className={`project-row ${isActive ? 'active' : ''} ${isDimmed ? 'dimmed' : ''}`}
                onClick={() => handleProjectClick(index, project.img)}
              >
                <div className="row-left">
                  <span className="project-index">0{index + 1}</span>
                  <h2 className="project-massive-title">{project.title}</h2>
                </div>
                <div className="row-right">
                  <span className="project-category">{project.category}</span>
                  <span className="project-year">{project.year}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};

export default Projects;