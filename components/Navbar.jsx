'use client';
import { useEffect } from 'react';

export default function Navbar() {
  useEffect(() => {
    const navbar    = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navLinks  = document.getElementById('navLinks');

    function onScroll() {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
      updateActive();
    }

    function updateActive() {
      const scrollY = window.scrollY + 100;
      document.querySelectorAll('section[id]').forEach(section => {
        const id   = section.getAttribute('id');
        const link = document.querySelector(`.nav-link[href="#${id}"]`);
        if (!link) return;
        const inView = scrollY >= section.offsetTop && scrollY < section.offsetTop + section.offsetHeight;
        if (inView) {
          document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
          link.classList.add('active');
        }
      });
    }

    function toggleMenu() {
      hamburger.classList.toggle('open');
      navLinks.classList.toggle('open');
    }

    function closeMenu() {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
    }

    window.addEventListener('scroll', onScroll);
    hamburger.addEventListener('click', toggleMenu);
    navLinks.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', closeMenu));
    document.addEventListener('click', e => { if (!navbar.contains(e.target)) closeMenu(); });

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav id="navbar">
      <div className="nav-inner">
        <a href="#home" className="logo">
          <span className="logo-pf">PF</span>
          <span className="logo-text">Perfect Finish</span>
        </a>

        <ul className="nav-links" id="navLinks">
          <li><a href="#home"         className="nav-link active">Home</a></li>
          <li><a href="#fragrances"   className="nav-link">Fragrances</a></li>
          <li><a href="#about"        className="nav-link">About</a></li>
          <li><a href="#how-it-works" className="nav-link">How It Works</a></li>
          <li><a href="#reviews"      className="nav-link">Reviews</a></li>
          <li><a href="#order"        className="nav-link nav-cta">Order Now</a></li>
        </ul>

        <button className="hamburger" id="hamburger" aria-label="Toggle menu">
          <span></span><span></span><span></span>
        </button>
      </div>
    </nav>
  );
}