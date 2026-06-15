import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../utils/api';
import {
  User, Shield, Edit3, Save, X, Eye, EyeOff, Lock,
  CheckCircle, AlertCircle, RefreshCw, Monitor,
  Globe, Activity, Key, BadgeCheck, Calendar, LogIn, Wifi, WifiOff,
  Camera, Upload
} from 'lucide-react';

// ─── Utility: parse userAgent string ────────────────────────────────────────
function parseUA(ua = '') {
  const browser = /Chrome/i.test(ua) ? 'Chrome'
    : /Firefox/i.test(ua) ? 'Firefox'
    : /Safari/i.test(ua) && !/Chrome/i.test(ua) ? 'Safari'
    : /Edge/i.test(ua) ? 'Edge'
    : 'Unknown';
  const os = /Windows/i.test(ua) ? 'Windows'
    : /Mac/i.test(ua) ? 'macOS'
    : /Linux/i.test(ua) ? 'Linux'
    : /Android/i.test(ua) ? 'Android'
    : /iPhone|iPad/i.test(ua) ? 'iOS'
    : 'Unknown';
  const device = /Mobile|Android|iPhone/i.test(ua) ? 'Mobile' : 'Desktop';
  return { browser, os, device };
}

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

// ─── Password strength ──────────────────────────────────────────────────────
function getStrength(pw) {
  let score = 0;
  const checks = {
    length:    pw.length >= 8,
    upper:     /[A-Z]/.test(pw),
    lower:     /[a-z]/.test(pw),
    number:    /\d/.test(pw),
    special:   /[^A-Za-z0-9]/.test(pw),
  };
  score = Object.values(checks).filter(Boolean).length;
  return { score, checks };
}

// ─── Section wrapper ─────────────────────────────────────────────────────────
function Section({ title, icon: Icon, badge, children }) {
  return (
    <div className="bg-[#0d1424] border border-white/8 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-white/6 bg-white/2">
        <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/25 flex items-center justify-center flex-shrink-0">
          <Icon size={16} className="text-blue-400" />
        </div>
        <h2 className="font-semibold text-sm text-white tracking-wide">{title}</h2>
        {badge && (
          <span className="ml-auto px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 border border-blue-500/25 text-blue-400 uppercase tracking-widest">
            {badge}
          </span>
        )}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ─── Field label ─────────────────────────────────────────────────────────────
function Label({ children }) {
  return <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">{children}</label>;
}

// ─── Text input ──────────────────────────────────────────────────────────────
function Input({ value, onChange, type = 'text', placeholder, disabled, ...rest }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full px-3.5 py-2.5 rounded-lg bg-[#080e1c] border border-white/8 text-sm text-white placeholder-slate-600
        focus:outline-none focus:border-blue-500/60 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]
        disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      {...rest}
    />
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function AdminProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Account info edit ─────────────────────────────────────────────────────
  const [editingInfo, setEditingInfo] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [infoLoading, setInfoLoading] = useState(false);
  const [infoMsg, setInfoMsg] = useState({ type: '', text: '' });
  const avatarRef = useRef(null);
  const [avatar, setAvatar] = useState(null); // base64 preview

  // ── Security / password ───────────────────────────────────────────────────
  const [curPw, setCurPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confPw, setConfPw] = useState('');
  const [showCur, setShowCur] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState({ type: '', text: '' });

  // ── Login history ─────────────────────────────────────────────────────────
  const [sessions, setSessions] = useState([]);
  const [histLoading, setHistLoading] = useState(true);

  // ── Fetch user ────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const data = await api.get('/api/auth/get-me');
        if (data.user) {
          setUser(data.user);
          setEditName(data.user.name);
          setEditEmail(data.user.email);
          // Load stored avatar
          const storedAvatar = localStorage.getItem(`admin_avatar_${data.user._id}`);
          if (storedAvatar) setAvatar(storedAvatar);
        }
      } catch (e) {
        console.error('AdminProfile: fetch user failed', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Fetch login history ───────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const data = await api.get('/api/auth/profile/login-history');
        setSessions(data.data || []);
      } catch (e) {
        setSessions([]);
      } finally {
        setHistLoading(false);
      }
    })();
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAvatar(ev.target.result);
      if (user?._id) localStorage.setItem(`admin_avatar_${user._id}`, ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveInfo = async () => {
    if (!editName.trim() || !editEmail.trim()) {
      setInfoMsg({ type: 'error', text: 'Name and email are required.' });
      return;
    }
    setInfoLoading(true);
    setInfoMsg({ type: '', text: '' });
    try {
      const res = await api.put('/api/auth/profile', { name: editName, email: editEmail });
      setUser(prev => ({ ...prev, name: res.user?.name || editName, email: res.user?.email || editEmail }));
      setInfoMsg({ type: 'success', text: 'Profile updated successfully.' });
      setEditingInfo(false);
    } catch (e) {
      setInfoMsg({ type: 'error', text: e.message || 'Failed to update profile.' });
    } finally {
      setInfoLoading(false);
    }
  };

  const handleCancelInfo = () => {
    setEditName(user?.name || '');
    setEditEmail(user?.email || '');
    setEditingInfo(false);
    setInfoMsg({ type: '', text: '' });
  };

  const handleChangePassword = async () => {
    setPwMsg({ type: '', text: '' });
    if (!curPw || !newPw || !confPw) {
      setPwMsg({ type: 'error', text: 'All password fields are required.' });
      return;
    }
    if (newPw !== confPw) {
      setPwMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    const { score } = getStrength(newPw);
    if (score < 3) {
      setPwMsg({ type: 'error', text: 'Password is too weak. Meet at least 3 requirements.' });
      return;
    }
    setPwLoading(true);
    try {
      await api.put('/api/auth/profile/change-password', { currentPassword: curPw, newPassword: newPw });
      setPwMsg({ type: 'success', text: 'Password changed successfully.' });
      setCurPw(''); setNewPw(''); setConfPw('');
    } catch (e) {
      setPwMsg({ type: 'error', text: e.message || 'Failed to change password.' });
    } finally {
      setPwLoading(false);
    }
  };


  // ── Derived ───────────────────────────────────────────────────────────────
  const lastSession = sessions[0];
  const lastUA = lastSession ? parseUA(lastSession.userAgent) : null;
  const { score: pwScore, checks: pwChecks } = getStrength(newPw);

  const strengthLabel = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'][pwScore] || '';
  const strengthColor = [
    '', 'bg-red-500', 'bg-orange-500', 'bg-yellow-400', 'bg-emerald-400', 'bg-emerald-500'
  ][pwScore] || 'bg-slate-700';


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4 text-slate-400">
          <RefreshCw className="animate-spin" size={28} />
          <p className="text-sm font-mono">Loading admin profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Admin Panel</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Account Settings</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage your administrator profile, security, and preferences.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <Shield size={14} className="text-blue-400" />
          <span className="text-xs font-semibold text-blue-400">Admin Access</span>
        </div>
      </div>

      {/* ── SECTION 1: Admin Account Information ────────────────────────── */}
      <Section title="Admin Account Information" icon={User}>
        <div className="flex flex-col sm:flex-row gap-6">

          {/* Avatar */}
          <div className="flex flex-col items-center gap-3 flex-shrink-0">
            <div className="relative group">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 border-2 border-white/10 flex items-center justify-center overflow-hidden shadow-lg">
                {avatar
                  ? <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
                  : <User size={32} className="text-white/80" />
                }
              </div>
              <button
                onClick={() => avatarRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Camera size={18} className="text-white" />
              </button>
              <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>
            <button
              onClick={() => avatarRef.current?.click()}
              className="text-[10px] font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Upload size={10} /> Upload Photo
            </button>
          </div>

          {/* Info fields */}
          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Full Name</Label>
                {editingInfo
                  ? <Input value={editName} onChange={e => setEditName(e.target.value)} placeholder="Admin name" />
                  : <p className="text-sm font-semibold text-white py-2.5 px-3.5 rounded-lg bg-white/4 border border-white/6">{user?.name || '—'}</p>
                }
              </div>
              <div>
                <Label>Email Address</Label>
                {editingInfo
                  ? <Input value={editEmail} onChange={e => setEditEmail(e.target.value)} type="email" placeholder="admin@email.com" />
                  : <p className="text-sm text-slate-300 py-2.5 px-3.5 rounded-lg bg-white/4 border border-white/6 font-mono">{user?.email || '—'}</p>
                }
              </div>
            </div>

            {/* Badges row */}
            <div className="flex flex-wrap gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-purple-500/15 border border-purple-500/25 text-purple-300">
                <Shield size={11} />
                {user?.role === 'admin' ? 'Super Admin' : user?.role || 'Admin'}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 border border-emerald-500/25 text-emerald-300">
                <BadgeCheck size={11} />
                Active
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-slate-500/20 border border-slate-500/25 text-slate-400">
                <Calendar size={11} />
                Admin since {user?.createdAt ? new Date(user.createdAt).getFullYear() : '—'}
              </span>
            </div>

            {/* Feedback message */}
            {infoMsg.text && (
              <div className={`flex items-center gap-2 p-3 rounded-lg text-xs font-medium border ${
                infoMsg.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300'
                  : 'bg-red-500/10 border-red-500/25 text-red-300'
              }`}>
                {infoMsg.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                {infoMsg.text}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-2 pt-1">
              {editingInfo ? (
                <>
                  <button
                    onClick={handleSaveInfo}
                    disabled={infoLoading}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                  >
                    {infoLoading ? <RefreshCw size={12} className="animate-spin" /> : <Save size={12} />}
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancelInfo}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/6 hover:bg-white/10 text-slate-300 text-xs font-bold transition-all cursor-pointer border border-white/8"
                  >
                    <X size={12} /> Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditingInfo(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/6 hover:bg-white/10 text-slate-200 text-xs font-bold transition-all cursor-pointer border border-white/8"
                >
                  <Edit3 size={12} /> Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </Section>

      {/* ── SECTION 2: Security Center ───────────────────────────────────── */}
      <Section title="Security Center" icon={Lock} badge="Protected">
        <div className="space-y-6">

          {/* Change password */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Key size={14} className="text-blue-400" /> Change Password
            </h3>
            <div className="space-y-3">
              {/* Current */}
              <div>
                <Label>Current Password</Label>
                <div className="relative">
                  <Input
                    value={curPw} onChange={e => setCurPw(e.target.value)}
                    type={showCur ? 'text' : 'password'} placeholder="Enter current password"
                  />
                  <button onClick={() => setShowCur(!showCur)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer transition-colors">
                    {showCur ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* New */}
              <div>
                <Label>New Password</Label>
                <div className="relative">
                  <Input
                    value={newPw} onChange={e => setNewPw(e.target.value)}
                    type={showNew ? 'text' : 'password'} placeholder="Enter new password"
                  />
                  <button onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer transition-colors">
                    {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>

                {/* Strength bar */}
                {newPw && (
                  <div className="mt-2 space-y-2">
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(i => (
                        <div key={i} className={`flex-1 h-1 rounded-full transition-all duration-300 ${i <= pwScore ? strengthColor : 'bg-white/8'}`} />
                      ))}
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex flex-wrap gap-2">
                        {[
                          { key: 'length', label: '8+ chars' },
                          { key: 'upper', label: 'Uppercase' },
                          { key: 'lower', label: 'Lowercase' },
                          { key: 'number', label: 'Number' },
                        ].map(({ key, label }) => (
                          <span key={key} className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
                            pwChecks[key] ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-600 bg-white/4'
                          }`}>
                            {pwChecks[key] ? '✓' : '·'} {label}
                          </span>
                        ))}
                      </div>
                      <span className={`text-[10px] font-bold ${
                        pwScore >= 4 ? 'text-emerald-400' : pwScore >= 3 ? 'text-yellow-400' : 'text-red-400'
                      }`}>{strengthLabel}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm */}
              <div>
                <Label>Confirm New Password</Label>
                <div className="relative">
                  <Input
                    value={confPw} onChange={e => setConfPw(e.target.value)}
                    type={showConf ? 'text' : 'password'} placeholder="Repeat new password"
                  />
                  <button onClick={() => setShowConf(!showConf)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer transition-colors">
                    {showConf ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                  {confPw && (
                    <div className="absolute right-9 top-1/2 -translate-y-1/2">
                      {confPw === newPw
                        ? <CheckCircle size={14} className="text-emerald-400" />
                        : <X size={14} className="text-red-400" />
                      }
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Password message */}
            {pwMsg.text && (
              <div className={`flex items-center gap-2 p-3 rounded-lg text-xs font-medium border mt-3 ${
                pwMsg.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300'
                  : 'bg-red-500/10 border-red-500/25 text-red-300'
              }`}>
                {pwMsg.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                {pwMsg.text}
              </div>
            )}

            <button
              onClick={handleChangePassword}
              disabled={pwLoading}
              className="mt-4 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              {pwLoading ? <RefreshCw size={12} className="animate-spin" /> : <Key size={12} />}
              Update Password
            </button>
          </div>
        </div>
      </Section>

      {/* ── SECTION 3: Login Activity ────────────────────────────────────── */}
      <Section title="Login Activity" icon={Activity}>
        {histLoading ? (
          <div className="flex items-center gap-3 py-8 justify-center text-slate-500">
            <RefreshCw size={16} className="animate-spin" />
            <span className="text-xs">Loading activity...</span>
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-slate-600">
            <LogIn size={28} className="mb-2 opacity-40" />
            <p className="text-xs">No login sessions recorded yet.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Last login card */}
            {lastSession && (
              <div className="p-4 rounded-xl bg-blue-500/6 border border-blue-500/15 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <LogIn size={18} className="text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-blue-400/70 uppercase tracking-widest mb-0.5">Last Login</p>
                  <p className="text-sm font-semibold text-white">{fmtDate(lastSession.loginAt)}</p>
                </div>
                <div className="flex gap-4 text-xs text-slate-400 flex-wrap">
                  {lastUA && (
                    <>
                      <span className="flex items-center gap-1.5">
                        <Globe size={12} className="text-slate-500" /> {lastUA.browser}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Monitor size={12} className="text-slate-500" /> {lastUA.os} {lastUA.device}
                      </span>
                    </>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Globe size={12} className="text-slate-500" /> {lastSession.ipAddress || '—'}
                  </span>
                </div>
              </div>
            )}

            {/* Recent sessions table */}
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">Recent Sessions</p>
              <div className="hidden sm:block overflow-x-auto rounded-xl border border-white/6">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-white/3 border-b border-white/6">
                      {['Login Time', 'Browser', 'Device / OS', 'IP Address', 'Status'].map(h => (
                        <th key={h} className="text-left px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/4">
                    {sessions.slice(0, 5).map((s, i) => {
                      const ua = parseUA(s.userAgent);
                      return (
                        <tr key={s._id || i} className="hover:bg-white/2 transition-colors">
                          <td className="px-4 py-3 text-slate-300 font-mono text-[11px]">{fmtDate(s.loginAt)}</td>
                          <td className="px-4 py-3 text-slate-300">{ua.browser}</td>
                          <td className="px-4 py-3 text-slate-400">{ua.device} · {ua.os}</td>
                          <td className="px-4 py-3 text-slate-500 font-mono text-[10px]">{s.ipAddress || '—'}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                              s.active
                                ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300'
                                : 'bg-slate-500/10 border-slate-500/20 text-slate-400'
                            }`}>
                              {s.active ? <Wifi size={8} /> : <WifiOff size={8} />}
                              {s.active ? 'Active' : 'Ended'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="sm:hidden space-y-2">
                {sessions.slice(0, 5).map((s, i) => {
                  const ua = parseUA(s.userAgent);
                  return (
                    <div key={s._id || i} className="p-3 rounded-lg bg-white/3 border border-white/6 space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-mono text-slate-300">{fmtDate(s.loginAt)}</span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                          s.active ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300' : 'bg-slate-500/10 border-slate-500/20 text-slate-400'
                        }`}>
                          {s.active ? 'Active' : 'Ended'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500">{ua.browser} · {ua.device} · {ua.os}</p>
                      <p className="text-[10px] text-slate-600 font-mono">{s.ipAddress || '—'}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </Section>

    </div>
  );
}
