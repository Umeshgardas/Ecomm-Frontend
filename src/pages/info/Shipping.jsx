import "./InfoPages.css";

const Shipping = () => {
  return (
    <div className="page-container info-page">
      <div className="info-header">
        <h1>Shipping & Returns</h1>
        <p>Everything you need to know about delivery and returns</p>
      </div>

      <div className="info-content">
        <section className="info-section">
          <h2>Shipping Information</h2>
          <p><strong>Free Shipping:</strong> On all orders over ₹999</p>
          <p><strong>Standard Delivery:</strong> 5-7 business days (₹99)</p>
          <p><strong>Express Delivery:</strong> 2-3 business days (₹199)</p>
          <p>Orders are processed within 24 hours on business days.</p>
        </section>

        <section className="info-section">
          <h2>Return Policy</h2>
          <p>
            We offer a 30-day return policy on all unworn items with original tags attached. 
            Items must be in their original condition for a full refund.
          </p>
          <ul className="info-list">
            <li>Easy return process</li>
            <li>Full refund within 7-10 business days</li>
            <li>Free return pickup for defective items</li>
          </ul>
        </section>

        <section className="info-section">
          <h2>How to Return</h2>
          <ol className="info-list">
            <li>Contact our customer service team</li>
            <li>Receive your return authorization</li>
            <li>Pack the item securely</li>
            <li>Ship it back to us (we'll provide the label for defects)</li>
          </ol>
        </section>
      </div>
    </div>
  );
};

export default Shipping;