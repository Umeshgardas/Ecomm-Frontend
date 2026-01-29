import "./InfoPages.css";

const SizeGuide = () => {
  return (
    <div className="page-container info-page">
      <div className="info-header">
        <h1>Size Guide</h1>
        <p>Find your perfect fit</p>
      </div>

      <div className="info-content">
        <section className="info-section">
          <h2>Men's Shirt Sizes</h2>
          <div className="size-table-wrapper">
            <table className="size-table">
              <thead>
                <tr>
                  <th>Size</th>
                  <th>Chest (inches)</th>
                  <th>Shoulder (inches)</th>
                  <th>Length (inches)</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>S</td><td>38</td><td>16</td><td>28</td></tr>
                <tr><td>M</td><td>40</td><td>17</td><td>29</td></tr>
                <tr><td>L</td><td>42</td><td>18</td><td>30</td></tr>
                <tr><td>XL</td><td>44</td><td>19</td><td>31</td></tr>
                <tr><td>XXL</td><td>46</td><td>20</td><td>32</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="info-section">
          <h2>How to Measure</h2>
          <ul className="info-list">
            <li><strong>Chest:</strong> Measure around the fullest part of your chest</li>
            <li><strong>Shoulder:</strong> Measure from one shoulder point to the other</li>
            <li><strong>Length:</strong> Measure from the highest point of shoulder to the hem</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default SizeGuide;