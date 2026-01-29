import "./InfoPages.css";

const CareInstructions = () => {
  return (
    <div className="page-container info-page">
      <div className="info-header">
        <h1>Care Instructions</h1>
        <p>Keep your shirts looking their best</p>
      </div>

      <div className="info-content">
        <section className="info-section">
          <h2>Linen Shirts</h2>
          <ul className="info-list">
            <li>Machine wash cold with like colors</li>
            <li>Use mild detergent</li>
            <li>Tumble dry low or hang to dry</li>
            <li>Iron while slightly damp for best results</li>
            <li>Do not bleach</li>
          </ul>
        </section>

        <section className="info-section">
          <h2>Oxford Cotton Shirts</h2>
          <ul className="info-list">
            <li>Machine wash warm</li>
            <li>Tumble dry medium</li>
            <li>Iron on medium heat if needed</li>
            <li>Can be dry cleaned</li>
          </ul>
        </section>

        <section className="info-section">
          <h2>General Tips</h2>
          <ul className="info-list">
            <li>Always check care labels before washing</li>
            <li>Separate colors to prevent bleeding</li>
            <li>Button up shirts before washing to maintain shape</li>
            <li>Store on hangers to prevent wrinkles</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default CareInstructions;