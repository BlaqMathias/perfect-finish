'use client';

export default function CustomBlend() {
  function handleBeginBlend() {
    // Pre-select Custom Blend in the order form dropdown
    const select = document.getElementById('fragrance');
    if (select) {
      for (let i = 0; i < select.options.length; i++) {
        if (select.options[i].value.startsWith('0|Custom Blend')) {
          select.selectedIndex = i;
          // Trigger the React onChange via a native event
          select.dispatchEvent(new Event('change', { bubbles: true }));
          break;
        }
      }
    }
  }

  return (
    <section id="custom-blend" className="custom-blend section">
      <div className="container custom-blend-grid">
        <div className="blend-visual">
          <div className="blend-img-placeholder">
            <div className="blend-orbs">
              <div className="orb orb--1"></div>
              <div className="orb orb--2"></div>
              <div className="orb orb--3"></div>
            </div>
            <img src="/images/p99.jpg" alt="Custom fragrance blend" className="blend-circle-img" />
          </div>
        </div>

        <div className="blend-content">
          <p className="section-eyebrow">Bespoke Service</p>
          <h2 className="section-heading">Craft Your Own <em>Signature</em></h2>
          <p className="blend-body">
            No two people are alike. Why should your fragrance be? Our master blenders work with you to combine the finest raw ingredients into a scent that belongs exclusively to you — unnamed, unbottled by anyone else.
          </p>
          <div className="blend-notes">
            <p className="notes-label">Available Notes</p>
            <div className="notes-grid">
              {['Vanilla','Oud','Citrus','Floral','Amber','Musk','Woody','Spice','Leather','Green'].map(note => (
                <span key={note} className="note-tag">{note}</span>
              ))}
            </div>
          </div>
          <a href="#order" className="btn btn-gold" onClick={handleBeginBlend}>Begin Your Blend</a>
        </div>
      </div>
    </section>
  );
}