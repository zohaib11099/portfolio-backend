import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './Navbar.css';

const Navbar = () => {
  const pillRef = useRef(null);
  const logoRef = useRef(null);
  const linksRef = useRef(null);
  const btnRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline();

    // Step 1: Pill drops from top and expands
    tl.fromTo(
      pillRef.current,
      { y: -80, scaleX: 0.15, opacity: 0, width: '80px' },
      {
        y: 0,
        scaleX: 1,
        opacity: 1,
        width: 'min(720px, 90%)',
        duration: 1.1,
        ease: 'back.out(1.4)',
      }
    )
    // Step 2: Content fades in after pill expands
    .fromTo(
      [logoRef.current, linksRef.current, btnRef.current],
      { opacity: 0, y: 4 },
      { opacity: 1, y: 0, duration: 0.35, stagger: 0.08, ease: 'power2.out' },
      '-=0.1'
    );
  }, []);

  return (
    <header className="navbar">
      <div className="navbar-pill" ref={pillRef}>
        <div className="logo" ref={logoRef}>
          <span>Zohaib</span><span className="accent">.dev</span>
        </div>

        <nav className="nav-links" ref={linksRef}>
          <a href="#work">Work</a>
          <a href="#skills">Skills</a>
          <a href="#experience">Experience</a>
        </nav>

        <a href="#contact" className="contact-btn" ref={btnRef}>
          Contact Me
        </a>
      </div>
    </header>
  );
};

export default Navbar;