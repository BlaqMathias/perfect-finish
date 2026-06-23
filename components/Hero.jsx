'use client';
import { useEffect } from 'react';

export default function Hero() {
  useEffect(() => {
    // Entrance animations
    const heroAnims = document.querySelectorAll('[data-hero-anim]');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        heroAnims.forEach(el => el.classList.add('hero-visible'));
      });
    });

    // Particle canvas
    const canvas = document.getElementById('heroParticles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, particles;
    const COUNT = 55;

    function resize() {
      const hero = document.getElementById('home');
      W = canvas.width  = hero ? hero.offsetWidth  : window.innerWidth;
      H = canvas.height = hero ? hero.offsetHeight : window.innerHeight;
    }
    function mkParticle() {
      return {
        x: Math.random() * W, y: Math.random() * H,
        r: Math.random() * 1.4 + 0.3,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18 - 0.06,
        a: Math.random(),
        da: (Math.random() * 0.003 + 0.001) * (Math.random() < 0.5 ? 1 : -1),
      };
    }
    function init() { resize(); particles = Array.from({ length: COUNT }, mkParticle); }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201,168,76,${p.a * 0.55})`;
        ctx.fill();
        p.x += p.vx; p.y += p.vy; p.a += p.da;
        if (p.a > 1) { p.a = 1; p.da *= -1; }
        if (p.a < 0) { p.a = 0; p.da *= -1; }
        if (p.x < -5) p.x = W + 5;
        if (p.x > W + 5) p.x = -5;
        if (p.y < -5) p.y = H + 5;
        if (p.y > H + 5) p.y = -5;
      });
      requestAnimationFrame(draw);
    }
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reducedMotion) {
      init(); draw();
      const onResize = () => {
        resize();
        particles.forEach(p => {
          if (p.x > W) p.x = Math.random() * W;
          if (p.y > H) p.y = Math.random() * H;
        });
      };
      window.addEventListener('resize', onResize);
      return () => window.removeEventListener('resize', onResize);
    }
  }, []);

  return (
    <section id="home" className="hero">
      <div className="hero-bg-grid"></div>
      <div className="hero-bg-orb hero-bg-orb--1"></div>
      <div className="hero-bg-orb hero-bg-orb--2"></div>
      <canvas className="hero-particles" id="heroParticles" aria-hidden="true"></canvas>

      <div className="hero-content">
        <p className="hero-eyebrow" data-hero-anim="0">Luxury Fragrance House</p>
        <h1 className="hero-headline" data-hero-anim="1">
          Find Your<br />
          <em>Perfect Finish</em>
        </h1>
        <p className="hero-sub" data-hero-anim="2">
          Premium fragrances and custom scent blends crafted for unforgettable impressions.
        </p>
        <div className="hero-actions" data-hero-anim="4">
          <a href="#fragrances" className="btn btn-gold hero-btn-primary">
            <span>Shop Fragrances</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
          <a href="#custom-blend" className="btn btn-outline hero-btn-secondary">Create Custom Blend</a>
        </div>
        <div className="hero-trust" data-hero-anim="5">
          <span className="trust-item">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            Authentic Ingredients
          </span>
          <span className="trust-dot" aria-hidden="true">·</span>
          <span className="trust-item">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            Bespoke Blending
          </span>
          <span className="trust-dot" aria-hidden="true">·</span>
          <span className="trust-item">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            Delivery Services
          </span>
        </div>
      </div>

      <div className="hero-visual" data-hero-anim="visual">
        <div className="hero-img-wrap">
          <div className="hero-frame-accent" aria-hidden="true"></div>
          <div className="hero-img-main">
            <img
              src="/images/p14.jpg"
              alt="Perfect Finish luxury perfume bottle"
              className="hero-image"
              onError={e => { e.target.style.display = 'none'; e.target.parentElement.classList.add('img-fallback'); }}
            />
          </div>
          <div className="hero-img-detail">
            <img
              src="/images/p18.jpg"
              alt="Perfume detail"
              className="hero-image-detail"
              onError={e => { e.target.style.display = 'none'; e.target.parentElement.classList.add('img-fallback-sm'); }}
            />
          </div>
          <div className="hero-corner-tl" aria-hidden="true"></div>
          <div className="hero-corner-br" aria-hidden="true"></div>
          <div className="hero-img-glow" aria-hidden="true"></div>
        </div>
      </div>
    </section>
  );
}