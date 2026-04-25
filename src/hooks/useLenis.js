import { useEffect } from 'react';
import Lenis from '@studio-freight/lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const useLenis = () => {
  useEffect(() => {
    // Lenis ki VIP settings
    const lenis = new Lenis({
      duration: 1.5, // Thoda slow aur royal scroll feel ke liye
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Apple-style easing
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false, // Touch devices par native scroll hi behtar hota hai
      touchMultiplier: 2,
    });

    // GSAP ScrollTrigger ko Lenis ke scroll events ke sath sync karna
    lenis.on('scroll', ScrollTrigger.update);

    // GSAP ke Ticker (Internal Clock) ko Lenis ke sath jorna taake 60FPS mile
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    // Cleanup function jab component unmount ho
    return () => {
      lenis.destroy();
      gsap.ticker.remove((time) => lenis.raf(time * 1000));
    };
  }, []);
};