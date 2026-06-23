/* =============================================================
   PERFECT FINISH — script.js
   Full backend integration: perfumes, reviews, order submit
   ============================================================= */

/* ── HERO — Entrance animations & particle canvas ─────────── */
(function initHero() {
  const heroAnims = document.querySelectorAll('[data-hero-anim]');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      heroAnims.forEach(el => el.classList.add('hero-visible'));
    });
  });

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
      x:  Math.random() * W,
      y:  Math.random() * H,
      r:  Math.random() * 1.4 + 0.3,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18 - 0.06,
      a:  Math.random(),
      da: (Math.random() * 0.003 + 0.001) * (Math.random() < 0.5 ? 1 : -1),
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: COUNT }, mkParticle);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(201,168,76,' + (p.a * 0.55) + ')';
      ctx.fill();
      p.x += p.vx;
      p.y += p.vy;
      p.a += p.da;
      if (p.a > 1)  { p.a = 1;  p.da *= -1; }
      if (p.a < 0)  { p.a = 0;  p.da *= -1; }
      if (p.x < -5) p.x = W + 5;
      if (p.x > W + 5) p.x = -5;
      if (p.y < -5) p.y = H + 5;
      if (p.y > H + 5) p.y = -5;
    });
    requestAnimationFrame(draw);
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reducedMotion) {
    init();
    draw();
    window.addEventListener('resize', function () {
      resize();
      particles.forEach(function (p) {
        if (p.x > W) p.x = Math.random() * W;
        if (p.y > H) p.y = Math.random() * H;
      });
    });
  }
})();

/* ── STATE ─────────────────────────────────────────────────── */
let qty           = 1;
let selectedSize  = '30ml';
let sizeMult      = 1;
let basePrice     = 0;
let carouselIndex = 0;
let selectedPerfumeId = null;  // set when products load from DB

const SIZE_MULTIPLIERS = { '30ml': 1.0, '50ml': 1.5, '100ml': 2.2 };

/* ── NAVBAR ────────────────────────────────────────────────── */
const navbar    = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
  updateActiveNavLink();
});

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});

navLinks.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  });
});

document.addEventListener('click', (e) => {
  if (!navbar.contains(e.target)) {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  }
});

function updateActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  const scrollY  = window.scrollY + 100;
  sections.forEach(section => {
    const id   = section.getAttribute('id');
    const link = document.querySelector('.nav-link[href="#' + id + '"]');
    if (link) {
      const inView = scrollY >= section.offsetTop && scrollY < section.offsetTop + section.offsetHeight;
      if (inView) {
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
    }
  });
}

/* ── SCROLL ANIMATIONS ─────────────────────────────────────── */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

function observeFadeTargets() {
  document.querySelectorAll(
    '.step-card, .product-card, .why-card, .review-card, .about-grid, .custom-blend-grid, .wa-inner'
  ).forEach((el, i) => {
    if (!el.classList.contains('fade-in')) {
      el.classList.add('fade-in');
      el.style.transitionDelay = (i % 4 * 0.08) + 's';
      observer.observe(el);
    }
  });
}

/* ── LOAD PRODUCTS FROM DATABASE ───────────────────────────── */
async function loadProducts() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  // Show skeleton placeholders while loading
  grid.innerHTML = Array(6).fill(0).map(() => `
    <div class="product-card product-skeleton">
      <div class="product-img-wrap skeleton-img"></div>
      <div class="product-info">
        <div class="skeleton-line short"></div>
        <div class="skeleton-line"></div>
        <div class="skeleton-line medium"></div>
        <div class="skeleton-line short"></div>
      </div>
    </div>
  `).join('');

  try {
    const res  = await fetch('php/api/get_perfumes.php');
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      grid.innerHTML = '<p class="load-error">No fragrances available at the moment.</p>';
      return;
    }

    // Bottle colour classes by perfume name keyword
    const bottleClass = (name) => {
      const n = name.toLowerCase();
      if (n.includes('noir'))    return 'noir-bottle';
      if (n.includes('rose'))    return 'rose-bottle';
      if (n.includes('amber'))   return 'amber-bottle';
      if (n.includes('citrus'))  return 'citrus-bottle';
      if (n.includes('bois') || n.includes('wood') || n.includes('mysti')) return 'woody-bottle';
      if (n.includes('floral'))  return 'floral-bottle';
      return 'noir-bottle';
    };

    grid.innerHTML = data.map(p => {
      const price      = Number(p.price);
      const priceLabel = price > 0 ? '\u20a6' + price.toLocaleString() : 'To be quoted';
      const badge      = p.badge ? `<div class="product-badge">${p.badge}</div>` : '';
      const imgHtml    = p.image_url
        ? `<img src="${p.image_url}" alt="${p.perfume_name}" class="product-db-img"
               onerror="this.style.display='none';this.nextElementSibling.style.display='block'" />
           <div class="product-bottle ${bottleClass(p.perfume_name)}" style="display:none"></div>`
        : `<div class="product-bottle ${bottleClass(p.perfume_name)}"></div>`;

      // No fade-in class here — observeFadeTargets() adds it after injection
      // so the IntersectionObserver fires correctly on freshly rendered cards
      return `
        <div class="product-card" data-id="${p.id}" data-name="${p.perfume_name}" data-price="${price}">
          <div class="product-img-wrap">
            <div class="product-img-placeholder">${imgHtml}</div>
            ${badge}
          </div>
          <div class="product-info">
            <p class="product-category">${p.category}</p>
            <h3 class="product-name">${p.perfume_name}</h3>
            <p class="product-desc">${p.description}</p>
            <div class="product-footer">
              <span class="product-price">${priceLabel}</span>
              <button class="btn-select" onclick="selectProduct(${p.id}, '${p.perfume_name}', ${price})">Select</button>
            </div>
          </div>
        </div>`;
    }).join('');

    // Populate the fragrance select dropdown
    populateFragranceSelect(data);

    // Force all newly rendered product cards visible immediately,
    // then attach observer for any that are off-screen
    const cards = grid.querySelectorAll('.product-card');
    cards.forEach((card, i) => {
      card.classList.add('fade-in');
      card.style.transitionDelay = (i % 3 * 0.08) + 's';
      // Use a tiny timeout so the browser registers the fade-in class
      // before we add visible — otherwise the transition is skipped
      setTimeout(() => card.classList.add('visible'), 50);
    });

  } catch (err) {
    grid.innerHTML = '<p class="load-error">Could not load fragrances. Please refresh the page.</p>';
    console.error('loadProducts error:', err);
  }
}

/* ── POPULATE FRAGRANCE SELECT DROPDOWN ────────────────────── */
function populateFragranceSelect(perfumes) {
  const select = document.getElementById('fragrance');
  if (!select) return;

  // Keep the first placeholder option
  select.innerHTML = '<option value="">— Choose a fragrance —</option>';

  perfumes.forEach(p => {
    const price = Number(p.price);
    const label = price > 0
      ? p.perfume_name + ' \u2014 \u20a6' + price.toLocaleString()
      : p.perfume_name + ' \u2014 To be quoted';
    const opt   = document.createElement('option');
    opt.value   = p.id + '|' + p.perfume_name + '|' + price;
    opt.textContent = label;
    select.appendChild(opt);
  });

  // Add Custom Blend at the end
  const custom = document.createElement('option');
  custom.value       = '0|Custom Blend|0';
  custom.textContent = 'Custom Blend (to be quoted)';
  select.appendChild(custom);
}

/* ── LOAD REVIEWS FROM DATABASE ────────────────────────────── */
async function loadReviews() {
  const track = document.getElementById('reviewsTrack');
  if (!track) return;

  try {
    const res  = await fetch('php/api/get_reviews.php');
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) return; // keep static fallback

    const stars = (n) => '\u2605'.repeat(n) + '\u2606'.repeat(5 - n);

    track.innerHTML = data.map(r => {
      const avatarHtml = r.customer_image
        ? `<img src="${r.customer_image}" alt="${r.customer_name}" class="author-avatar-img"
               onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" />
           <div class="author-avatar" style="display:none">${r.initials}</div>`
        : `<div class="author-avatar">${r.initials}</div>`;

      return `
        <div class="review-card">
          <div class="stars">${stars(r.rating)}</div>
          <p class="review-text">&ldquo;${r.review_text}&rdquo;</p>
          <div class="review-author">
            ${avatarHtml}
            <div>
              <strong>${r.customer_name}</strong>
              <span>${r.location || ''}</span>
            </div>
          </div>
        </div>`;
    }).join('');

    // Rebuild carousel with new cards
    carouselIndex = 0;
    buildDots();
    goToSlide(0);

    // Force review cards visible immediately
    track.querySelectorAll('.review-card').forEach((card, i) => {
      card.classList.add('fade-in');
      card.style.transitionDelay = (i % 3 * 0.08) + 's';
      setTimeout(() => card.classList.add('visible'), 50);
    });

  } catch (err) {
    // Silently keep the static HTML fallback already in the DOM
    console.warn('loadReviews error — using static fallback:', err);
  }
}

/* ── SIZE SELECTOR ─────────────────────────────────────────── */
function selectSize(btn) {
  document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  selectedSize = btn.dataset.size;
  sizeMult     = parseFloat(btn.dataset.mult);
  updateSummary();
}

/* ── QUANTITY ───────────────────────────────────────────────── */
function changeQty(delta) {
  qty = Math.max(1, Math.min(20, qty + delta));
  document.getElementById('qtyDisplay').textContent = qty;
  updateSummary();
}

/* ── PRODUCT SELECT (from cards) ───────────────────────────── */
function selectProduct(id, name, price) {
  selectedPerfumeId = id;
  basePrice         = price;

  // Sync the dropdown
  const select = document.getElementById('fragrance');
  for (let i = 0; i < select.options.length; i++) {
    if (select.options[i].value.startsWith(id + '|')) {
      select.selectedIndex = i;
      break;
    }
  }

  updateSummary();
  document.getElementById('order').scrollIntoView({ behavior: 'smooth', block: 'start' });
  showToast('\u2756  ' + name + ' selected \u2014 complete your order below');
}

/* ── CUSTOM BLEND PRESET ───────────────────────────────────── */
function setCustomBlend() {
  selectedPerfumeId = 0;
  basePrice         = 0;

  const select = document.getElementById('fragrance');
  for (let i = 0; i < select.options.length; i++) {
    if (select.options[i].value.startsWith('0|Custom Blend')) {
      select.selectedIndex = i;
      break;
    }
  }
  updateSummary();
}

/* ── ORDER SUMMARY ─────────────────────────────────────────── */
function updateSummary() {
  const select = document.getElementById('fragrance');
  const val    = select.value;

  let name  = '\u2014';
  let price = 0;
  let pid   = null;

  if (val) {
    const parts = val.split('|');
    pid   = parseInt(parts[0]) || null;
    name  = parts[1] || '\u2014';
    price = parseFloat(parts[2]) || 0;
    basePrice         = price;
    selectedPerfumeId = pid;
  }

  const total = Math.round(basePrice * sizeMult * qty);

  document.getElementById('sumFragrance').textContent = name;
  document.getElementById('sumSize').textContent      = selectedSize;
  document.getElementById('sumQty').textContent       = qty;
  document.getElementById('sumTotal').textContent     = total > 0
    ? '\u20a6' + total.toLocaleString()
    : 'To be quoted';
}

/* ── ORDER FORM SUBMIT → PHP BACKEND ──────────────────────── */
async function handleOrderSubmit(e) {
  e.preventDefault();

  const fragranceVal = document.getElementById('fragrance').value;
  if (!fragranceVal) {
    showToast('Please select a fragrance to continue.');
    document.getElementById('fragrance').focus();
    return;
  }

  const parts       = fragranceVal.split('|');
  const perfumeId   = parseInt(parts[0]) || 0;
  const perfumeName = parts[1] || '';
  const price       = parseFloat(parts[2]) || 0;
  const total       = Math.round(price * sizeMult * qty);

  const payload = {
    perfume_id:   perfumeId > 0 ? perfumeId : null,
    perfume_name: perfumeName,
    bottle_size:  selectedSize,
    quantity:     qty,
    first_name:   document.getElementById('firstName').value.trim(),
    last_name:    document.getElementById('lastName').value.trim(),
    phone:        document.getElementById('phone').value.trim(),
    email:        document.getElementById('email').value.trim(),
    address:      document.getElementById('address').value.trim(),
    notes:        document.getElementById('notes').value.trim(),
    total_amount: total,
  };

  // Disable submit button and show loading state
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalBtnHtml = submitBtn.innerHTML;
  submitBtn.disabled   = true;
  submitBtn.innerHTML  = '<span>Processing\u2026</span>';

  try {
    const res  = await fetch('php/api/create_order.php', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });

    const result = await res.json();

    if (result.success) {
      showOrderSuccess(result);
    } else {
      showToast(result.message || 'Something went wrong. Please try again.');
      submitBtn.disabled  = false;
      submitBtn.innerHTML = originalBtnHtml;
    }

  } catch (err) {
    showToast('Connection error. Please check your internet and try again.');
    submitBtn.disabled  = false;
    submitBtn.innerHTML = originalBtnHtml;
    console.error('Order submit error:', err);
  }
}

/* ── ORDER SUCCESS STATE ───────────────────────────────────── */
function showOrderSuccess(result) {
  const waNumber = result.wa_number || '2347084657676';
  const total    = result.total_amount > 0
    ? '\u20a6' + Number(result.total_amount).toLocaleString()
    : 'To be quoted';

  // Build the WhatsApp message
  const waMessage = [
    'Hello Perfect Finish! \u2728',
    '',
    'New Order Received',
    'Reference: ' + result.order_reference,
    '',
    'Fragrance : ' + result.fragrance,
    'Size      : ' + result.bottle_size,
    'Quantity  : ' + result.quantity,
    'Total     : ' + total,
    '',
    'Customer Details',
    'Name    : ' + result.first_name + ' ' + result.last_name,
    'Phone   : ' + result.phone,
    'Address : ' + result.address,
    result.notes ? 'Notes   : ' + result.notes : '',
  ].filter(Boolean).join('\n');

  const waUrl = 'https://wa.me/' + waNumber + '?text=' + encodeURIComponent(waMessage);

  // Replace form with success card
  document.getElementById('orderForm').innerHTML = `
    <div class="order-success">
      <div class="success-icon">\u2756</div>
      <h3>Order Confirmed</h3>
      <p class="success-ref">Order Reference: <strong>${result.order_reference}</strong></p>
      <p>Thank you, <strong>${result.first_name}</strong>.
         Your order for <em>${result.fragrance}</em> has been received.</p>
      <p class="success-note">
        Our team will contact you on <strong>${result.phone}</strong>
        within a few hours to confirm payment and arrange delivery.
      </p>
      <div class="success-actions">
        <a href="${waUrl}" target="_blank" rel="noopener" class="btn btn-wa">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
          Send Order via WhatsApp
        </a>
        <button onclick="location.reload()" class="btn btn-outline">Place Another Order</button>
      </div>
    </div>
  `;

  // Highlight the order summary panel
  const summary = document.getElementById('orderSummary');
  if (summary) summary.style.borderColor = 'rgba(201,168,76,0.5)';

  // Auto-open WhatsApp after a short delay
  setTimeout(() => { window.open(waUrl, '_blank'); }, 1200);
}

/* ── CAROUSEL ───────────────────────────────────────────────── */
function getReviewsVisible() {
  if (window.innerWidth <= 768)  return 1;
  if (window.innerWidth <= 1024) return 2;
  return 3;
}

function buildDots() {
  const track  = document.getElementById('reviewsTrack');
  if (!track) return;
  const cards  = track.querySelectorAll('.review-card');
  const dotsEl = document.getElementById('carouselDots');
  const total  = Math.max(1, cards.length - getReviewsVisible() + 1);
  dotsEl.innerHTML = '';
  for (let i = 0; i < total; i++) {
    const dot = document.createElement('div');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goToSlide(i));
    dotsEl.appendChild(dot);
  }
}

function goToSlide(index) {
  const track = document.getElementById('reviewsTrack');
  if (!track) return;
  const cards   = track.querySelectorAll('.review-card');
  const visible = getReviewsVisible();
  carouselIndex = Math.max(0, Math.min(cards.length - visible, index));

  const cardWidth = cards[0] ? cards[0].offsetWidth + 24 : 0;
  track.style.transform = 'translateX(-' + (carouselIndex * cardWidth) + 'px)';

  document.querySelectorAll('.dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === carouselIndex);
  });
}

document.getElementById('prevBtn').addEventListener('click', () => goToSlide(carouselIndex - 1));
document.getElementById('nextBtn').addEventListener('click', () => goToSlide(carouselIndex + 1));

let touchStartX = 0;
const reviewTrack = document.getElementById('reviewsTrack');
reviewTrack.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
reviewTrack.addEventListener('touchend', (e) => {
  const delta = touchStartX - e.changedTouches[0].clientX;
  if (Math.abs(delta) > 50) goToSlide(carouselIndex + (delta > 0 ? 1 : -1));
});

window.addEventListener('resize', () => {
  carouselIndex = 0;
  buildDots();
  goToSlide(0);
});

/* ── TOAST ──────────────────────────────────────────────────── */
let toastTimer;
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3800);
}

/* ── SKELETON + SUCCESS STYLES (injected once) ─────────────── */
const injectedStyle = document.createElement('style');
injectedStyle.textContent = `
  /* Skeleton loader */
  .product-skeleton { pointer-events: none; }
  .skeleton-img {
    background: linear-gradient(90deg, #1a1a1a 25%, #222 50%, #1a1a1a 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
    min-height: 220px;
    border-radius: 4px;
  }
  .skeleton-line {
    height: 12px;
    border-radius: 6px;
    background: linear-gradient(90deg, #1a1a1a 25%, #222 50%, #1a1a1a 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
    margin: 10px 0;
  }
  .skeleton-line.short  { width: 40%; }
  .skeleton-line.medium { width: 70%; }
  @keyframes shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  /* Product image from DB */
  .product-db-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    border-radius: 4px;
  }

  /* Load error message */
  .load-error {
    grid-column: 1 / -1;
    text-align: center;
    color: var(--muted);
    padding: 48px 0;
    font-size: 0.9rem;
  }

  /* Order success */
  .order-success {
    text-align: center;
    padding: 48px 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }
  .success-icon {
    font-size: 2.5rem;
    color: var(--gold);
    margin-bottom: 4px;
  }
  .order-success h3 {
    font-family: var(--font-display);
    font-size: 2rem;
    font-weight: 400;
    color: var(--off-white);
  }
  .success-ref {
    font-size: 0.8rem !important;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--gold) !important;
    background: rgba(201,168,76,0.08);
    border: 1px solid rgba(201,168,76,0.2);
    border-radius: 4px;
    padding: 8px 20px;
  }
  .success-ref strong { color: var(--gold-light); font-weight: 600; }
  .order-success p {
    color: var(--muted-light);
    font-size: 0.92rem;
    line-height: 1.65;
    max-width: 380px;
  }
  .order-success strong { color: var(--off-white); font-weight: 500; }
  .order-success em     { font-style: italic; color: var(--gold-light); }
  .success-note {
    font-size: 0.84rem !important;
    color: var(--muted) !important;
    max-width: 360px !important;
  }
  .success-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    justify-content: center;
    margin-top: 8px;
  }
`;
document.head.appendChild(injectedStyle);

/* ── LUXURY LOADER ──────────────────────────────────────────── */
(function initLoader() {
  const loader  = document.getElementById('pf-loader');
  const bar     = document.getElementById('pfLoaderBar');
  const pct     = document.getElementById('pfLoaderPct');
  if (!loader) return;

  // Lock scroll immediately
  document.body.classList.add('pf-loading');

  let progress = 0;

  function setProgress(value) {
    progress = Math.min(100, Math.max(progress, value));
    bar.style.width = progress + '%';
    pct.textContent = Math.round(progress) + '%';
  }

  function hideLoader() {
    setProgress(100);
    // Small delay so the 100% renders visibly before fade
    setTimeout(() => {
      loader.classList.add('pf-loader--hidden');
      document.body.classList.remove('pf-loading');
      // Remove from DOM after transition to free memory
      loader.addEventListener('transitionend', () => loader.remove(), { once: true });
    }, 350);
  }

  // Safety net: never hang longer than 8 seconds
  const safetyTimeout = setTimeout(hideLoader, 8000);

  // Wait for DOM + dynamic data + images
  window._pfLoaderReady = function(resolvedPromises) {
    clearTimeout(safetyTimeout);

    // Wait for images currently in the page (includes dynamically added ones)
    const waitForImages = () => new Promise(resolve => {
      const imgs = Array.from(document.images);
      if (imgs.length === 0) return resolve();

      let loaded = 0;
      const total = imgs.length;

      function onSettled() {
        loaded++;
        // Update progress from 70 → 98 as images load
        setProgress(70 + Math.round((loaded / total) * 28));
        if (loaded >= total) resolve();
      }

      imgs.forEach(img => {
        if (img.complete) {
          onSettled();
        } else {
          img.addEventListener('load',  onSettled, { once: true });
          img.addEventListener('error', onSettled, { once: true }); // fail safely
        }
      });
    });

    waitForImages().then(hideLoader);
  };

  // Expose progress updater for use during fetch calls
  window._pfSetProgress = setProgress;

  // Animate progress to 15% quickly on script start (before fetches)
  requestAnimationFrame(() => {
    setProgress(10);
    setTimeout(() => setProgress(20), 200);
  });
})();

/* ── INIT ───────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  // Tick progress: DOM is ready
  if (window._pfSetProgress) window._pfSetProgress(30);

  // Run both fetches in parallel; track progress as each resolves
  const productsPromise = loadProducts().then(() => {
    if (window._pfSetProgress) window._pfSetProgress(55);
  }).catch(() => {
    if (window._pfSetProgress) window._pfSetProgress(55);
  });

  const reviewsPromise = loadReviews().then(() => {
    if (window._pfSetProgress) window._pfSetProgress(70);
  }).catch(() => {
    if (window._pfSetProgress) window._pfSetProgress(70);
  });

  // Wait for both before handing off to image waiter
  await Promise.allSettled([productsPromise, reviewsPromise]);

  // Initial UI state
  buildDots();
  updateSummary();
  updateActiveNavLink();
  observeFadeTargets();

  // Signal loader to wait for images then hide
  if (window._pfLoaderReady) window._pfLoaderReady();
});
