import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Calendar, 
  Briefcase, 
  Sparkles, 
  BookOpen, 
  FileText 
} from 'lucide-react';

export default function ReportDetails({ report }) {
  const [expandedQuestions, setExpandedQuestions] = useState({});

  if (!report) return null;

  const toggleQuestion = (index, type) => {
    const key = `${type}-${index}`;
    setExpandedQuestions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Get color and styling details based on severity of skill gap
  const getSeverityStyle = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high':
        return {
          bg: 'bg-[#FF4D6D]/5',
          border: 'border-[#FF4D6D]/20',
          text: 'text-[#FF4D6D]',
          label: 'CRITICAL GAP',
          icon: <XCircle size={15} className="text-[#FF4D6D]" />
        };
      case 'medium':
        return {
          bg: 'bg-[#FFD93D]/5',
          border: 'border-[#FFD93D]/20',
          text: 'text-[#FFD93D]',
          label: 'MODERATE GAP',
          icon: <AlertTriangle size={15} className="text-[#FFD93D]" />
        };
      case 'low':
      default:
        return {
          bg: 'bg-[#00FF9D]/5',
          border: 'border-[#00FF9D]/20',
          text: 'text-[#00FF9D]',
          label: 'MINOR GAP',
          icon: <CheckCircle2 size={15} className="text-[#00FF9D]" />
        };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-8">
      {/* Report Header Card */}
      <div className="p-6 md:p-8 cyber-card cyber-corner-tr cyber-corner-bl border border-[#00FFF0]/15 relative overflow-hidden bg-[#0b1120]/50 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#00E5FF]/5 rounded-full filter blur-[50px] pointer-events-none" />
        
        <div className="flex flex-wrap gap-3 mb-4">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-secondary bg-[#0b1120]/80 border border-[#00FFF0]/15 px-3 py-0.5 rounded">
            <Calendar size={12} />
            SCAN: {formatDate(report.createdAt)}
          </span>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-secondary bg-[#0b1120]/80 border border-[#00FFF0]/15 px-3 py-0.5 rounded max-w-full truncate">
            <Briefcase size={12} className="shrink-0" />
            TARGET: {report.jobDescription || 'GENERAL PROFILE'}
          </span>
        </div>

        <h2 className="text-2xl md:text-3xl font-heading font-black text-text-main mt-2 mb-6 uppercase tracking-wider">
          {report.title || 'Career Profile Assessment'}
        </h2>
        
        <div className="flex flex-col sm:flex-row items-center gap-6 pt-6 border-t border-[#00FFF0]/10">
          {/* Progress Circular Ring */}
          <div className="cyber-progress-circle flex-shrink-0" style={{ '--progress': report.matchScore || 0 }}>
            <span className="cyber-progress-text">{report.matchScore || 0}%</span>
          </div>

          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-lg font-heading font-bold text-[#00FFF0] uppercase tracking-wider">// ATS COMPATIBILITY COEFFICIENT</h3>
            <p className="text-sm text-text-muted leading-relaxed max-w-2xl">
              Your profile currently matches {report.matchScore}% of the target requirements.
              {report.matchScore >= 80 
                ? ' Excellent alignment! Your resume contains appropriate keywords and experiences. Proceed directly to target applications.' 
                : report.matchScore >= 50 
                ? ' Strong foundation, but bridging the key skill gaps listed below will significantly improve automated resume screening responses.' 
                : ' Noticeable gap matches identified. We recommend restructuring your experiences and walking through the tailored learning steps.'}
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Skill Gaps and Timeline Roadmap */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Skill Gaps Component */}
        <div className="lg:col-span-5 p-6 cyber-card border border-[#00FFF0]/15 bg-[#0b1120]/50 space-y-4 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
          <div className="cyber-corner-tr" />
          <div className="cyber-corner-bl" />
          <div>
            <h3 className="font-heading font-bold text-lg text-text-main flex items-center gap-2 uppercase tracking-wider">
              <AlertTriangle className="text-accent" size={18} />
              <span>Identified Skill Gaps</span>
            </h3>
            <p className="text-[10px] font-mono text-text-muted mt-1">// MISSING OR WEAK CREDENTIALS IDENTIFIED</p>
          </div>
          
          {report.skillGaps && report.skillGaps.length > 0 ? (
            <div className="flex flex-col gap-3">
              {report.skillGaps.map((gap, index) => {
                const style = getSeverityStyle(gap.severity);
                return (
                  <div 
                    key={index} 
                    className={`flex items-center justify-between p-3 rounded-lg border text-xs font-mono font-semibold transition-all ${style.bg} ${style.border}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {style.icon}
                      <span className="text-text-main truncate uppercase tracking-wider">{gap.skill}</span>
                    </div>
                    <span className="text-[8px] tracking-widest px-2 py-0.5 rounded bg-[#0b1120]/60 border border-[#00FFF0]/10 font-bold shrink-0">
                      {style.label}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-text-muted italic">No key skill gaps identified! You are fully aligned.</p>
          )}
        </div>

        {/* Timeline Roadmap */}
        <div className="lg:col-span-7 p-6 cyber-card border border-[#00FFF0]/15 bg-[#0b1120]/50 space-y-4 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
          <div className="cyber-corner-tr" />
          <div className="cyber-corner-bl" />
          <div>
            <h3 className="font-heading font-bold text-lg text-text-main flex items-center gap-2 uppercase tracking-wider">
              <Sparkles className="text-[#00FFF0]" size={18} />
              <span>Coaching & Prep Roadmap</span>
            </h3>
            <p className="text-[10px] font-mono text-text-muted mt-1">// CHRONOLOGICAL GAP REDUCTION PHASES</p>
          </div>
          
          {report.preparationPlan && report.preparationPlan.length > 0 ? (
            <div className="relative pl-4 border-l border-[#00FFF0]/20 space-y-6">
              {report.preparationPlan.map((plan, index) => (
                <div key={index} className="relative space-y-2">
                  {/* Timeline bullet indicator */}
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#00FFF0] ring-4 ring-[#050816] shadow-[0_0_8px_#00FFF0]"></div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono font-bold uppercase text-secondary tracking-widest bg-secondary/10 border border-secondary/20 px-2 py-0.5 rounded">
                      PHASE 0{plan.day}
                    </span>
                    <h4 className="font-heading font-bold text-xs text-text-main uppercase tracking-wider">{plan.focus}</h4>
                  </div>
                  
                  <ul className="list-none pl-1 text-xs text-text-muted space-y-1.5 leading-relaxed font-mono">
                    {plan.tasks && plan.tasks.map((task, tIndex) => (
                      <li key={tIndex} className="flex items-start gap-1.5">
                        <span className="text-[#FF2E9A] shrink-0">-</span>
                        <span>{task}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {plan.resources && plan.resources.length > 0 && (
                    <div className="pt-2 flex flex-wrap gap-2 items-center">
                      <span className="text-[8px] font-mono font-bold text-text-muted uppercase tracking-wider flex items-center gap-1">
                        <BookOpen size={10} />
                        <span>LEARN:</span>
                      </span>
                      {plan.resources.map((res, rIndex) => (
                        <a 
                          key={rIndex} 
                          href={res.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="inline-flex items-center gap-1 text-[9px] font-mono font-bold text-[#00FFF0] hover:text-[#050816] bg-[#00FFF0]/5 border border-[#00FFF0]/25 hover:bg-[#00FFF0] px-2 py-0.5 rounded transition-all duration-200"
                        >
                          <span>{res.type === 'youtube' ? '🎥' : '📄'}</span>
                          <span className="truncate max-w-[150px]">{res.title}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-muted italic font-mono">// NO PREPARATION PLAN LOADED</p>
          )}
        </div>
      </div>

      {/* Predicted Q&A Sections */}
      {['technical', 'behavioral'].map((type) => {
        const title = type === 'technical' ? 'Predicted Technical Questions' : 'Predicted Behavioral Questions';
        const subtitle = type === 'technical' 
          ? 'Likely screening questions mapped to your identified gaps' 
          : 'Situational prompts assessing core soft skills and culture fit';
        const questionsList = type === 'technical' ? report.technicalQuestions : report.behavioralQuestions;

        return (
          <div key={type} className="p-6 cyber-card border border-[#00FFF0]/15 bg-[#0b1120]/50 space-y-4 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
            <div className="cyber-corner-tr" />
            <div className="cyber-corner-bl" />
            <div>
              <h3 className="font-heading font-bold text-lg text-text-main flex items-center gap-2 uppercase tracking-wider">
                <FileText className="text-accent" size={18} />
                <span>{title}</span>
              </h3>
              <p className="text-[10px] font-mono text-text-muted mt-1">// {subtitle.toUpperCase()}</p>
            </div>
            
            {questionsList && questionsList.length > 0 ? (
              <div className="space-y-3">
                {questionsList.map((qa, index) => {
                  const key = `${type}-${index}`;
                  const isExpanded = expandedQuestions[key];
                  return (
                    <div 
                      key={index} 
                      className={`border border-[#00FFF0]/10 rounded-lg overflow-hidden transition-all bg-[#030611]/30 hover:bg-[#030611]/50`}
                    >
                      <button 
                        className="w-full flex items-center justify-between p-4 text-left font-heading font-bold text-xs text-text-main gap-4 cursor-pointer uppercase tracking-wider" 
                        onClick={() => toggleQuestion(index, type)}
                      >
                        <span className="truncate">Q: {qa.question}</span>
                        <span className="text-secondary flex-shrink-0">
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </span>
                      </button>
 
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: "auto" }}
                            exit={{ height: 0 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 border-t border-[#00FFF0]/10 bg-[#050816]/60 space-y-4 text-xs font-mono">
                              <div className="space-y-1">
                                <span className="font-bold text-[8px] tracking-widest uppercase text-accent">// RECRUITER_INTENT</span>
                                <p className="text-text-muted leading-relaxed">{qa.intention}</p>
                              </div>
                              <div className="space-y-1">
                                <span className="font-bold text-[8px] tracking-widest uppercase text-secondary">// PROPOSED_RESPONSE_MATRIX</span>
                                <p className="text-secondary bg-[#070c19] p-4 rounded border border-[#00FFF0]/15 leading-relaxed whitespace-pre-wrap">
                                  {qa.answer}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-text-muted italic font-mono">// QUESTIONS STACK UNLOADED</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

