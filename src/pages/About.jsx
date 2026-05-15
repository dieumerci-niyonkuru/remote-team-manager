import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Globe, Users, Zap, Shield, Rocket, Target, Heart } from 'lucide-react';

const HQ_IMG = '/kigali_innovation_city_futuristic_1778873019544.png';

export default function About() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-[#060b18] text-white min-h-screen pt-32 pb-20 overflow-hidden">
      <div className="container mx-auto px-6 relative">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent-violet/10 blur-[120px] rounded-full pointer-events-none" />

        {/* Hero Section */}
        <div className="text-center mb-32 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand/10 border border-brand/20 text-[11px] font-black tracking-[0.2em] text-brand mb-8 uppercase animate-in fade-in slide-in-from-top-4 duration-700">
            <Rocket size={14} /> Our Mission
          </div>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-tight mb-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            Engineering the <br />
            <span className="bg-gradient-to-r from-brand to-accent-violet bg-clip-text text-transparent">Future of Work.</span>
          </h1>
          <p className="max-w-3xl mx-auto text-xl text-text-secondary font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
            RemoteTeam is more than a tool—it's a high-fidelity mission control for the modern era. 
            We are dedicated to unifying human intelligence and technological velocity.
          </p>
        </div>

        {/* Values Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-40 relative z-10">
          <Card variant="glass" className="p-10 space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-brand/10 flex items-center justify-center text-brand"><Target size={28} /></div>
            <h3 className="text-2xl font-black">Unified Intelligence</h3>
            <p className="text-text-tertiary leading-relaxed font-medium">
              We believe that when communication, task management, and data converge, teams achieve unprecedented levels of clarity and speed.
            </p>
          </Card>
          <Card variant="glass" className="p-10 space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-accent-violet/10 flex items-center justify-center text-accent-violet"><Zap size={28} /></div>
            <h3 className="text-2xl font-black">Radical Velocity</h3>
            <p className="text-text-tertiary leading-relaxed font-medium">
              Eliminating friction from the development lifecycle. Our platform is built for teams that move fast and ship even faster.
            </p>
          </Card>
          <Card variant="glass" className="p-10 space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-accent-rose/10 flex items-center justify-center text-accent-rose"><Shield size={28} /></div>
            <h3 className="text-2xl font-black">Fortified Trust</h3>
            <p className="text-text-tertiary leading-relaxed font-medium">
              Security is not an afterthought. We implement bank-grade encryption and strict access controls to protect your intellectual capital.
            </p>
          </Card>
        </div>

        {/* The Kigali Story */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-40 relative z-10">
          <div className="order-2 lg:order-1">
             <div className="relative rounded-[40px] border border-white/10 bg-white/5 p-4 backdrop-blur-3xl shadow-2xl overflow-hidden group">
               <img 
                 src={HQ_IMG} 
                 alt="Kigali Innovation City HQ" 
                 className="w-full rounded-[24px] shadow-2xl transition-transform duration-700 group-hover:scale-[1.02]"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-[#060b18]/60 to-transparent pointer-events-none" />
             </div>
          </div>
          <div className="order-1 lg:order-2 space-y-8">
             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black tracking-widest text-emerald-500 uppercase">
                Global Impact
             </div>
             <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
                Proudly Engineered in <span className="text-emerald-500">Rwanda.</span>
             </h2>
             <p className="text-lg text-text-secondary font-medium leading-relaxed">
                Our global technical heartbeat is located in Kigali Innovation City. We are committed to the digital transformation of East Africa and beyond.
             </p>
             <p className="text-text-tertiary leading-relaxed">
                By leveraging local talent and a global perspective, we've built a platform that scales across continents while maintaining the soul of its origin.
             </p>
             <div className="flex items-center gap-4 pt-4">
                <div className="flex -space-x-3">
                   {[1, 2, 3, 4].map(i => (
                     <div key={i} className="w-12 h-12 rounded-full border-4 border-[#060b18] bg-white/10 flex items-center justify-center text-[10px] font-black">U{i}</div>
                   ))}
                </div>
                <div className="text-sm font-black text-white">Join 1,000+ pioneers in Kigali</div>
             </div>
          </div>
        </div>

        {/* Join Us Section */}
        <Card variant="glass" className="relative p-20 text-center overflow-hidden">
           <div className="absolute inset-0 bg-brand/5 blur-[100px] pointer-events-none" />
           <div className="relative z-10 max-w-2xl mx-auto space-y-10">
              <h2 className="text-4xl md:text-7xl font-black tracking-tight leading-tight">
                 Ready to Join the <br /> <span className="text-brand">Mission?</span>
              </h2>
              <p className="text-xl text-text-secondary font-medium">
                 Experience the first true Workspace OS built for the modern era. Start your journey today.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                 <Button size="lg" className="px-12 py-5 text-xl font-black">
                    Get Started Free
                 </Button>
                 <Button variant="secondary" size="lg" className="px-12 py-5 text-xl font-black">
                    View Careers
                 </Button>
              </div>
           </div>
        </Card>
      </div>
    </div>
  );
}
