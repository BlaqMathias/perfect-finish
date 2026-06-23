'use client';
// Preloader — luxury loading screen.
// Waits for: DOM ready → /api/perfumes → /api/reviews → visible images.
// Exposes window.__pfLoaderDone() which FeaturedFragrances and Reviews call
// after they finish injecting dynamic content.

import { useEffect } from 'react';

export default function Preloader() {
  useEffect(() => {
    const loader = document.getElementById('pf-loader');
    const bar    = document.getElementById('pfLoaderBar');
    const pct    = document.getElementById('pfLoaderPct');
    if (!loader) return;

    document.body.classList.add('pf-loading');

    let progress = 0;

    function setProgress(value) {
      progress = Math.min(100, Math.max(progress, value));
      if (bar) bar.style.width = progress + '%';
      if (pct) pct.textContent = Math.round(progress) + '%';
    }

    function hideLoader() {
      setProgress(100);
      setTimeout(() => {
        loader.classList.add('pf-loader--hidden');
        document.body.classList.remove('pf-loading');
        loader.addEventListener('transitionend', () => loader.remove(), { once: true });
      }, 350);
    }

    // Safety net: never hang more than 8s
    const safetyTimer = setTimeout(hideLoader, 8000);

    function waitForImages() {
      return new Promise(resolve => {
        const imgs = Array.from(document.images);
        if (imgs.length === 0) return resolve();
        let loaded = 0;
        const total = imgs.length;
        function onSettled() {
          loaded++;
          setProgress(70 + Math.round((loaded / total) * 28));
          if (loaded >= total) resolve();
        }
        imgs.forEach(img => {
          if (img.complete) { onSettled(); }
          else {
            img.addEventListener('load',  onSettled, { once: true });
            img.addEventListener('error', onSettled, { once: true });
          }
        });
      });
    }

    // Track how many async sections have reported back
    let pendingSections = 2; // products + reviews

    function sectionDone() {
      pendingSections--;
      if (pendingSections <= 0) {
        clearTimeout(safetyTimer);
        setProgress(70);
        waitForImages().then(hideLoader);
      }
    }

    // Expose so FeaturedFragrances and Reviews components can call it
    window.__pfSectionDone  = sectionDone;
    window.__pfSetProgress  = setProgress;

    // Start progress animation
    requestAnimationFrame(() => {
      setProgress(10);
      setTimeout(() => setProgress(20), 200);
    });

    return () => {
      clearTimeout(safetyTimer);
      delete window.__pfSectionDone;
      delete window.__pfSetProgress;
    };
  }, []);

  return (
    <div id="pf-loader" className="pf-loader" aria-live="polite" aria-label="Loading Perfect Finish">
      <div className="pf-loader__inner">
        <div className="pf-loader__logo">
          <span className="pf-loader__pf">PF</span>
          <span className="pf-loader__brand">Perfect Finish</span>
        </div>
        <p className="pf-loader__tagline">Preparing Your Perfect Finish</p>
        <div className="pf-loader__bar-wrap">
          <div className="pf-loader__bar" id="pfLoaderBar"></div>
        </div>
        <span className="pf-loader__pct" id="pfLoaderPct">0%</span>
      </div>
      <div className="pf-loader__ambient" aria-hidden="true"></div>
    </div>
  );
}