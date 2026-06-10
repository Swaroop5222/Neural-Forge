import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../utils/api';
import { 
  LayoutDashboard, 
  FileText, 
  Briefcase, 
  LogOut, 
  User, 
  ClipboardList, 
  MessageSquare, 
  Wand2, 
  Sparkles, 
  Download,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function Sidebar({ user, onLogoutSuccess, collapsed, setCollapsed }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post('/api/auth/logout');
      onLogoutSuccess();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
      onLogoutSuccess();
      navigate('/login');
    }
  };

  const navItems = user?.role === 'admin' ? [
    { to: "/", label: "Admin Overview", icon: LayoutDashboard },
    { to: "/admin/users", label: "User Manager", icon: User },
    { to: "/admin/analytics", label: "AI Analytics", icon: Sparkles },
    { to: "/admin/export", label: "Export Reports", icon: Download },
    { to: "/profile", label: "Profile Settings", icon: User }
  ] : [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/upload", label: "Resume Coaching", icon: FileText },
    { to: "/tailor", label: "Resume Tailoring", icon: Wand2 },
    { to: "/jobs", label: "Job Search", icon: Briefcase },
    { to: "/profile", label: "Profile", icon: User },
    { to: "/quiz", label: "Interview Quiz", icon: ClipboardList },
    { to: "/dashboard/mock-interview", label: "Mock Interview", icon: MessageSquare }
  ];

  return (
    <motion.aside 
      animate={{ width: collapsed ? 80 : 256 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 bottom-0 left-0 z-50 flex flex-col justify-between py-6 px-4 bg-[#070b19]/90 backdrop-blur-xl border-r border-[#00FFF0]/15 shadow-[8px_0_32px_rgba(0,0,0,0.6)]"
    >
      {/* Corner indicators for cyberpunk aesthetic */}
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan/40" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-accent/40" />

      {/* Collapse Toggle Button */}
      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-7 -right-3 flex items-center justify-center w-6 h-6 rounded-full bg-[#0b1120] border border-[#00FFF0]/30 text-text-muted hover:text-secondary shadow-[0_0_10px_rgba(0,229,255,0.25)] transition-all cursor-pointer z-50"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <div>
        {/* Brand Header */}
        <div className={`flex items-center gap-3 mb-8 px-2 ${collapsed ? 'justify-center' : ''}`}>
          <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-tr from-primary to-accent text-white flex items-center justify-center font-heading font-extrabold text-base shadow-[0_0_15px_rgba(0,229,255,0.25)] border border-[#00FFF0]/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-[#00FFF0]/10 animate-pulse" />
            NF
          </div>
          {!collapsed && (
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="font-heading font-black text-lg tracking-wider text-text-main text-shadow-sm"
            >
              Neural Forge
            </motion.span>
          )}
        </div>

        {/* User Mini Profile */}
        <div className={`flex items-center gap-3 p-3 rounded-xl bg-[#0b1120]/60 border border-[#00FFF0]/10 mb-6 relative overflow-hidden ${collapsed ? 'justify-center' : ''}`}>
          <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center border border-primary/30">
            <User size={16} />
          </div>
          {!collapsed && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col min-w-0"
            >
              <p className="font-heading font-bold text-xs text-text-main truncate">{user?.name || 'Career Aspirant'}</p>
              <p className="text-[9px] font-mono text-cyan/70 truncate tracking-wide uppercase">
                {user?.role === 'admin' ? `[ADMIN] ${user?.email}` : user?.email}
              </p>
            </motion.div>
          )}
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex flex-col gap-1.5">
          {user?.role === 'admin' && !collapsed && (
            <div className="text-[10px] font-bold text-text-muted/40 tracking-wider px-3 mb-2">
              ADMIN PORTAL
            </div>
          )}
          {navItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={index}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) => 
                  `group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer border ${
                    isActive 
                      ? 'bg-secondary/5 text-secondary border-secondary/35 shadow-[0_0_12px_rgba(0,229,255,0.1)]' 
                      : 'text-text-muted hover:text-text-main hover:bg-white/5 border-transparent'
                  } ${collapsed ? 'justify-center' : ''}`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={18} className={`flex-shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-secondary' : 'text-text-muted group-hover:text-text-main'}`} />
                    {!collapsed && (
                      <motion.div
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col min-w-0 flex-1 leading-tight"
                      >
                        <span className="truncate font-heading font-semibold text-xs tracking-wider">{item.label}</span>
                      </motion.div>
                    )}
                    
                    {/* Collapsed Tooltip */}
                    {collapsed && (
                      <div className="absolute left-16 hidden group-hover:flex items-center justify-center px-2.5 py-1 text-xs font-semibold text-text-main bg-surface border border-border-dark rounded-md shadow-xl whitespace-nowrap z-50 pointer-events-none font-mono">
                        {item.label}
                      </div>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Logout Action */}
      <button 
        onClick={handleLogout}
        className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-text-muted hover:text-[#FF4D6D] hover:bg-[#FF4D6D]/10 transition-all duration-200 cursor-pointer border border-transparent hover:border-[#FF4D6D]/20 ${collapsed ? 'justify-center' : ''}`}
      >
        <LogOut size={18} className="flex-shrink-0 group-hover:scale-105 transition-transform" />
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="truncate font-heading font-semibold text-xs tracking-wider"
          >
            Log Out
          </motion.span>
        )}
        {collapsed && (
          <div className="absolute left-16 hidden group-hover:flex items-center justify-center px-2.5 py-1 text-xs font-semibold text-[#FF4D6D] bg-surface border border-border-dark rounded-md shadow-xl whitespace-nowrap z-50 pointer-events-none font-mono">
            Log Out
          </div>
        )}
      </button>
    </motion.aside>
  );
}
