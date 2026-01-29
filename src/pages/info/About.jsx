import "./InfoPages.css";

const About = () => {
  return (
    <div className="page-container info-page">
      <div className="info-header">
        <h1>About Eleven Brothers</h1>
        <p>Quality shirts, crafted with care</p>
      </div>

      <div className="info-content">
        <section className="info-section">
          <h2>Our Story</h2>
          <p>
            Founded with a passion for quality craftsmanship and timeless style, Eleven Brothers 
            has been creating premium shirts that blend comfort with sophistication. Our journey 
            began with a simple belief: that everyone deserves to wear clothing that makes them 
            feel confident and comfortable.
          </p>
        </section>

        <section className="info-section">
          <h2>Our Mission</h2>
          <p>
            We're committed to delivering exceptional quality at fair prices. Every shirt is 
            carefully crafted from premium materials, designed to last, and made with attention 
            to every detail.
          </p>
        </section>

        <section className="info-section">
          <h2>Our Values</h2>
          <div className="values-grid">
            <div className="value-item">
              <span className="value-icon">✨</span>
              <h3>Quality First</h3>
              <p>We never compromise on materials or craftsmanship</p>
            </div>
            <div className="value-item">
              <span className="value-icon">🌱</span>
              <h3>Sustainability</h3>
              <p>Committed to ethical and sustainable practices</p>
            </div>
            <div className="value-item">
              <span className="value-icon">💯</span>
              <h3>Customer Satisfaction</h3>
              <p>Your happiness is our priority</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;