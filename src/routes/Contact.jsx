import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Check } from 'react-feather';
import { Link } from 'react-router-dom';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error

  // Ensure page starts at top when navigated to
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Very basic validation
    if (!formData.name || !formData.email || !formData.message) {
      alert('Please fill in all required fields.');
      return;
    }

    try {
      setStatus('submitting');
      // TODO: Integrate with backend / external service.
      // Simulate network latency
      await new Promise((res) => setTimeout(res, 1000));
      setStatus('success');
      // Reset form
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Contact form submission error:', error);
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-base-100 pt-16 pb-24">
      {/* Header */}
      <div className="hero bg-base-200/40 py-12">
        <div className="hero-content text-center flex-col">
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="max-w-xl text-base-content/70">
            We would love to hear from you! Whether you have a question about features, pricing, or anything else,
            our team is ready to answer all your questions.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 mt-12 max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Contact Information */}
        <div>
          <h2 className="text-2xl font-semibold mb-6">Get in Touch</h2>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <Mail size={20} className="text-primary mt-1" />
              <span>support@printapic.com</span>
            </li>
            <li className="flex items-start gap-3">
              <Phone size={20} className="text-primary mt-1" />
              <span>+1 (555) 123-4567</span>
            </li>
            <li className="flex items-start gap-3">
              <MapPin size={20} className="text-primary mt-1" />
              <span>
                123 Sticker Ave.<br />
                Imaginary City, CA 90210<br />
                United States
              </span>
            </li>
          </ul>

          <div className="mt-8">
            <Link to="/" className="btn btn-outline gap-2">
              Back to Home
            </Link>
          </div>
        </div>

        {/* Contact Form */}
        <div>
          <h2 className="text-2xl font-semibold mb-6">Send Us a Message</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Name</span>
              </label>
              <input
                name="name"
                type="text"
                placeholder="Your name"
                className="input input-bordered"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                className="input input-bordered"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Message</span>
              </label>
              <textarea
                name="message"
                rows="5"
                className="textarea textarea-bordered"
                placeholder="How can we help you?"
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <button
              type="submit"
              className={`btn btn-primary gap-2 ${status === 'submitting' ? 'loading' : ''}`}
              disabled={status === 'submitting'}
            >
              {status === 'success' ? <Check size={18} /> : 'Send Message'}
            </button>

            {status === 'success' && (
              <p className="text-success mt-2">Thank you for reaching out! We will get back to you soon.</p>
            )}
            {status === 'error' && (
              <p className="text-error mt-2">Oops! Something went wrong. Please try again later.</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact; 