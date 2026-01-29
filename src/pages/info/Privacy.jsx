import "./InfoPages.css";

const Privacy = () => {
  return (
    <div className="page-container info-page">
      <div className="info-header">
        <h1>Privacy Policy</h1>
        <p>Last updated: January 2026</p>
      </div>

      <div className="info-content">
        <section className="info-section">
          <h2>Information We Collect</h2>
          <p>We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support.</p>
        </section>

        <section className="info-section">
          <h2>How We Use Your Information</h2>
          <ul className="info-list">
            <li>Process and fulfill your orders</li>
            <li>Send you order confirmations and updates</li>
            <li>Respond to your comments and questions</li>
            <li>Improve our products and services</li>
          </ul>
        </section>

        <section className="info-section">
          <h2>Information Security</h2>
          <p>We implement appropriate security measures to protect your personal information.</p>
        </section>
      </div>
    </div>
  );
};

export default Privacy;