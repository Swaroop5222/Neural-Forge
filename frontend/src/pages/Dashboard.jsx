import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import ReportDetails from '../components/ReportDetails';
import { Calendar, Briefcase, Eye, ChevronRight, RefreshCw, BarChart2, Star, AlertCircle, FileText, TrendingUp, Cpu, Server, Network } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

export default function Dashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get('/api/interview/history');
      setReports(data.reports || []);
    } catch (err) {
      console.error('Failed to load history:', err);
      setError(err.message || 'Could not fetch history reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const getAverageScore = () => {
    if (reports.length === 0) return 0;
    const total = reports.reduce((acc, r) => acc + (r.matchScore || 0), 0);
    return Math.round(total / reports.length);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Prepare chart data from reports
  const getChartData = () => {
    return [...reports]
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .map(r => ({
        date: formatDate(r.createdAt),
        score: r.matchScore || 0,
        title: r.title || 'Report'
      }));
  };

  if (selectedReport) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button 
            className="px-4 py-2 rounded-lg bg-[#0b1120] border border-[#00FFF0]/15 text-sm text-text-muted hover:text-[#00FFF0] hover:border-[#00FFF0]/40 transition-all cursor-pointer font-mono" 
            onClick={() => setSelectedReport(null)}
          >
            ← Back to History
          </button>
          <h2 className="text-xl font-heading font-extrabold text-text-main">Report Analysis</h2>
        </div>
        <ReportDetails report={selectedReport} />
      </div>
    );
  }

  const chartData = getChartData();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-black text-text-main tracking-widest uppercase">Your Career Dashboard</h1>
          <p className="text-text-muted text-sm mt-1">Track your resume matches, key skill gaps, and interview prep history</p>
        </div>
        <button 
          className="px-4 py-2.5 rounded-lg bg-[#0b1120] border border-[#00FFF0]/15 text-xs font-heading font-bold text-text-main hover:text-[#00FFF0] hover:border-[#00FFF0]/40 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          onClick={fetchHistory} 
          disabled={loading}
        >
          <RefreshCw className={loading ? 'spinner text-secondary' : ''} size={14} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-mono">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Live AI Agent Network panel */}
      <div className="cyber-card p-6 border border-[#00FFF0]/15 bg-[#0b1120]/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-2 text-[9px] text-[#00FFF0]/40 uppercase tracking-widest font-mono font-bold">// COGNITIVE_AGENT_STREAM</div>
        <div className="cyber-corner-tr" />
        <div className="cyber-corner-bl" />
        
        <div className="flex items-center gap-2 mb-6">
          <Network className="text-[#00FFF0] animate-pulse" size={18} />
          <h3 className="font-heading font-bold text-[#00FFF0] text-sm uppercase tracking-widest">Active Agent Node Cluster</h3>
        </div>
        
        <div className="grid grid-cols-3 md:grid-cols-9 gap-3 items-center">
          {/* Planner */}
          <div className="flex flex-col items-center text-center">
            <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/35 flex items-center justify-center pulse-cyber-active text-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.25)]">
              <Cpu size={18} />
            </div>
            <span className="text-[10px] font-heading font-bold mt-2 text-text-main tracking-wider uppercase">Planner</span>
            <span className="text-[8px] font-mono text-[#00FF9D] mt-0.5 tracking-widest">ACTIVE</span>
          </div>

          {/* Connect 1 */}
          <div className="hidden md:flex justify-center items-center col-span-1">
            <div className="h-[1px] w-full bg-gradient-to-r from-purple-500 to-cyan relative">
              <div className="absolute top-[-2px] left-1/2 w-1.5 h-1.5 rounded-full bg-cyan animate-ping" />
            </div>
          </div>

          {/* Memory */}
          <div className="flex flex-col items-center text-center">
            <div className="w-11 h-11 rounded-xl bg-cyan/10 border border-cyan/35 flex items-center justify-center text-cyan shadow-[0_0_12px_rgba(0,229,255,0.1)]">
              <Server size={18} />
            </div>
            <span className="text-[10px] font-heading font-bold mt-2 text-text-main tracking-wider uppercase">Memory</span>
            <span className="text-[8px] font-mono text-text-muted mt-0.5 tracking-widest">STANDBY</span>
          </div>

          {/* Connect 2 */}
          <div className="hidden md:flex justify-center items-center col-span-1">
            <div className="h-[1px] w-full bg-gradient-to-r from-cyan to-accent relative">
              <div className="absolute top-[-2px] left-1/2 w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
            </div>
          </div>

          {/* Interview */}
          <div className="flex flex-col items-center text-center">
            <div className="w-11 h-11 rounded-xl bg-accent/10 border border-accent/35 flex items-center justify-center text-accent shadow-[0_0_12px_rgba(255,46,154,0.1)]">
              <Cpu size={18} />
            </div>
            <span className="text-[10px] font-heading font-bold mt-2 text-text-main tracking-wider uppercase">Interviewer</span>
            <span className="text-[8px] font-mono text-text-muted mt-0.5 tracking-widest">STANDBY</span>
          </div>

          {/* Connect 3 */}
          <div className="hidden md:flex justify-center items-center col-span-1">
            <div className="h-[1px] w-full bg-gradient-to-r from-accent to-[#00FF9D] relative">
              <div className="absolute top-[-2px] left-1/2 w-1.5 h-1.5 rounded-full bg-[#00FF9D] animate-ping" />
            </div>
          </div>

          {/* Evaluator */}
          <div className="flex flex-col items-center text-center">
            <div className="w-11 h-11 rounded-xl bg-[#00FF9D]/10 border border-[#00FF9D]/35 flex items-center justify-center text-[#00FF9D] shadow-[0_0_12px_rgba(0,255,157,0.1)]">
              <Star size={18} />
            </div>
            <span className="text-[10px] font-heading font-bold mt-2 text-text-main tracking-wider uppercase">Evaluator</span>
            <span className="text-[8px] font-mono text-text-muted mt-0.5 tracking-widest">STANDBY</span>
          </div>

          {/* Connect 4 */}
          <div className="hidden md:flex justify-center items-center col-span-1">
            <div className="h-[1px] w-full bg-gradient-to-r from-[#00FF9D] to-purple-500 relative">
              <div className="absolute top-[-2px] left-1/2 w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping" />
            </div>
          </div>

          {/* Feedback */}
          <div className="flex flex-col items-center text-center">
            <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/35 flex items-center justify-center text-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.1)]">
              <Server size={18} />
            </div>
            <span className="text-[10px] font-heading font-bold mt-2 text-text-main tracking-wider uppercase">Feedback</span>
            <span className="text-[8px] font-mono text-text-muted mt-0.5 tracking-widest">STANDBY</span>
          </div>
        </div>
      </div>

      {/* Overview Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 cyber-card cyber-corner-tr cyber-corner-bl border border-[#00FFF0]/15 flex items-center gap-5 relative overflow-hidden bg-[#0b1120]/50 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full filter blur-[40px] pointer-events-none" />
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary border border-primary/30 flex items-center justify-center shadow-[0_0_12px_rgba(168,85,247,0.2)]">
            <FileText size={22} />
          </div>
          <div>
            <p className="text-3xl font-heading font-black text-text-main">{reports.length}</p>
            <p className="text-[10px] font-heading font-bold text-text-muted uppercase tracking-widest mt-1">Resumes Analyzed</p>
          </div>
        </div>

        <div className="p-6 cyber-card cyber-corner-tr cyber-corner-bl border border-[#00FFF0]/15 flex items-center gap-5 relative overflow-hidden bg-[#0b1120]/50 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00E5FF]/5 rounded-full filter blur-[40px] pointer-events-none" />
          <div className="w-12 h-12 rounded-xl bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30 flex items-center justify-center shadow-[0_0_12px_rgba(0,229,255,0.2)]">
            <BarChart2 size={22} />
          </div>
          <div>
            <p className="text-3xl font-heading font-black text-[#00FFF0]">{getAverageScore()}%</p>
            <p className="text-[10px] font-heading font-bold text-text-muted uppercase tracking-widest mt-1">Average Match Score</p>
          </div>
        </div>

        <div className="p-6 cyber-card cyber-corner-tr cyber-corner-bl border border-[#00FFF0]/15 flex items-center gap-5 relative overflow-hidden bg-[#0b1120]/50 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF2E9A]/5 rounded-full filter blur-[40px] pointer-events-none" />
          <div className="w-12 h-12 rounded-xl bg-[#FF2E9A]/10 text-[#FF2E9A] border border-[#FF2E9A]/30 flex items-center justify-center shadow-[0_0_12px_rgba(255,46,154,0.2)]">
            <Star size={22} />
          </div>
          <div>
            <p className="text-3xl font-heading font-black text-[#FF2E9A]">
              {reports.length > 0 ? Math.max(...reports.map(r => r.matchScore || 0)) : 0}%
            </p>
            <p className="text-[10px] font-heading font-bold text-text-muted uppercase tracking-widest mt-1">Highest Score</p>
          </div>
        </div>
      </div>

      {/* Main Sections: Chart & List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Analytics Chart Block */}
        {reports.length > 0 && (
          <div className="lg:col-span-12 p-6 cyber-card border border-[#00FFF0]/15 bg-[#0b1120]/50 space-y-4 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="text-secondary" size={18} />
              <h3 className="font-heading font-bold text-text-main">Match Score Progress</h3>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="#00E5FF" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} fontClassName="font-mono" />
                  <YAxis domain={[0, 100]} stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} fontClassName="font-mono" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0a0f21', 
                      borderColor: 'rgba(0, 240, 240, 0.2)',
                      borderRadius: '8px',
                      color: '#F8FAFC',
                      fontSize: '11px',
                      fontFamily: 'Space Grotesk, sans-serif'
                    }} 
                  />
                  <Area type="monotone" dataKey="score" name="Match Score" stroke="#00E5FF" strokeWidth={2} fillOpacity={1} fill="url(#colorScore)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* History List Section */}
        <div className="lg:col-span-12 space-y-4">
          <h3 className="font-heading font-bold text-base text-[#00FFF0] uppercase tracking-widest">Coaching & Analysis History</h3>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 gap-3 text-text-muted cyber-card border border-[#00FFF0]/10 bg-[#0b1120]/45">
              <RefreshCw className="spinner text-secondary" size={32} />
              <p className="text-xs font-mono uppercase tracking-wider">Loading your career history...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center gap-4 cyber-card border border-[#00FFF0]/10 bg-[#0b1120]/45">
              <div className="w-16 h-16 rounded-full bg-[#0b1120]/60 border border-[#00FFF0]/15 flex items-center justify-center text-[#00FFF0]/40 shadow-[inset_0_0_12px_rgba(0,255,240,0.1)]">
                <FileText size={28} />
              </div>
              <div className="space-y-1 max-w-sm">
                <h4 className="font-heading font-bold text-[#00FFF0] text-sm uppercase tracking-wider">No reports generated yet</h4>
                <p className="text-xs text-text-muted leading-relaxed">Upload your resume and enter a target job description to get a full gap analysis and coaching roadmap.</p>
              </div>
              <Link to="/upload" className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-primary to-accent hover:brightness-115 text-white text-xs font-heading font-bold tracking-widest uppercase transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] cursor-pointer">
                Analyze Your Resume Now
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {reports.map((report) => (
                <div 
                  key={report._id} 
                  className="flex flex-col md:flex-row justify-between items-start md:items-center p-5 cyber-card cyber-card-hover border border-[#00FFF0]/15 bg-[#0b1120]/50 cursor-pointer gap-4"
                  onClick={() => setSelectedReport(report)}
                >
                  <div className="space-y-2 min-w-0 flex-1">
                    <span className="inline-flex items-center gap-1.5 text-[10px] text-secondary font-mono bg-[#0b1120]/80 px-2.5 py-0.5 rounded border border-[#00FFF0]/15">
                      <Calendar size={12} />
                      {formatDate(report.createdAt)}
                    </span>
                    <h4 className="font-heading font-bold text-base text-text-main truncate uppercase tracking-wide">
                      {report.title || 'Career Profile Assessment'}
                    </h4>
                    <p className="text-xs text-text-muted flex items-center gap-1.5 truncate font-mono">
                      <Briefcase size={12} className="flex-shrink-0 text-accent" />
                      <span>
                        {report.jobDescription ? (
                          report.jobDescription.length > 70 
                            ? `${report.jobDescription.substring(0, 70)}...` 
                            : report.jobDescription
                        ) : 'General Profile'}
                      </span>
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between w-full md:w-auto gap-6 md:border-l border-[#00FFF0]/15 md:pl-6 pt-3 md:pt-0">
                    <div className="text-left md:text-right">
                      <span className="text-[9px] uppercase font-bold text-text-muted tracking-wider block font-mono">Match Score</span>
                      <span className="text-xl font-heading font-black text-secondary">{report.matchScore}%</span>
                    </div>
                    <button className="px-4 py-2 rounded-lg bg-secondary/10 text-secondary border border-secondary/20 hover:bg-secondary hover:text-[#050816] text-xs font-heading font-bold tracking-widest uppercase transition-all duration-200 flex items-center gap-1 cursor-pointer">
                      <Eye size={12} />
                      <span>View</span>
                      <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

