import { useState } from "react";
import "./InfoPages.css";

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    { q: "What is your return policy?", a: "We offer a 30-day return policy on all unworn items with original tags." },
    { q: "How long does shipping take?", a: "Standard shipping takes 5-7 business days. Express shipping takes 2-3 business days." },
    { q: "Do you ship internationally?", a: "Currently, we only ship within India." },
    { q: "How do I track my order?", a: "You'll receive a tracking number via email once your order ships." },
    { q: "What payment methods do you accept?", a: "We accept all major credit cards, debit cards, UPI, and cash on delivery." },
  ];

  return (
    <div className="page-container info-page">
      <div className="info-header">
        <h1>Frequently Asked Questions</h1>
        <p>Find answers to common questions</p>
      </div>

      <div className="info-content">
        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div key={index} className="faq-item">
              <button
                className="faq-question"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                {faq.q}
                <span className="faq-icon">{openIndex === index ? "−" : "+"}</span>
              </button>
              {openIndex === index && (
                <div className="faq-answer">{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;