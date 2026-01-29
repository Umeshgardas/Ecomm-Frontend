import "./InfoPages.css";

const OurStory = () => {
  return (
    <div className="page-container info-page">
      <div className="info-header">
        <h1>Our Story</h1>
        <p>The journey of Eleven Brothers</p>
      </div>

      <div className="info-content">
        <section className="info-section">
          <p className="lead-text">
            Eleven Brothers was born from a simple idea: create shirts that people actually want to wear, 
            every single day. Quality shouldn't be a luxury—it should be the standard.
          </p>
        </section>

        <section className="info-section">
          <h2>Where We Started</h2>
          <p>
            Founded in 2020, we began with a small collection of linen shirts. Our focus was clear: 
            premium materials, impeccable fit, and designs that stand the test of time.
          </p>
        </section>

        <section className="info-section">
          <h2>What Drives Us</h2>
          <p>
            We believe in doing things right. From sourcing the finest fabrics to ensuring ethical 
            production, every decision we make is guided by our commitment to quality and integrity.
          </p>
        </section>
      </div>
    </div>
  );
};

export default OurStory;