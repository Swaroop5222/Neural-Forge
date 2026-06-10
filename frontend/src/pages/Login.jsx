import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../utils/api';
import { Lock, Mail, AlertCircle, Loader, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' });
  const navigate = useNavigate();
  const [activeLogIndex, setActiveLogIndex] = useState(0);

  const SYSTEM_LOGS = [
    "NEURALFORGE_OS v2077.06.10 - INITIALIZING SYSTEMS...",
    "SECURE SHELL PIPELINES [PORT: 5000] ... ESTABLISHED",
    "MONGO_DB DATABASE CORE READ/WRITE CLUSTERS ... CONNECTED",
    "COGNITIVE AGENT MODULES (PLANNER, INTERVIEWER) ... LOADED",
    "GOOGLE GEMINI & GROQ DUAL-ENGINE MATRIX ... STANDBY",
    "ATS SCANNER V4 DIFFERENCING COMPILER ... LOADED",
    "OPPORTUNITY INTELLIGENCE SEARCH PIPELINE ... BOOTED",
    "SYSTEM SECURE MEMORY PROTOCOLS ... LEVEL 1 ACTIVE",
    "READY FOR OPERATOR VERIFICATION..."
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveLogIndex(prev => (prev < SYSTEM_LOGS.length - 1 ? prev + 1 : prev));
    }, 450);
    return () => clearInterval(timer);
  }, []);

  const validateEmail = (val) => {
    if (!val) return 'Email address is mandatory';
    if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(val)) return 'Please enter a valid email address';
    return '';
  };

  const validatePassword = (val) => {
    if (!val) return 'Password is mandatory';
    if (val.length < 6) return 'Password must contain at least 6 characters';
    return '';
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    if (fieldErrors.email) {
      setFieldErrors(prev => ({ ...prev, email: validateEmail(val) }));
    }
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    if (fieldErrors.password) {
      setFieldErrors(prev => ({ ...prev, password: validatePassword(val) }));
    }
  };

  const validateForm = () => {
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);

    setFieldErrors({
      email: emailErr,
      password: passwordErr
    });

    return !emailErr && !passwordErr;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const data = await api.post('/api/auth/login', { email, password });
      if (data.token) {
        sessionStorage.setItem('token', data.token);
      }
      onLoginSuccess(data.user);
      navigate('/');
    } catch (err) {
      const msg = err.message || 'Login failed. Please check your credentials.';
      const msgLower = msg.toLowerCase();
      if (msgLower.includes('no account') || msgLower.includes('email') || msgLower.includes('register')) {
        setFieldErrors(prev => ({ ...prev, email: msg }));
      } else if (msgLower.includes('password') || msgLower.includes('invalid password')) {
        setFieldErrors(prev => ({ ...prev, password: msg }));
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen bg-background relative overflow-hidden font-sans">
      {/* Background Grains & Glowing Orbs */}
      <div className="absolute inset-0 bg-cyber-glow pointer-events-none z-0"></div>
      <div className="cyber-grid" />
      <div className="cyber-scanlines" />

      {/* Left Column: Cyberpunk OS Operations / Info View */}
      <div className="hidden lg:flex lg:col-span-7 flex-col justify-between p-12 relative overflow-hidden border-r border-[#00FFF0]/10 z-10 bg-[#070b19]/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-primary to-accent text-white flex items-center justify-center font-heading font-extrabold text-lg shadow-[0_0_15px_rgba(0,229,255,0.25)] border border-cyan/35">
            NF
          </div>
          <span className="font-heading font-black text-xl tracking-widest text-text-main">Neural Forge</span>
        </div>

        <div className="my-auto max-w-xl space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-xs font-mono font-bold text-secondary tracking-wider">
              <Sparkles size={12} />
              <span>Next-Gen Career Mentoring Engine</span>
            </div>
            <h1 className="text-5xl font-heading font-black text-text-main leading-tight tracking-wider uppercase">
              Unlock your true career potential with{' '}
              <span className="bg-gradient-to-r from-secondary via-primary to-accent bg-clip-text text-transparent text-shadow-sm">
                AI Coaching
              </span>
            </h1>
            <p className="text-text-muted text-base leading-relaxed">
              Neural Forge feeds your raw resume profile into our dynamic AI models to output ATS analysis mappings, personalized job-matching feeds, and interactive mock interview loops.
            </p>
          </div>

          {/* Diagnostic Console Log Box */}
          <div className="p-5 rounded-xl border border-[#00FFF0]/15 bg-[#030611]/85 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] font-mono text-xs text-secondary space-y-2 h-[210px] overflow-y-auto relative">
            <div className="absolute top-0 right-0 p-2 text-[9px] text-accent/50 uppercase tracking-widest font-bold">// SECURE_LOGS</div>
            <div className="scanner-line h-0.5 opacity-35" />
            
            {SYSTEM_LOGS.slice(0, activeLogIndex + 1).map((log, index) => {
              const isLast = index === activeLogIndex;
              return (
                <div key={index} className={`flex items-start gap-2 ${isLast ? 'text-[#00FF9D]' : 'text-secondary/70'}`}>
                  <span className="text-accent shrink-0">&gt;</span>
                  <p className="leading-tight">{log}</p>
                </div>
              );
            })}
            {activeLogIndex < SYSTEM_LOGS.length - 1 && (
              <div className="flex items-center gap-1.5 text-secondary animate-pulse">
                <span className="h-1.5 w-1.5 bg-[#00FFF0] rounded-full" />
                <span className="text-[10px] tracking-wide text-text-muted">Loading sector logs...</span>
              </div>
            )}
          </div>
        </div>

        <div className="text-[10px] font-mono text-text-muted/50 tracking-wider">
          SYSTEM_ACCESS // AUTH_SECTOR_77 // COGNITIVE_YEAR_2077
        </div>
      </div>

      {/* Right Column: Form Panel */}
      <div className="col-span-12 lg:col-span-5 flex items-center justify-center p-6 md:p-12 z-10">
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-md p-8 cyber-card cyber-corner-tr cyber-corner-bl border border-[#00FFF0]/20 shadow-2xl relative bg-[#0a0f21]/80 backdrop-blur-xl"
        >
          {/* Logo showing only on mobile */}
          <div className="flex lg:hidden items-center gap-2 mb-6 justify-center">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-accent text-white flex items-center justify-center font-heading font-extrabold text-sm shadow-sm border border-cyan/25">
              NF
            </div>
            <span className="font-heading font-black text-lg text-text-main tracking-widest">Neural Forge</span>
          </div>

          <div className="text-center md:text-left mb-8">
            <h2 className="text-2xl font-heading font-black text-[#00FFF0] tracking-widest uppercase">Welcome Back</h2>
            <p className="text-xs font-mono text-text-muted mt-1 uppercase tracking-wider">Log in to resume your career mentoring sessions</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3.5 mb-6 rounded-lg bg-[#FF4D6D]/10 border border-[#FF4D6D]/20 text-[#FF4D6D] text-xs font-mono">
              <AlertCircle className="flex-shrink-0" size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="space-y-1.5">
              <label className="text-[10px] font-heading font-bold text-text-muted uppercase tracking-widest" htmlFor="email">Email Address</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 text-secondary" size={16} />
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={() => {
                    const err = validateEmail(email);
                    setFieldErrors(prev => ({ ...prev, email: err }));
                  }}
                  className={`w-full pl-11 pr-4 py-2.5 rounded-lg bg-[#070c19] border text-sm text-text-main focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary focus:shadow-[0_0_12px_rgba(0,229,255,0.25)] font-mono transition-all ${
                    fieldErrors.email ? 'border-[#FF4D6D]/50' : 'border-[#00FFF0]/15'
                  }`}
                  required
                />
              </div>
              {fieldErrors.email && (
                <span className="flex items-center gap-1 text-[11px] text-[#FF4D6D] mt-1 font-mono">
                  <AlertCircle size={12} />
                  {fieldErrors.email}
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-heading font-bold text-text-muted uppercase tracking-widest" htmlFor="password">Password</label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 text-secondary" size={16} />
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={handlePasswordChange}
                  onBlur={() => {
                    const err = validatePassword(password);
                    setFieldErrors(prev => ({ ...prev, password: err }));
                  }}
                  className={`w-full pl-11 pr-4 py-2.5 rounded-lg bg-[#070c19] border text-sm text-text-main focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary focus:shadow-[0_0_12px_rgba(0,229,255,0.25)] font-mono transition-all ${
                    fieldErrors.password ? 'border-[#FF4D6D]/50' : 'border-[#00FFF0]/15'
                  }`}
                  required
                />
              </div>
              {fieldErrors.password && (
                <span className="flex items-center gap-1 text-[11px] text-[#FF4D6D] mt-1 font-mono">
                  <AlertCircle size={12} />
                  {fieldErrors.password}
                </span>
              )}
            </div>

            <button 
              type="submit" 
              className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-lg bg-gradient-to-r from-primary to-accent hover:brightness-110 text-white text-xs font-heading font-bold tracking-widest uppercase transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader className="spinner" size={16} />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-xs text-text-muted font-mono">
            <p>
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-[#00FFF0] hover:text-cyan hover:underline transition-all">
                Register here
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
