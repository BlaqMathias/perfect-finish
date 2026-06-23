export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <div className="footer-logo">
            <span className="logo-pf">PF</span>
            <span>Perfect Finish</span>
          </div>
          <p className="footer-tagline">Luxury fragrances and custom scent blends for those who understand that scent is identity.</p>
        </div>

        <div className="footer-col">
          <h4 className="footer-col-title">Quick Links</h4>
          <ul className="footer-links">
            <li><a href="#home">Home</a></li>
            <li><a href="#fragrances">Fragrances</a></li>
            <li><a href="#about">About Us</a></li>
            <li><a href="#custom-blend">Custom Blend</a></li>
            <li><a href="#order">Order Now</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-col-title">Collections</h4>
          <ul className="footer-links">
            <li><a href="#fragrances">Eau de Parfum</a></li>
            <li><a href="#fragrances">Extrait de Parfum</a></li>
            <li><a href="#fragrances">Eau de Toilette</a></li>
            <li><a href="#custom-blend">Bespoke Blends</a></li>
            <li><a href="#fragrances">Gift Sets</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-col-title">Contact</h4>
          <ul className="footer-links footer-contact">
            <li>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 11a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .18L5 0a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14z"/>
              </svg>
              +234 708 465 7676
            </li>
            <li>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              Inyangpeace07@gmail.com
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>&copy; 2025 Perfect Finish. All rights reserved.</p>
          <p>Crafted with care for luxury fragrance lovers.</p>
        </div>
      </div>
    </footer>
  );
}