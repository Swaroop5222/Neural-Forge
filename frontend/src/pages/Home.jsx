import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Cpu, 
  FileText, 
  Briefcase, 
  MessageSquare, 
  ClipboardList, 
  ArrowRight, 
  Lock, 
  UserPlus, 
  Terminal, 
  Activity,
  ShieldCheck
} from 'lucide-react';

export default function Home() {
  const features = [
    {
      icon: <FileText className="text-secondary" size={24} />,
      title: "ATS Resume Analysis",
      description: "Upload your resume and get immediate deep-learning parsing, skill gap mapping, and a customized multi-day study planner."
    },
    {
      icon: <Sparkles className="text-primary" size={24} />,
      title: "ATS Optimization & Tailoring",
      description: "Align your profile to specific job descriptions without fabricating details, optimizing keywords for automated ATS screening platforms."
    },
    {
      icon: <MessageSquare className="text-accent" size={24} />,
      title: "Adaptive Mock Interviews",
      description: "Practice inside sequential, adaptive voice/text interview chambers with real-time grading, critique feed, and benchmark answers."
    },
    {
      icon: <Briefcase className="text-success" size={24} />,
      title: "Opportunity Intelligence",
      description: "Crawl and query job match results across networks like LinkedIn and Shine, direct from your career operating dashboard."
    }
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden font-sans select-none pb-20">
      
      {/* Top Navigation Bar */}
      <header className="w-full flex items-center justify-between py-5 px-6 md:px-12 border-b border-[#00FFF0]/10 bg-[#070b19]/60 backdrop-blur-xl relative z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-primary to-accent text-white flex items-center justify-center font-heading font-extrabold text-base shadow-[0_0_15px_rgba(0,229,255,0.25)] border border-[#00FFF0]/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-[#00FFF0]/10 animate-pulse" />
            NF
          </div>
          <span className="font-heading font-black text-lg tracking-wider text-text-main">
            NEURAL FORGE
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <Link 
            to="/login" 
            className="flex items-center gap-1.5 px-4 py-2 rounded border border-[#00FFF0]/20 text-xs font-heading font-bold text-text-muted hover:text-[#00FFF0] hover:border-[#00FFF0]/60 transition-all uppercase tracking-wider bg-[#0b1120]/40"
          >
            <Lock size={12} />
            <span>Login</span>
          </Link>
          <Link 
            to="/register" 
            className="flex items-center gap-1.5 px-4 py-2 rounded bg-gradient-to-r from-primary to-accent hover:brightness-110 text-white text-xs font-heading font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(168,85,247,0.25)] transition-all"
          >
            <UserPlus size={12} />
            <span>Register</span>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto text-center px-6 pt-16 md:pt-24 pb-12 relative z-10 space-y-8">
        
        {/* Glow Decorator */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-primary/5 filter blur-[100px] pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded bg-secondary/5 border border-secondary/20 text-[10px] font-mono font-bold text-secondary tracking-widest uppercase animate-pulse">
          <Cpu size={12} />
          <span>CYBERNETIC CAREER INTELLIGENCE SYSTEM [YEAR_2077]</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-heading font-black text-text-main leading-tight tracking-wider uppercase max-w-4xl mx-auto text-shadow-sm">
          Forge Your Future With{' '}
          <span className="bg-gradient-to-r from-secondary via-primary to-accent bg-clip-text text-transparent">
            Neural Career Intelligence
          </span>
        </h1>

        <p className="text-xs md:text-sm text-text-muted leading-relaxed font-sans max-w-2xl mx-auto uppercase tracking-wide">
          An advanced career operating system designed to analyze resumes, identify learning paths, optimize ATS matching, simulate adaptive voice mock interviews, and query global opportunity feeds.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link 
            to="/register" 
            className="w-full sm:w-auto px-8 py-3.5 rounded bg-gradient-to-r from-primary to-accent hover:brightness-110 text-white text-sm font-heading font-bold tracking-widest uppercase shadow-[0_0_20px_rgba(168,85,247,0.35)] transition-all flex items-center justify-center gap-2"
          >
            <span>Initialize Account</span>
            <ArrowRight size={14} />
          </Link>
          <Link 
            to="/login" 
            className="w-full sm:w-auto px-8 py-3.5 rounded bg-[#0b1120] hover:border-[#00FFF0]/55 border border-[#00FFF0]/15 text-sm font-heading font-bold text-text-main hover:text-[#00FFF0] transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
          >
            <span>Access System Portal</span>
          </Link>
        </div>
      </section>

      {/* Feature Glimpse Grid */}
      <section className="max-w-5xl mx-auto px-6 py-12 relative z-10 space-y-10">
        
        <div className="text-center space-y-2">
          <h2 className="text-xl font-heading font-black text-[#00FFF0] tracking-widest uppercase">// CORE OPERATIONS COGNITIVE CHANNELS</h2>
          <p className="text-[10px] font-mono text-text-muted uppercase tracking-wider">Deploy intelligence nodes to optimize your career strategy</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feat, idx) => (
            <div 
              key={idx} 
              className="cyber-card p-6 border border-[#00FFF0]/15 bg-[#0b1120]/60 flex flex-col justify-between hover:border-[#00FFF0]/40 transition-all duration-300 relative overflow-hidden group"
            >
              <div className="cyber-corner-tr" />
              <div className="cyber-corner-bl" />
              <div className="scanner-line opacity-10" />

              <div className="space-y-4">
                <div className="w-12 h-12 rounded bg-[#0b1120] border border-[#00FFF0]/20 flex items-center justify-center shadow-[0_0_10px_rgba(0,255,240,0.1)]">
                  {feat.icon}
                </div>
                <h3 className="font-heading font-bold text-text-main text-sm uppercase tracking-wider">{feat.title}</h3>
                <p className="text-xs text-text-muted leading-relaxed font-sans uppercase">{feat.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>



      {/* Footer */}
      <footer className="max-w-5xl mx-auto text-center px-6 pt-12 border-t border-[#00FFF0]/10 relative z-10 font-mono text-[9px] text-text-muted uppercase tracking-widest">
        <p>&copy; {new Date().getFullYear()} NEURAL FORGE COGNITIVE SYSTEMS. ALL CLEARANCE PROTOCOLS ENFORCED.</p>
      </footer>

    </div>
  );
}
