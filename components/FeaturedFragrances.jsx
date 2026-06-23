'use client';
import { useState, useEffect } from 'react';

const BOTTLE_CLASS = (name) => {
  const n = name.toLowerCase();
  if (n.includes('noir'))                           return 'noir-bottle';
  if (n.includes('rose'))                           return 'rose-bottle';
  if (n.includes('amber'))                          return 'amber-bottle';
  if (n.includes('citrus'))                         return 'citrus-bottle';
  if (n.includes('bois') || n.includes('wood') || n.includes('mysti')) return 'woody-bottle';
  if (n.includes('floral'))                         return 'floral-bottle';
  return 'noir-bottle';
};

function Skeleton() {
  return Array(6).fill(0).map((_, i) => (
    <div key={i} className="product-card product-skeleton">
      <div className="product-img-wrap skeleton-img"></div>
      <div className="product-info">
        <div className="skeleton-line short"></div>
        <div className="skeleton-line"></div>
        <div className="skeleton-line medium"></div>
        <div className="skeleton-line short"></div>
      </div>
    </div>
  ));
}

export default function FeaturedFragrances() {
  const [perfumes, setPerfumes] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(false);

  useEffect(() => {
    fetch('/api/perfumes')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setPerfumes(data);
          // Populate the order form dropdown
          populateSelect(data);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => {
        setLoading(false);
        // Signal preloader: products are done
        if (window.__pfSetProgress) window.__pfSetProgress(55);
        if (window.__pfSectionDone) window.__pfSectionDone();
      });
  }, []);

  function populateSelect(data) {
    const select = document.getElementById('fragrance');
    if (!select) return;
    select.innerHTML = '<option value="">— Choose a fragrance —</option>';
    data.forEach(p => {
      const price = Number(p.price);
      const label = price > 0
        ? `${p.perfume_name} — ₦${price.toLocaleString()}`
        : `${p.perfume_name} — To be quoted`;
      const opt = document.createElement('option');
      opt.value = `${p.id}|${p.perfume_name}|${price}`;
      opt.textContent = label;
      select.appendChild(opt);
    });
    const custom = document.createElement('option');
    custom.value = '0|Custom Blend|0';
    custom.textContent = 'Custom Blend (to be quoted)';
    select.appendChild(custom);
  }

  function selectProduct(id, name, price) {
    const select = document.getElementById('fragrance');
    if (select) {
      for (let i = 0; i < select.options.length; i++) {
        if (select.options[i].value.startsWith(`${id}|`)) {
          select.selectedIndex = i;
          select.dispatchEvent(new Event('change', { bubbles: true }));
          break;
        }
      }
    }
    document.getElementById('order')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (window.showToast) window.showToast(`✦  ${name} selected — complete your order below`);
  }

  return (
    <section id="fragrances" className="fragrances section">
      <div className="container">
        <div className="section-header">
          <p className="section-eyebrow">Our Collection</p>
          <h2 className="section-heading">Featured <em>Fragrances</em></h2>
          <p className="section-sub">Each scent is a chapter. Find the one that tells your story.</p>
        </div>

        <div className="products-grid" id="productsGrid">
          {loading && <Skeleton />}
          {error && <p className="load-error">Could not load fragrances. Please refresh the page.</p>}
          {!loading && !error && perfumes.map((p, i) => {
            const price      = Number(p.price);
            const priceLabel = price > 0 ? `₦${price.toLocaleString()}` : 'To be quoted';
            return (
              <div
                key={p.id}
                className="product-card fade-in visible"
                style={{ transitionDelay: `${(i % 3) * 0.08}s` }}
                data-id={p.id}
                data-name={p.perfume_name}
                data-price={price}
              >
                <div className="product-img-wrap">
                  <div className="product-img-placeholder">
                    {p.image_url ? (
                      <>
                        <img
                          src={p.image_url}
                          alt={p.perfume_name}
                          className="product-db-img"
                          onError={e => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'block'; }}
                        />
                        <div className={`product-bottle ${BOTTLE_CLASS(p.perfume_name)}`} style={{ display: 'none' }}></div>
                      </>
                    ) : (
                      <div className={`product-bottle ${BOTTLE_CLASS(p.perfume_name)}`}></div>
                    )}
                  </div>
                  {p.badge && <div className="product-badge">{p.badge}</div>}
                </div>
                <div className="product-info">
                  <p className="product-category">{p.category}</p>
                  <h3 className="product-name">{p.perfume_name}</h3>
                  <p className="product-desc">{p.description}</p>
                  <div className="product-footer">
                    <span className="product-price">{priceLabel}</span>
                    <button className="btn-select" onClick={() => selectProduct(p.id, p.perfume_name, price)}>
                      Select
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}