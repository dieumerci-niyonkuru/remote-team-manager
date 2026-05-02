import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTasks, FaComments, FaShieldAlt, FaChartLine, FaRobot, FaCloudUploadAlt,
  FaArrowRight, FaBars, FaTimes, FaChevronDown, FaCalendarAlt, FaVideo, FaGlobe,
  FaNewspaper, FaHeadset
} from 'react-icons/fa';

const Landing = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [featuresDropdown, setFeaturesDropdown] = useState(false);
  const [pricingDropdown, setPricingDropdown] = useState(false);
  const [resourcesDropdown, setResourcesDropdown] = useState(false);
  const [currentHeroImageIndex, setCurrentHeroImageIndex] = useState(0);
  const featuresRef = useRef(null);
  const pricingRef = useRef(null);
  const galleryRef = useRef(null);
  const contactRef = useRef(null);

  const scrollTo = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
    setFeaturesDropdown(false);
    setPricingDropdown(false);
    setResourcesDropdown(false);
  };

  // Array of hero background images
  const heroImages = [
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&h=900&fit=crop",
    "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1600&h=900&fit=crop",
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&h=900&fit=crop",
    "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1600&h=900&fit=crop",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  const galleryItems = [
    { img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=300&fit=crop", title: "Collaborative Workspace", desc: "Teams working together seamlessly." },
    { img: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop", title: "Agile Meetings", desc: "Daily stand-ups and sprint planning." },
    { img: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop", title: "Remote Office", desc: "Work from anywhere, stay connected." },
    { img: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&h=300&fit=crop", title: "Brainstorming", desc: "Share ideas in real‑time." },
    { img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400https://images.unsplash.com/phone-photo-team-meeting.jpgh=300https://images.unsplash.com/phone-photo-team-meeting.jpgfit=crop", title: "Team Meeting", desc: "Discuss strategy with your team." },
    { img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop", title: "Team Building", desc: "Strengthen team culture." }
  ];

  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Header (unchanged) */}
      {/* ... header code remains the same ... */}
      {/* Your header JSX stays exactly as it was in your previous version, so we've omitted it for brevity */}

      {/* Hero Section with Rotating Images */}
      <section className="relative pt-24 pb-16 overflow-hidden h-screen flex items-center justify-center text-center">
        <div className="absolute inset-0 w-full h-full">
          {heroImages.map((img, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${
                idx === currentHeroImageIndex ? 'opacity-100 z-0' : 'opacity-0 z-0'
              }`}
              style={{
                backgroundImage: `url(${img})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            ></div>
          ))}
          <div className="absolute inset-0 bg-black bg-opacity-50 z-10"></div>
        </div>
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
          <motion.h1
            key={currentHeroImageIndex}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold mb-6 drop-shadow-lg"
          >
            Your Gateway to Effortless Remote Collaboration
          </motion.h1>
          <motion.p
            key={currentHeroImageIndex + 1}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-gray-200 max-w-3xl mx-auto mb-8 drop-shadow-md"
          >
            The all‑in‑one hub for project management, real-time chat, HR, and AI. Trusted by teams worldwide.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex justify-center gap-4 flex-wrap"
          >
            <Link
              to="/register"
              className="bg-purple-600 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:bg-purple-700 transition"
            >
              Start Free Trial <FaArrowRight className="inline ml-2" />
            </Link>
            <button
              onClick={() => scrollTo(featuresRef)}
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition"
            >
              Explore Features
            </button>
          </motion.div>
        </div>
      </section>

      {/* New Section: Large Image for Remote Team Management */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-6 text-gray-800 dark:text-white">
              Manage Remote Teams with Confidence
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
              Our platform provides everything you need to lead a successful remote team.
              From daily tasks to long-term goals, keep everyone aligned and productive.
            </p>
            <Link
              to="/register"
              className="bg-purple-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-purple-700 transition inline-block"
            >
              Get Started
            </Link>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-xl">
            <img
              src="https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=600&fit=crop"
              alt="Remote Team Management"
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      </section>

      {/* Features Grid (with updated visuals) */}
      <section ref={featuresRef} className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gray-800 dark:text-white">Powerful Features</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">Everything your remote team needs</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Task Management", desc: "Kanban, subtasks, deadlines, progress tracking", icon: "📋", img: "https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=400&h=200&fit=crop" },
              { title: "Real‑time Chat", desc: "Channels, mentions, reactions, file sharing", icon: "💬", img: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&h=200&fit=crop" },
              { title: "2FA & Security", desc: "Two-factor authentication, data encryption", icon: "🔐", img: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&h=200&fit=crop" },
              { title: "Analytics & OKRs", desc: "Burn-down charts, team goals, productivity", icon: "📊", img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop" },
              { title: "AI Assistant", desc: "Smart suggestions, meeting summaries, predictions", icon: "🤖", img: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=200&fit=crop" },
              { title: "File Storage", desc: "Upload, versioning, auto-organize", icon: "☁️", img: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=200&fit=crop" }
            ].map((f, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition transform hover:-translate-y-1">
                <img src={f.img} alt={f.title} className="w-full h-32 object-cover" />
                <div className="p-6 text-center">
                  <div className="text-4xl mb-3">{f.icon}</div>
                  <h3 className="text-xl font-bold mb-2 dark:text-white">{f.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery with descriptions */}
      <section ref={galleryRef} className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white">Our Workspace Gallery</h2>
            <p className="text-gray-600 dark:text-gray-300">See how teams collaborate with RTM</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryItems.map((item, idx) => (
              <div key={idx} className="bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden shadow hover:shadow-lg transition">
                <img src={item.img} alt={item.title} className="w-full h-48 object-cover" />
                <div className="p-4">
                  <h3 className="text-lg font-bold mb-1 dark:text-white">{item.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-purple-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-8 text-center">
          <div><div className="text-5xl font-bold text-purple-600">10k+</div><p className="text-gray-700 dark:text-gray-300">Active Teams</p></div>
          <div><div className="text-5xl font-bold text-purple-600">500k+</div><p className="text-gray-700 dark:text-gray-300">Tasks Completed</p></div>
          <div><div className="text-5xl font-bold text-purple-600">99.9%</div><p className="text-gray-700 dark:text-gray-300">Uptime</p></div>
        </div>
      </section>

      {/* Pricing */}
      <section ref={pricingRef} className="py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-12 text-gray-800 dark:text-white">Simple Pricing Plans</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6"><h3 className="text-xl font-bold">Free</h3><p className="text-3xl font-bold my-4">$0</p><p className="mb-6">Up to 5 users</p><Link to="/register" className="bg-purple-600 text-white px-6 py-2 rounded-full inline-block">Start</Link></div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 border-purple-500 p-6 relative"><div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white px-3 py-1 rounded-full text-sm">Popular</div><h3 className="text-xl font-bold">Pro</h3><p className="text-3xl font-bold my-4">$12</p><p className="mb-6">Unlimited users + AI</p><Link to="/register" className="bg-purple-600 text-white px-6 py-2 rounded-full inline-block">Start Trial</Link></div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6"><h3 className="text-xl font-bold">Enterprise</h3><p className="text-3xl font-bold my-4">Custom</p><p className="mb-6">SSO + dedicated support</p><button onClick={() => scrollTo(contactRef)} className="bg-purple-600 text-white px-6 py-2 rounded-full">Contact</button></div>
          </div>
        </div>
      </section>

      <div ref={contactRef}></div>
    </div>
  );
};
export default Landing;
