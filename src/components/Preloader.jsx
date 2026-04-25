import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import axios from 'axios'; // 🔥 Axios import kar liya
import './Preloader.css';

const Preloader = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState('loading'); // 'loading' | 'input' | 'exiting'
  const [visitorName, setVisitorName] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    // Phase 1: VIP Loading Sequence
    let current = 0;
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 15) + 5;
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
        setTimeout(() => setPhase('input'), 600); 
      }
      setProgress(current);
    }, 150);

    // Ye zaroori hai taake browser pehle se saari premium aawazein load kar le
    window.speechSynthesis.getVoices();

    return () => clearInterval(interval);
  }, []);

  // 🔥 Function ko async bana diya taake API call ho sake
  const handleEnterSite = async (e) => {
    e.preventDefault();
    if (!visitorName.trim()) return;

    setPhase('exiting'); 

    // --- 🌐 BACKEND INTEGRATION START ---
    // 1. Naam ko LocalStorage mein save kar lo (Contact aur Game ke liye)
    localStorage.setItem("visitorName", visitorName);

    // 2. Naam ko Node.js Backend Database mein bhej do
    try {
      await axios.post('http://localhost:5000/api/init-visitor', { name: visitorName });
      console.log("Visitor saved to database!");
    } catch (error) {
      console.error("Database error (Server might be off), but continuing...", error);
    }
    // --- 🌐 BACKEND INTEGRATION END ---

    // --- ULTIMATE ACCENT & PRONUNCIATION HACK ---
    const speech = new SpeechSynthesisUtterance();
    
    // YAHAN HAI ASLI JADU:
    // 1. Visitor name ke baad comma (,) taake thehar kar bole.
    // 2. "Zoh hayb" aur "Hus sun" ko alag kiya hai taake goro wala accent na aaye.
    // 3. Har word ke baad comma (,) dala hai taake aawaz mein ek premium AI "saans" (pause) aaye.
    speech.text = `Welcome, ${visitorName}, to Zoh hayb, Hus sun's, portfolio.`;
    
    // Speed mazeed slow ki hai taake aur zyada natural aur royal lagay
    speech.rate = 0.82;  
    speech.pitch = 1.1;  
    speech.volume = 1;
    
    // Force Indian English Language Model
    speech.lang = 'en-IN'; 
    
    const voices = window.speechSynthesis.getVoices();
    
    // Aggressively target the best Desi Female voices
    const premiumIndian = voices.find(v => v.name.includes('Neerja') || v.name === 'Google हिन्दी' || v.name.includes('India'));
    const anyFemaleIN = voices.find(v => v.lang === 'en-IN' && v.name.toLowerCase().includes('female'));
    const fallbackIndian = voices.find(v => v.lang === 'en-IN');

    // Assign the best available voice
    if (premiumIndian) {
      speech.voice = premiumIndian;
    } else if (anyFemaleIN) {
      speech.voice = anyFemaleIN;
    } else if (fallbackIndian) {
      speech.voice = fallbackIndian;
    }

    window.speechSynthesis.speak(speech);
    // ---------------------------------------

    // Screen Fade animation
    gsap.to(containerRef.current, {
      yPercent: -100,
      opacity: 0,
      duration: 1.5,
      ease: "power4.inOut",
      delay: 1, // Thoda sa delay barha diya taake aawaz araam se shuru ho
      onComplete: () => {
        onComplete(); 
      }
    });
  };

  return (
    <div className="vip-hologram-preloader" ref={containerRef}>
      
      {phase === 'loading' && (
        <div className="preloader-content fade-in">
          <h1 className="glitch-title">SYSTEM BOOT</h1>
          <div className="progress-container">
            <div className="progress-bar" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="loading-data">
            <span>{progress}%</span>
            <span>INITIALIZING MATRIX...</span>
          </div>
        </div>
      )}

      {(phase === 'input' || phase === 'exiting') && (
        <div className="preloader-content fade-in">
          <h2 className="identify-text">IDENTIFY GUEST</h2>
          
          <form onSubmit={handleEnterSite} className="guest-form">
            <input
              type="text"
              value={visitorName}
              onChange={(e) => setVisitorName(e.target.value)}
              placeholder="ENTER NAME..."
              autoFocus
              required
              autoComplete="off"
              spellCheck="false"
              className="vip-guest-input"
              disabled={phase === 'exiting'}
            />
            
            <button 
              type="submit" 
              className={`enter-gate-btn ${phase === 'exiting' ? 'granted' : ''}`} 
              disabled={phase === 'exiting'}
            >
              {phase === 'exiting' ? 'ACCESS GRANTED' : 'INITIALIZE'}
            </button>
          </form>
          
          <p className="audio-hint">Turn on sound for optimal experience.</p>
        </div>
      )}
      
    </div>
  );
};

export default Preloader;