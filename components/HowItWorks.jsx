export default function HowItWorks() {
  return (
    <section id="how-it-works" className="how-it-works section">
      <div className="container">
        <div className="section-header">
          <p className="section-eyebrow">The Process</p>
          <h2 className="section-heading">From Choice to <em>Delivery</em></h2>
        </div>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-num">01</div>
            <div className="step-icon">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="24" cy="18" r="10" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M24 28v12M18 34h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M8 40c2-6 8-10 16-10s14 4 16 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <h3 className="step-title">Choose Your Fragrance</h3>
            <p className="step-desc">Browse our curated catalogue of ready-made, inspired, and bespoke fragrances. Select the one that speaks to you.</p>
          </div>
          <div className="step-connector"><div className="connector-line"></div></div>
          <div className="step-card">
            <div className="step-num">02</div>
            <div className="step-icon">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="8" y="6" width="32" height="36" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M16 16h16M16 23h16M16 30h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <h3 className="step-title">Submit Your Order</h3>
            <p className="step-desc">Fill in the order form with your details — fragrance choice, bottle size, quantity, and delivery address.</p>
          </div>
          <div className="step-connector"><div className="connector-line"></div></div>
          <div className="step-card">
            <div className="step-num">03</div>
            <div className="step-icon">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 24l10 10L40 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </div>
            <h3 className="step-title">We Handle the Rest</h3>
            <p className="step-desc">Our team contacts you via WhatsApp to confirm payment and arrange swift, elegant delivery to your door.</p>
          </div>
        </div>
      </div>
    </section>
  );
}