import React, { useState } from 'react';
import { useLenis } from './hooks/useLenis';

// Global Canvas & Functional Components
import Preloader from './components/Preloader';
import Background from './canvas/Background';

// UI Layout Components
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Projects from './components/Projects';
import SkillsPlanet from './components/SkillsPlanet';
import Experience from './components/Experience';
import Contact from './components/Contact';

// Global Styling
import './App.css';

const App = () => {
  // Website ki loading state (Preloader control karne ke liye)
  const [isReady, setIsReady] = useState(false);

  // Smooth scrolling hook (Sirf tab active hoga jab site ready hogi)
  useLenis(isReady);

  return (
    <div className="portfolio-container text-white">
      
      {/* 1. VIP Identity Gatekeeper (Preloader + Voice Intro) */}
      {!isReady && (
        <Preloader onComplete={() => setIsReady(true)} />
      )}


      {/* 3. Deep Space 3D Background */}
      <Background />

      {/* 4. Main Site Content (Is par transition lagayi hai) */}
      <div 
        className={`main-site-wrapper ${isReady ? 'site-visible' : 'site-hidden'}`}
        style={{
          opacity: isReady ? 1 : 0,
          transition: 'opacity 1.5s ease-in-out'
        }}
      >
        <Navbar />
        
        <main>
          {/* Intro Section */}
          <Hero />

          {/* Featured Work */}
          <Projects />


          {/* 🌍 Tera VIP Skills Planet Section */}
      <SkillsPlanet />

          {/* 3D Experience Cylinder */}
          <Experience />

          {/* Contact & Bug Smasher Game */}
          <Contact />
        </main>
      </div>

    </div>
  );
};

export default App;