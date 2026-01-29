import "./InfoPages.css";

const Sustainability = () => {
  return (
    <div className="page-container info-page">
      <div className="info-header">
        <h1>Sustainability</h1>
        <p>Our commitment to the planet</p>
      </div>

      <div className="info-content">
        <section className="info-section">
          <h2>Sustainable Materials</h2>
          <p>
            We prioritize natural, sustainable fibers like organic cotton and linen that are 
            biodegradable and have a lower environmental impact.
          </p>
        </section>

        <section className="info-section">
          <h2>Ethical Production</h2>
          <p>
            All our products are made in facilities that meet strict ethical standards, ensuring 
            fair wages and safe working conditions.
          </p>
        </section>

        <section className="info-section">
          <h2>Reducing Waste</h2>
          <p>
            We're committed to minimizing waste through efficient production processes and 
            eco-friendly packaging materials.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Sustainability;