'use client';
import { useState, useEffect, useRef } from 'react';

const stars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);

export default function Reviews() {
  const [reviews,  setReviews]  = useState([]);
  const [index,    setIndex]    = useState(0);
  const trackRef   = useRef(null);
  const touchStart = useRef(0);

  useEffect(() => {
    fetch('/api/reviews', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setReviews(data);
      })
      .catch(() => {})
      .finally(() => {
        if (window.__pfSetProgress) window.__pfSetProgress(70);
        if (window.__pfSectionDone) window.__pfSectionDone();
      });
  }, []);

  function getVisible() {
    if (typeof window === 'undefined') return 3;
    if (window.innerWidth <= 768)  return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
  }

  function goTo(i) {
    const visible = getVisible();
    const max     = Math.max(0, reviews.length - visible);
    setIndex(Math.max(0, Math.min(max, i)));
  }

  // Slide the track when index or reviews change
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const cards = track.querySelectorAll('.review-card');
    if (!cards.length) return;
    const cardWidth = cards[0].offsetWidth + 24;
    track.style.transform = `translateX(-${index * cardWidth}px)`;
  }, [index, reviews]);

  // Rebuild on resize
  useEffect(() => {
    const onResize = () => { setIndex(0); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const dotCount = Math.max(1, reviews.length - getVisible() + 1);

  return (
    <section id="reviews" className="reviews section">
      <div className="container">
        <div className="section-header">
          <p className="section-eyebrow">Testimonials</p>
          <h2 className="section-heading">What Our Clients <em>Say</em></h2>
        </div>

        <div className="reviews-carousel-wrap">
          <div
            className="reviews-track"
            ref={trackRef}
            onTouchStart={e => { touchStart.current = e.touches[0].clientX; }}
            onTouchEnd={e => {
              const delta = touchStart.current - e.changedTouches[0].clientX;
              if (Math.abs(delta) > 50) goTo(index + (delta > 0 ? 1 : -1));
            }}
          >
            {reviews.map((r, i) => (
              <div key={r.id} className="review-card fade-in visible" style={{ transitionDelay: `${(i % 3) * 0.08}s` }}>
                <div className="stars">{stars(r.rating)}</div>
                <p className="review-text">&ldquo;{r.review_text}&rdquo;</p>
                <div className="review-author">
                  {r.customer_image ? (
                    <>
                      <img
                        src={r.customer_image}
                        alt={r.customer_name}
                        className="author-avatar-img"
                        onError={e => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'flex'; }}
                      />
                      <div className="author-avatar" style={{ display: 'none' }}>{r.initials}</div>
                    </>
                  ) : (
                    <div className="author-avatar">{r.initials}</div>
                  )}
                  <div>
                    <strong>{r.customer_name}</strong>
                    <span>{r.location || ''}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="carousel-controls">
          <button className="carousel-btn" aria-label="Previous review" onClick={() => goTo(index - 1)}>&#8592;</button>
          <div className="carousel-dots" id="carouselDots">
            {Array.from({ length: dotCount }, (_, i) => (
              <div key={i} className={`dot${i === index ? ' active' : ''}`} onClick={() => goTo(i)}></div>
            ))}
          </div>
          <button className="carousel-btn" aria-label="Next review" onClick={() => goTo(index + 1)}>&#8594;</button>
        </div>
      </div>
    </section>
  );
}