import "./InfoPages.css";

const Terms = () => {
  return (
    <div className="page-container info-page">
      <div className="info-header">
        <h1>Terms & Conditions</h1>
        <p>Last updated: January 2026</p>
      </div>

      <div className="info-content">
        <section className="info-section">
          <h2>Use of Website</h2>
          <p>By accessing our website, you agree to these terms and conditions.</p>
        </section>

        <section className="info-section">
          <h2>Product Information</h2>
          <p>We strive to ensure product descriptions and prices are accurate, but errors may occur.</p>
        </section>

        <section className="info-section">
          <h2>Limitation of Liability</h2>
          <p>We are not liable for any indirect or consequential damages arising from use of our website.</p>
        </section>
      </div>
    </div>
  );
};

export default Terms;