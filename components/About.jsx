export default function About() {
  return (
    <section id="about" className="about section">
      <div className="container about-grid">
        <div className="about-img-wrap">
          <div className="about-img-placeholder">
            <img src="/images/p11.jpg" alt="Perfect Finish fragrance" />
          </div>
        </div>

        <div className="about-content">
          <p className="section-eyebrow">Our Story</p>
          <h2 className="section-heading">The Art of <em>Refined Scent</em></h2>
          <p className="about-body">
            Perfect Finish was born from a singular obsession — that fragrance is the most intimate luxury a person can carry. We source rare ingredients, collaborate with master perfumers, and bottle the result with meticulous care.
          </p>
          <p className="about-body">
            Whether you seek an iconic house scent, an inspired interpretation, or a wholly original blend crafted around your story, we bring that vision to life with precision and elegance.
          </p>
          <ul className="about-pillars">
            <li>
              <span className="pillar-icon">◆</span>
              <div>
                <strong>Authentic Sourcing</strong>
                <p>Every note traceable, every batch certified.</p>
              </div>
            </li>
            <li>
              <span className="pillar-icon">◆</span>
              <div>
                <strong>Bespoke Creation</strong>
                <p>Fragrances built around you, not the market.</p>
              </div>
            </li>
            <li>
              <span className="pillar-icon">◆</span>
              <div>
                <strong>White-Glove Service</strong>
                <p>Personal guidance from discovery to delivery.</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}