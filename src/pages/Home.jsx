import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Check, ChevronRight, Star, ArrowRight, Shield, Zap, Globe, MessageSquare } from 'lucide-react';
import Dashboard from './Dashboard';

const HERO_IMG = '/dashboard-full.png';

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    desc: 'Perfect for small side projects.',
    features: ['Up to 3 members', '2 Workspaces', 'Basic Chat', '5GB Storage'],
    cta: 'Get Started',
    popular: false
  },
  {
    name: 'Pro',
    price: '$12',
    desc: 'Best for growing teams.',
    features: ['Unlimited members', 'Unlimited Workspaces', 'Advanced Analytics', '50GB Storage', 'Priority Support'],
    cta: 'Try Pro Free',
    popular: true
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    desc: 'For large organizations.',
    features: ['SSO & SAML', 'Audit Logs', 'Custom Workflows', 'Unlimited Storage', 'Dedicated Manager'],
    cta: 'Contact Sales',
    popular: false
  }
];

const FAQS = [
  { q: "Is there a free trial for the Pro plan?", a: "Yes! You can try all Pro features for free for 14 days, no credit card required." },
  { q: "Can I cancel my subscription anytime?", a: "Absolutely. You can cancel, upgrade, or downgrade your plan at any time from your billing settings." },
  { q: "Do you offer discounts for non-profits?", a: "Yes, we offer special pricing for educational and non-profit organizations. Contact our support team to learn more." }
];

export default function Home() {
  const { isAuth, theme } = useStore();
  const navigate = useNavigate();

  if (isAuth) {
    return <Dashboard />;
  }

  return (
    <div className="bg-[#060b18] text-white overflow-x-hidden relative min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-32 pb-20 px-6 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand/10 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent-violet/10 blur-[150px] rounded-full pointer-events-none" />

        <div className="container mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[11px] font-black tracking-[0.2em] text-brand mb-10 uppercase animate-in fade-in slide-in-from-top-4 duration-700">
            <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
            Next-Gen Workspace OS is here
          </div>

          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.85] mb-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            Work at the speed <br />
            of <span className="bg-gradient-to-r from-brand via-accent-violet to-accent-rose bg-clip-text text-transparent">thought.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg md:text-xl text-text-secondary font-medium leading-relaxed mb-12 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
            RemoteTeam is the unified mission control for elite engineering teams.
            Consolidate your tools, automate your workflows, and build the future.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
            <Button size="lg" onClick={() => navigate('/register')} className="px-12 py-5 text-xl font-black">
              Start Building — Free
            </Button>
            <Button variant="secondary" size="lg" onClick={() => navigate('/login')} className="px-12 py-5 text-xl font-black">
              Book a Demo <ArrowRight className="ml-2" />
            </Button>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-24 relative max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-12 duration-700">
            <div className="relative rounded-[40px] border border-white/10 bg-white/5 p-4 backdrop-blur-3xl shadow-2xl overflow-hidden group">
              <img
                src={HERO_IMG}
                alt="RemoteTeam Dashboard"
                className="w-full rounded-[24px] shadow-2xl transition-transform duration-700 group-hover:scale-[1.01]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#060b18] via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Floating Elements */}
            <Card className="absolute -top-10 -left-10 hidden lg:block p-5 animate-bounce-slow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500"><Zap size={20} /></div>
                <div>
                  <p className="text-[10px] font-black text-emerald-500 uppercase">Productivity</p>
                  <p className="text-sm font-black">+42% efficiency</p>
                </div>
              </div>
            </Card>
            <Card className="absolute top-1/2 -right-16 hidden lg:block p-5 animate-bounce-delayed">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand/20 flex items-center justify-center text-brand"><MessageSquare size={20} /></div>
                <div>
                  <p className="text-[10px] font-black text-brand uppercase">Sync Status</p>
                  <p className="text-sm font-black">All teams connected</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-10 border-y border-white/5 bg-[#0a0f1d]">
        <div className="container mx-auto px-6">
          <p className="text-center text-[10px] font-black tracking-widest text-text-tertiary uppercase mb-8">Trusted by elite engineering teams worldwide</p>
          <div className="flex flex-wrap justify-center items-center gap-10 md:gap-20 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {['Acme Corp', 'GlobalTech', 'Quantum', 'Nexus', 'Stark Ind'].map(company => (
              <div key={company} className="text-xl font-black text-white tracking-tighter">
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 px-6 bg-[#080d1a]">
        <div className="container mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6">Built for the <span className="text-brand">elite.</span></h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto font-medium">Everything you need to manage complex projects without the friction of traditional enterprise tools.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card hover variant="glass" className="p-10 space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-brand/10 flex items-center justify-center text-brand"><Zap size={28} /></div>
              <h3 className="text-2xl font-black">Real-time Velocity</h3>
              <p className="text-text-tertiary leading-relaxed">Websocket-powered task boards and chat ensure every update is reflected instantly across your global team.</p>
            </Card>
            <Card hover variant="glass" className="p-10 space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-accent-violet/10 flex items-center justify-center text-accent-violet"><Shield size={28} /></div>
              <h3 className="text-2xl font-black">Bank-grade Security</h3>
              <p className="text-text-tertiary leading-relaxed">Role-based access, audit trails, and end-to-end encryption keep your data safe and compliant.</p>
            </Card>
            <Card hover variant="glass" className="p-10 space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-accent-rose/10 flex items-center justify-center text-accent-rose"><Globe size={28} /></div>
              <h3 className="text-2xl font-black">Global Ready</h3>
              <p className="text-text-tertiary leading-relaxed">Multi-timezone support, localized collaboration, and CDN-powered asset delivery for teams everywhere.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-32 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6">Simple, <span className="text-accent-violet">transparent</span> pricing.</h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto font-medium">Choose the plan that fits your team's ambition. No hidden fees.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {PLANS.map(plan => (
              <Card key={plan.name} className={`relative p-10 flex flex-col h-full ${plan.popular ? 'border-brand/40 shadow-2xl shadow-brand/10 bg-brand/5 scale-105 z-10' : ''}`}>
                {plan.popular && (
                  <div className="absolute top-5 right-5 bg-brand text-white px-3 py-1 rounded-full text-[10px] font-black uppercase">Most Popular</div>
                )}
                <div className="mb-8">
                  <h3 className="text-xl font-black mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black">{plan.price}</span>
                    {plan.price !== 'Custom' && <span className="text-text-tertiary font-bold">/mo</span>}
                  </div>
                  <p className="text-text-tertiary text-sm mt-4 font-medium">{plan.desc}</p>
                </div>

                <ul className="space-y-4 mb-12 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-3 text-sm text-text-secondary font-bold">
                      <Check size={16} className="text-brand" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Button variant={plan.popular ? 'primary' : 'secondary'} className="w-full font-black py-4">
                  {plan.cta}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-32 px-6 bg-[#060b18]">
        <div className="container mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">Don't just take our word for it.</h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto font-medium">Hear how RemoteTeam has transformed the way top organizations operate.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { text: "RemoteTeam has completely changed our velocity. We ship 40% faster now.", author: "Sarah Jenkins", role: "VP of Engineering, Acme Corp" },
              { text: "The WebSocket integration is flawless. We finally have a single source of truth.", author: "David Chen", role: "CTO, GlobalTech" },
              { text: "Best-in-class UI and incredible performance. My team refuses to use anything else.", author: "Elena Rodriguez", role: "Product Lead, Quantum" }
            ].map((testimonial, i) => (
              <Card key={i} variant="glass" className="p-8">
                <div className="flex text-yellow-500 mb-6">
                  {[1, 2, 3, 4, 5].map(star => <Star key={star} size={16} fill="currentColor" />)}
                </div>
                <p className="text-lg font-medium leading-relaxed mb-8">"{testimonial.text}"</p>
                <div>
                  <p className="font-black text-white">{testimonial.author}</p>
                  <p className="text-sm text-text-tertiary font-bold">{testimonial.role}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ & Footer */}
      <section className="py-32 px-6 bg-[#080d1a] border-t border-white/5">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black tracking-tight mb-4">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <Card key={i} className="p-6">
                <h4 className="text-lg font-black text-white mb-2">{faq.q}</h4>
                <p className="text-text-tertiary text-sm leading-relaxed">{faq.a}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-40 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-brand/5 blur-[100px] rounded-full translate-y-1/2 pointer-events-none" />
        <h2 className="text-5xl md:text-8xl font-black tracking-tighter mb-12 relative z-10">
          Ready to build the <br />
          <span className="text-brand">future?</span>
        </h2>
        <Button size="lg" onClick={() => navigate('/register')} className="px-16 py-6 text-2xl font-black relative z-10 shadow-2xl">
          Join the Mission
        </Button>
      </section>

      {/* Footer is handled by Layout.jsx */}

      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        @keyframes bounce-delayed {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(20px); }
        }
        .animate-bounce-slow { animation: bounce-slow 6s ease-in-out infinite; }
        .animate-bounce-delayed { animation: bounce-delayed 7s ease-in-out infinite; animation-delay: 1s; }
      `}</style>
    </div>
  );
}
