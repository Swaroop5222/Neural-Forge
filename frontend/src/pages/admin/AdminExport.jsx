import React from 'react';
import { 
  Users, FileText, ClipboardList, MessageSquare, Sparkles, 
  FileSpreadsheet, Download, ShieldCheck, AlertCircle, Cpu, Database
} from 'lucide-react';
import { BASE_URL as API_BASE_URL } from '../../utils/api';

export default function AdminExport() {
  const BASE_URL = `${API_BASE_URL}/api/admin/export`;

  const getBadgeStyles = (colorName) => {
    switch (colorName) {
      case 'kpi-blue':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30 shadow-[0_0_8px_rgba(59,130,246,0.15)]';
      case 'kpi-green':
        return 'bg-[#00FF9D]/10 text-[#00FF9D] border-[#00FF9D]/30 shadow-[0_0_8px_rgba(0,255,157,0.15)]';
      case 'kpi-purple':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30 shadow-[0_0_8px_rgba(168,85,247,0.15)]';
      case 'kpi-orange':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.15)]';
      default:
        return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30';
    }
  };

  const exportCategories = [
    {
      title: 'Users Directory',
      description: 'Export all registered accounts including metadata like registration timestamp, last active activity, status, and system role.',
      endpoint: '/users',
      icon: <Users size={18} />,
      badgeColor: 'kpi-blue'
    },
    {
      title: 'ATS Match Reports',
      description: 'Export parsed resume analyses containing job description details, match scores, resume filename, and user association references.',
      endpoint: '/ats',
      icon: <FileText size={18} />,
      badgeColor: 'kpi-green'
    },
    {
      title: 'Mock Interview Sessions',
      description: 'Export mock interview runs containing job role targets, difficulty levels, scores (overall, technical, communication), and status.',
      endpoint: '/interviews',
      icon: <MessageSquare size={18} />,
      badgeColor: 'kpi-purple'
    },
    {
      title: 'AI Analytics Log Ledger',
      description: 'Export complete historical analytics logs tracking LLM provider (Gemini/Groq), tokens used, response round-trip latencies, success codes, and error traces.',
      endpoint: '/analytics',
      icon: <Sparkles size={18} />,
      badgeColor: 'kpi-orange'
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header Banner */}
      <div>
        <h1 className="text-3xl font-heading font-black text-text-main tracking-widest uppercase">Export Reports</h1>
        <p className="text-text-muted font-sans text-xs tracking-wider uppercase mt-1">
          Export database directories in CSV, Microsoft Excel (.xlsx), or Adobe PDF formats
        </p>
      </div>

      {/* Export Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {exportCategories.map(cat => (
          <div 
            key={cat.title} 
            className="cyber-card p-6 border border-[#00FFF0]/15 bg-[#0b1120]/60 flex flex-col justify-between hover:border-[#00FFF0]/40 transition-all duration-300 relative overflow-hidden group"
          >
            <div className="cyber-corner-tr" />
            <div className="cyber-corner-bl" />
            <div className="scanner-line opacity-10" />

            <div>
              {/* Category Header */}
              <div className="flex items-center gap-3 mb-4 relative z-10">
                <div className={`w-10 h-10 rounded flex items-center justify-center shrink-0 border transition-all ${getBadgeStyles(cat.badgeColor)}`}>
                  {cat.icon}
                </div>
                <h3 className="font-heading font-bold text-text-main text-sm uppercase tracking-wide">{cat.title}</h3>
              </div>
              
              {/* Category Description */}
              <p className="text-xs text-text-muted leading-relaxed mb-6 font-mono uppercase tracking-wider relative z-10">{cat.description}</p>
            </div>
            
            {/* Actions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-[#00FFF0]/10 font-mono relative z-10">
              <a 
                href={`${BASE_URL}${cat.endpoint}?format=csv`}
                download
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded bg-[#0b1120] hover:border-[#00FFF0] border border-[#00FFF0]/15 text-xs font-heading font-bold text-text-main hover:text-[#00FFF0] transition-all duration-200 cursor-pointer"
                style={{ textDecoration: 'none' }}
              >
                <Download size={14} className="shrink-0 text-[#00FFF0]" />
                <span>CSV</span>
              </a>

              <a 
                href={`${BASE_URL}${cat.endpoint}?format=xlsx`}
                download
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded bg-[#0b1120] hover:border-[#00FF9D] border border-[#00FFF0]/15 text-xs font-heading font-bold text-text-main hover:text-[#00FF9D] transition-all duration-200 cursor-pointer"
                style={{ textDecoration: 'none' }}
              >
                <FileSpreadsheet size={14} className="shrink-0 text-[#00FF9D]" />
                <span>Excel</span>
              </a>

              <a 
                href={`${BASE_URL}${cat.endpoint}?format=pdf`}
                download
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded bg-[#0b1120] hover:border-[#FF4D6D] border border-[#00FFF0]/15 text-xs font-heading font-bold text-text-main hover:text-[#FF4D6D] transition-all duration-200 cursor-pointer"
                style={{ textDecoration: 'none' }}
              >
                <FileText size={14} className="shrink-0 text-[#FF4D6D]" />
                <span>PDF Report</span>
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Explanatory Info Card */}
      <div className="cyber-card border border-[#00FFF0]/15 p-6 bg-[#0b1120]/50 relative flex items-start gap-4 shadow-lg">
        <div className="cyber-corner-tr" />
        <div className="cyber-corner-bl" />
        
        <div className="w-12 h-12 rounded bg-[#00FF9D]/10 border border-[#00FF9D]/20 text-[#00FF9D] flex items-center justify-center shrink-0">
          <ShieldCheck size={24} className="animate-pulse" />
        </div>
        
        <div className="space-y-1">
          <h4 className="font-heading font-bold text-text-main text-sm uppercase tracking-widest">Data Streams & Memory Performance</h4>
          <p className="text-xs text-text-muted leading-relaxed font-sans uppercase">
            Exports query and compile rows dynamically using database cursor buffers, writing chunks directly to the response download. Large records are streamed efficiently without causing high memory consumption on the server.
          </p>
        </div>
      </div>
    </div>
  );
}
