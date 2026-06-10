import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { 
  Activity, Server, Database, Sparkles, RefreshCw, 
  AlertTriangle, Clock, ShieldCheck, HeartPulse, Cpu
} from 'lucide-react';

export default function AdminHealth() {
  const [healthData, setHealthData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHealth = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/api/admin/health');
      setHealthData(res.data || []);
    } catch (err) {
      console.error('Error fetching system health telemetry:', err);
      setError(err.message || 'Failed to retrieve system health.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const formatUptime = (seconds) => {
    if (seconds === null || seconds === undefined) return 'N/A (SaaS Provider)';
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    const parts = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    parts.push(`${s}s`);
    return parts.join(' ');
  };

  const getServiceIcon = (name) => {
    switch (name) {
      case 'backend':
        return <Server size={18} />;
      case 'mongodb':
        return <Database size={18} />;
      case 'gemini':
      case 'groq':
        return <Sparkles size={18} />;
      default:
        return <Activity size={18} />;
    }
  };

  const getServiceTitle = (name) => {
    switch (name) {
      case 'backend':
        return 'Express Backend API';
      case 'mongodb':
        return 'MongoDB Database';
      case 'gemini':
        return 'Google Gemini API';
      case 'groq':
        return 'Groq Llama/Whisper API';
      default:
        return name.toUpperCase();
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-black text-text-main tracking-widest uppercase">System Diagnostics</h1>
          <p className="text-text-muted font-sans text-xs tracking-wider uppercase mt-1">
            Real-time heartbeats, database status, event loop delay, and AI connection latencies
          </p>
        </div>
        <button 
          onClick={fetchHealth} 
          disabled={loading}
          className="px-4 py-2.5 rounded bg-[#0b1120] hover:border-[#00FFF0]/40 border border-[#00FFF0]/15 text-xs font-heading font-bold text-text-main hover:text-[#00FFF0] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 uppercase tracking-wider"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'spinner text-[#00FFF0]' : ''}`} />
          <span>Trigger Diagnostics Check</span>
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded cyber-card border border-[#FF4D6D]/30 bg-[#FF4D6D]/5 text-[#FF4D6D] text-xs font-mono flex gap-3 max-w-xl relative">
          <div className="cyber-corner-tr" />
          <div className="cyber-corner-bl" />
          <AlertTriangle size={20} className="shrink-0 text-[#FF4D6D] animate-pulse" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Telemetry */}
      {loading && healthData.length === 0 ? (
        <div className="flex items-center justify-center min-h-[40vh] text-text-muted">
          <div className="text-center space-y-3">
            <RefreshCw className="spinner text-[#00FFF0] mx-auto" size={36} />
            <p className="text-xs font-mono uppercase tracking-widest text-[#00FFF0]">Executing health checks...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {healthData.map(svc => {
            const isHealthy = svc.status === 'healthy';
            const responseTimePercent = Math.min((svc.responseTimeMs / 1000) * 100, 100);
            
            // Custom color schema based on response speed
            let barColor = 'bg-[#00FF9D]';
            let strokeColor = 'rgba(0, 255, 157, 0.2)';
            if (svc.responseTimeMs > 500) {
              barColor = 'bg-[#FF4D6D]';
              strokeColor = 'rgba(255, 77, 109, 0.2)';
            } else if (svc.responseTimeMs > 250) {
              barColor = 'bg-[#FFD93D]';
              strokeColor = 'rgba(255, 217, 61, 0.2)';
            }

            return (
              <div 
                key={svc.service} 
                className="cyber-card p-6 border border-[#00FFF0]/15 bg-[#0b1120]/60 flex flex-col justify-between hover:border-[#00FFF0]/40 transition-all duration-300 relative overflow-hidden group"
              >
                <div className="cyber-corner-tr" />
                <div className="cyber-corner-bl" />
                <div className="scanner-line opacity-10" />

                {/* Service Status Header */}
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded flex items-center justify-center border transition-all ${
                      isHealthy 
                        ? 'bg-[#00FF9D]/5 border-[#00FF9D]/30 text-[#00FF9D] shadow-[0_0_8px_rgba(0,255,157,0.15)]' 
                        : 'bg-[#FF4D6D]/5 border-[#FF4D6D]/30 text-[#FF4D6D] shadow-[0_0_8px_rgba(255,77,109,0.15)]'
                    }`}>
                      {getServiceIcon(svc.service)}
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-text-main text-sm uppercase tracking-wide">{getServiceTitle(svc.service)}</h3>
                      <p className="text-[9px] text-text-muted mt-0.5 font-mono uppercase tracking-widest">{svc.service}</p>
                    </div>
                  </div>
                  
                  {/* Status Pill Badge */}
                  <div className={`px-2.5 py-1 text-[10px] font-heading font-black uppercase rounded flex items-center gap-2 ${
                    isHealthy ? 'text-[#00FF9D] bg-[#00FF9D]/5 border border-[#00FF9D]/20' : 'text-[#FF4D6D] bg-[#FF4D6D]/5 border border-[#FF4D6D]/20'
                  }`}>
                    <span className="relative flex h-2 w-2">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                        isHealthy ? 'bg-[#00FF9D]' : 'bg-[#FF4D6D]'
                      }`}></span>
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${
                        isHealthy ? 'bg-[#00FF9D]' : 'bg-[#FF4D6D]'
                      }`}></span>
                    </span>
                    <span>{isHealthy ? 'Healthy' : 'Outage'}</span>
                  </div>
                </div>

                {/* Diagnostic Details */}
                <div className="space-y-4 relative z-10">
                  
                  {/* Response Time and Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-text-muted uppercase tracking-wider">Ping Response</span>
                      <span className="text-text-main font-bold">{svc.responseTimeMs} ms</span>
                    </div>
                    <div className="w-full h-2 bg-[#050816] border border-[#00FFF0]/10 rounded-none p-[1px] overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${barColor}`}
                        style={{ width: `${responseTimePercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Telemetry Rows */}
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-[#00FFF0]/10 font-mono">
                    <div>
                      <span className="text-[9px] text-text-muted block uppercase tracking-widest">Active Uptime</span>
                      <span className="text-xs text-text-main font-bold mt-1 block tracking-wider">{formatUptime(svc.uptime)}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-text-muted block uppercase tracking-widest">SLA Rate (24h)</span>
                      <span className="text-xs text-primary font-bold mt-1 block tracking-wider">
                        {svc.rollingUptimeSla.toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  {/* Last Checked timestamp footer */}
                  <div className="flex items-center gap-1.5 text-[9px] text-text-muted pt-2.5 border-t border-[#00FFF0]/5 font-mono uppercase">
                    <Clock size={12} className="text-[#00FFF0]" />
                    <span>Checked at: {new Date(svc.lastCheckedAt).toLocaleTimeString()}</span>
                  </div>

                  {/* Service Error Box */}
                  {svc.error && (
                    <div className="mt-4 p-3 rounded bg-[#FF4D6D]/5 border border-[#FF4D6D]/20 text-[#FF4D6D] text-[10px] font-mono break-all leading-normal uppercase">
                      <strong className="block mb-1 text-[#FF4D6D] font-bold tracking-widest text-[9px]">Outage Detail:</strong>
                      {svc.error}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Diagnostics Explanation Footer */}
      <div className="cyber-card border border-[#00FFF0]/15 p-6 bg-[#0b1120]/50 relative flex items-start gap-4 shadow-lg">
        <div className="cyber-corner-tr" />
        <div className="cyber-corner-bl" />
        
        <div className="w-12 h-12 rounded bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
          <HeartPulse size={24} className="animate-pulse" />
        </div>
        
        <div className="space-y-1">
          <h4 className="font-heading font-bold text-text-main text-sm uppercase tracking-widest">Telemetry Status & Cron Polling</h4>
          <p className="text-xs text-text-muted leading-relaxed font-sans uppercase">
            A background checking worker automatically polls all services every 5 minutes to write statistics to MongoDB. The 24-hour SLA computes the rolling success percentage of these background heartbeats.
          </p>
        </div>
      </div>
    </div>
  );
}
