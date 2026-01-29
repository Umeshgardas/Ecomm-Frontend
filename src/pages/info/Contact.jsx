import { useState } from "react";
import "./InfoPages.css";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Contact form:", form);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="page-container info-page">
      <div className="info-header">
        <h1>Contact Us</h1>
        <p>We'd love to hear from you</p>
      </div>

      <div className="contact-grid">
        <div className="contact-info">
          <h2>Get in Touch</h2>
          <div className="contact-methods">
            <div className="contact-method">
              <span className="contact-icon">📧</span>
              <div>
                <strong>Email</strong>
                <p>support@elevenbrothers.com</p>
              </div>
            </div>
            <div className="contact-method">
              <span className="contact-icon">📱</span>
              <div>
                <strong>Phone</strong>
                <p>+91 1234567890</p>
              </div>
            </div>
            <div className="contact-method">
              <span className="contact-icon">📍</span>
              <div>
                <strong>Address</strong>
                <p>123 Fashion Street, Mumbai, India</p>
              </div>
            </div>
          </div>
        </div>

        <div className="contact-form-wrapper">
          <h2>Send us a Message</h2>
          {submitted && (
            <div className="alert alert-success">Message sent successfully!</div>
          )}
          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Message</label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows="5"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary">Send Message</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;