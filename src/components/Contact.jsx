import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CyberBreaker from './CyberBreaker';
import './Contact.css';

const Contact = () => {
  // 1. Form ka data yahan store hoga
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  // 2. Component load hotay hi localStorage se naam nikaal kar auto-fill karna
  useEffect(() => {
    const storedName = localStorage.getItem("visitorName");
    if (storedName) {
      setFormData((prev) => ({ ...prev, name: storedName }));
    }
  }, []);

  // 3. Inputs mein jo bhi type hoga wo state mein save hoga
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 4. Form Submit aur Validation Logic
  const handleSubmit = async (e) => {
    e.preventDefault();
    const visitorName = localStorage.getItem("visitorName");

    // Check agar kisi ne preloader bypass kiya ho
    if (!visitorName) {
      alert("Jani, please refresh kar ke preloader mein apna naam pehle enter karo!");
      return;
    }

    // Security check: Agar kisi ne form mein naam change karne ki koshish ki
    if (formData.name.toLowerCase() !== visitorName.toLowerCase()) {
      alert(`Jani, message bhejne ke liye wahi naam use karo jo start mein likha tha: ${visitorName}`);
      return;
    }

    // Backend ko data bhej rahe hain
    try {
      await axios.post('http://localhost:5000/api/contact', formData);
      alert('Message successfully sent to Zohaib!');
      
      // Form clear karo lekin Name wahi preloader wala rehne do
      setFormData({ name: visitorName, email: '', message: '' });
    } catch (error) {
      console.error("Error sending message:", error);
      alert('Kuch masla ho gaya jani, backend server check karo (is it running on port 5000?).');
    }
  };

  return (
    <section className="contact-section" id="contact">
      <div className="contact-header">
        <h2 className="contact-massive-title">
          Let's build <span className="accent">greatness.</span>
        </h2>
      </div>

      <div className="contact-container">
        
        {/* Left Side: The Form */}
        <div className="contact-form-side">
          <form className="glass-form" onSubmit={handleSubmit}>
            <p className="form-subtitle">Drop a message to discuss our next project.</p>
            
            <div className="input-group">
              <input 
                type="text" 
                id="name" 
                name="name" /* name attribute add kiya state binding ke liye */
                placeholder=" " 
                value={formData.name}
                onChange={handleChange}
                required 
              />
              <label htmlFor="name">Your Name</label>
              <div className="input-line"></div>
            </div>

            <div className="input-group">
              <input 
                type="email" 
                id="email" 
                name="email"
                placeholder=" " 
                value={formData.email}
                onChange={handleChange}
                required 
              />
              <label htmlFor="email">Email Address</label>
              <div className="input-line"></div>
            </div>

            <div className="input-group">
              <textarea 
                id="message" 
                name="message"
                rows="4" 
                placeholder=" " 
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>
              <label htmlFor="message">Project Details</label>
              <div className="input-line"></div>
            </div>

            <button type="submit" className="submit-btn">
              <span className="btn-text">Send Message</span>
              <div className="btn-glow"></div>
            </button>
          </form>
        </div>

        {/* Right Side: The Game */}
        <div className="contact-game-side">
          <CyberBreaker />
        </div>

      </div>

      {/* VIP Footer */}
      <footer className="vip-footer">
        <div className="footer-content">
          <p className="copyright">© 2026 Zohaib Hassan. All rights reserved.</p>
          <div className="footer-status">
            <div className="status-dot"></div>
            <span>Available for remote gigs</span>
          </div>
        </div>
      </footer>
    </section>
  );
};

export default Contact;