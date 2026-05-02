import React from 'react';
import { Link } from 'react-router-dom';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaGithub, FaTwitter, FaLinkedin, FaFacebook, FaGlobe } from 'react-icons/fa';

const Contact = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-center mb-12 text-gray-800 dark:text-white">Contact Us</h1>
      <div className="grid md:grid-cols-2 gap-12">
        {/* Contact Information Cards */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex items-center gap-4">
            <FaEnvelope className="text-4xl text-purple-600" />
            <div><h3 className="text-xl font-bold dark:text-white">Email</h3><a href="mailto:dieumercin21@gmail.com" className="text-gray-600 dark:text-gray-300 hover:text-purple-600">dieumercin21@gmail.com</a></div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex items-center gap-4">
            <FaPhone className="text-4xl text-purple-600" />
            <div><h3 className="text-xl font-bold dark:text-white">Phone</h3><a href="tel:+250793516483" className="text-gray-600 dark:text-gray-300 hover:text-purple-600">+250 793 516 483</a></div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 flex items-center gap-4">
            <FaMapMarkerAlt className="text-4xl text-purple-600" />
            <div><h3 className="text-xl font-bold dark:text-white">Address</h3><p className="text-gray-600 dark:text-gray-300">Kigali, Rwanda</p></div>
          </div>
        </div>
        {/* Social Media Cards */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center mb-4 dark:text-white">Follow Us</h2>
          <div className="grid grid-cols-2 gap-4">
            <a href="https://www.linkedin.com/in/dieu-merci-niyonkuru-7725b1363/" target="_blank" rel="noopener noreferrer" className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 text-center hover:shadow-lg transition">
              <FaLinkedin className="text-4xl text-blue-600 mx-auto mb-2" />
              <span className="font-semibold">LinkedIn</span>
            </a>
            <a href="https://github.com/dieumerci-niyonkuru" target="_blank" rel="noopener noreferrer" className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 text-center hover:shadow-lg transition">
              <FaGithub className="text-4xl text-gray-800 dark:text-white mx-auto mb-2" />
              <span className="font-semibold">GitHub</span>
            </a>
            <a href="https://x.com/dieumercin21" target="_blank" rel="noopener noreferrer" className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 text-center hover:shadow-lg transition">
              <FaTwitter className="text-4xl text-sky-500 mx-auto mb-2" />
              <span className="font-semibold">Twitter (X)</span>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 text-center hover:shadow-lg transition">
              <FaFacebook className="text-4xl text-blue-700 mx-auto mb-2" />
              <span className="font-semibold">Facebook</span>
            </a>
          </div>
        </div>
      </div>
      {/* Embedded Google Map */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-center mb-4 dark:text-white">Our Location</h2>
        <div className="rounded-xl overflow-hidden shadow-lg">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d255203.55263329137!2d30.12724445!3d-1.9297706000000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dca4258ed8e797%3A0xf32b36a5411d0bc8!2sKigali!5e0!3m2!1sen!2srw!4v1777735106580!5m2!1sen!2srw"
            width="100%"
            height="400"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Rwanda Map"
            className="w-full"
          ></iframe>
        </div>
      </div>
      <div className="text-center mt-8"><Link to="/" className="text-purple-600 hover:underline">← Back to Home</Link></div>
    </div>
  );
};
export default Contact;
