import React, { useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, 
  Upload, 
  FileText, 
  AlertCircle, 
  RefreshCw, 
  CheckCircle, 
  Info, 
  Sparkles, 
  FolderOpen, 
  Star, 
  Compass, 
  UserCheck, 
  BookOpen, 
  ArrowRight,
  TrendingUp,
  MessageSquare,
  Award,
  ChevronDown,
  ChevronUp,
  Smile,
  Mic,
  MicOff,
  Play,
  Square,
  Trash2,
  Keyboard,
  Cpu,
  Server,
  Terminal,
  Activity,
  Layers,
  Flame
} from 'lucide-react';

export default function MockInterview() {
  // Setup States
  const [savedResumes, setSavedResumes] = useState([]);
  const [resumesLoading, setResumesLoading] = useState(true);
  const [resumeSource, setResumeSource] = useState('none'); // 'none', 'saved', 'upload'
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [file, setFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const [jobRole, setJobRole] = useState('');
  const [difficulty, setDifficulty] = useState('medium'); // 'easy', 'medium', 'hard'

  // Loading & Session States
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0); 
  const [error, setError] = useState('');
  const [session, setSession] = useState(null); 
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Active Answering Mode
  const [answerType, setAnswerType] = useState('text'); 
  const [answer, setAnswer] = useState(''); 
  const [evaluating, setEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null); 

  // Audio Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
  const [audioBlob, setAudioBlob] = useState(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  // Dashboard Toggle States
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  // Quick select roles
  const presetRoles = [
    "React Frontend Engineer",
    "Node.js Backend Developer",
    "Full Stack Web Developer",
    "Product Manager",
    "Data Scientist / ML Engineer"
  ];

  // Fetch saved resumes on mount
  useEffect(() => {
    const fetchResumesList = async () => {
      try {
        const data = await api.get('/api/resumeUpload/');
        const list = data.resumes || [];
        setSavedResumes(list);
        if (list.length > 0) {
          setSelectedResumeId(list[0]._id);
          setResumeSource('saved');
        } else {
          setResumeSource('none');
        }
      } catch (err) {
        console.error("Failed to load saved resumes:", err);
        setResumeSource('none');
      } finally {
        setResumesLoading(false);
      }
    };
    fetchResumesList();
  }, []);

  // Timer helper for recording
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
      setRecordingSeconds(0);
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  // Audio recording handlers
  const startRecording = async () => {
    setError('');
    setAudioUrl('');
    setAudioBlob(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access error:", err);
      setError("Failed to access microphone. Please ensure permissions are granted.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const deleteRecording = () => {
    setAudioUrl('');
    setAudioBlob(null);
  };

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // PDF drop zone helpers
  const handleDragOver = (e) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = () => { setIsDragOver(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    validateAndSetFile(e.dataTransfer.files[0]);
  };
  const handleFileChange = (e) => validateAndSetFile(e.target.files[0]);
  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) return;
    if (selectedFile.type !== 'application/pdf') {
      setError('Please upload a PDF file only.');
      setFile(null);
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be under 10MB.');
      setFile(null);
      return;
    }
    setError('');
    setFile(selectedFile);
  };
  const triggerFileSelect = () => fileInputRef.current.click();
  const removeFile = () => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; };

  // Launch interview
  const handleStartInterview = async (e) => {
    e.preventDefault();
    if (!jobRole.trim()) {
      setError('Please enter or select a target job role.');
      return;
    }

    setLoading(true);
    setError('');
    setLoadingStep(1);

    try {
      let finalResumeId = null;

      if (resumeSource === 'upload' && file) {
        const formData = new FormData();
        formData.append('resume', file);
        const uploadData = await api.upload('/api/resumeUpload/', formData);
        
        if (uploadData.response && uploadData.response._id) {
          finalResumeId = uploadData.response._id;
          setSavedResumes(prev => [uploadData.response, ...prev]);
          setSelectedResumeId(uploadData.response._id);
          setResumeSource('saved');
        }
      } else if (resumeSource === 'saved') {
        finalResumeId = selectedResumeId;
      }

      setLoadingStep(2);

      const startData = await api.post('/api/mock-interview/start', {
        jobRole: jobRole.trim(),
        resumeId: finalResumeId,
        difficulty
      });

      if (startData.interview) {
        setSession(startData.interview);
        setCurrentQuestionIndex(0);
        setAnswer('');
        setEvaluationResult(null);
        deleteRecording();
      }
    } catch (err) {
      console.error("Start interview failed:", err);
      setError(err.message || 'Failed to generate interview. Please check your network.');
    } finally {
      setLoading(false);
      setLoadingStep(0);
    }
  };

  // Submit response
  const handleSubmitAnswer = async () => {
    if (answerType === 'text' && !answer.trim()) return;
    if (answerType === 'audio' && !audioBlob) return;

    setEvaluating(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('questionIndex', currentQuestionIndex);
      formData.append('answerType', answerType);

      if (answerType === 'text') {
        formData.append('userAnswer', answer);
      } else {
        const audioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });
        formData.append('audio', audioFile);
      }

      const data = await api.upload(`/api/mock-interview/${session._id}/answer`, formData);
      setEvaluationResult(data.evaluation);
      
      if (answerType === 'audio' && data.evaluation.userAnswer) {
        setAnswer(data.evaluation.userAnswer);
      }
    } catch (err) {
      console.error("Answer submission failed:", err);
      setError(err.message || "Failed to submit response. Please try again.");
    } finally {
      setEvaluating(false);
    }
  };

  // Progress to next dynamic question
  const handleNextQuestion = () => {
    if (evaluationResult && evaluationResult.nextQuestion) {
      const nextQ = evaluationResult.nextQuestion;
      
      setSession(prev => {
        const updatedQs = [...prev.questions];
        updatedQs[currentQuestionIndex].userAnswer = answer;
        updatedQs[currentQuestionIndex].score = evaluationResult.score;
        updatedQs[currentQuestionIndex].feedback = evaluationResult.feedback;
        updatedQs[currentQuestionIndex].idealAnswer = evaluationResult.idealAnswer;

        updatedQs.push({
          question: nextQ.question,
          category: nextQ.category,
          topic: nextQ.topic,
          userAnswer: '',
          score: null,
          feedback: '',
          idealAnswer: ''
        });

        return { ...prev, questions: updatedQs };
      });

      setCurrentQuestionIndex(prev => prev + 1);
      setAnswer('');
      setEvaluationResult(null);
      deleteRecording();
      setError('');
    }
  };

  // Compile final report
  const handleFinishInterview = async () => {
    setLoading(true);
    setLoadingStep(3);
    setError('');
    try {
      const data = await api.post(`/api/mock-interview/${session._id}/finish`);
      setSession(data.interview);
    } catch (err) {
      console.error("Failed to compile feedback report:", err);
      setError(err.message || "Failed to compile report. Please try again.");
    } finally {
      setLoading(false);
      setLoadingStep(0);
    }
  };

  const resetInterview = () => {
    setSession(null);
    setAnswer('');
    setEvaluationResult(null);
    deleteRecording();
    setError('');
  };

  // Scoring helpers
  const getScoreColorClass = (score) => {
    if (score >= 80) return 'bg-[#00FF9D]/5 border-[#00FF9D]/20 text-[#00FF9D]';
    if (score >= 60) return 'bg-[#FFD93D]/5 border-[#FFD93D]/20 text-[#FFD93D]';
    return 'bg-[#FF4D6D]/5 border-[#FF4D6D]/20 text-[#FF4D6D]';
  };

  const getStrokeColor = (score) => {
    if (score >= 80) return '#00FF9D';
    if (score >= 60) return '#FFD93D';
    return '#FF4D6D';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ==========================================
  // RENDER: LOADING VIEW
  // ==========================================
  if (loading) {
    return (
      <div className="p-8 md:p-12 cyber-card border border-[#00FFF0]/15 bg-[#0b1120]/60 flex items-center justify-center glow-primary max-w-lg mx-auto my-12 relative">
        <div className="cyber-corner-tr" />
        <div className="cyber-corner-bl" />
        
        <div className="text-center w-full space-y-6">
          <div className="inline-flex p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 text-[#00FFF0] animate-pulse">
            <Sparkles size={36} className="spinner text-[#00FFF0]" />
          </div>
          
          {loadingStep === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-heading font-extrabold text-text-main">Planner Agent Setting Up Session...</h2>
              <p className="text-xs text-text-muted">Analyzing target job role details, core technologies, and projects...</p>
              <div className="space-y-2.5 pt-4 text-left max-w-xs mx-auto">
                <div className="flex items-center gap-2.5 text-xs text-text-main font-semibold">
                  <CheckCircle size={14} className="text-[#00FF9D]" />
                  <span>Interpreting Job Description</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-[#00FFF0] font-semibold">
                  <RefreshCw size={14} className="spinner text-[#00FFF0]" />
                  <span>Mapping core keywords and tech stack</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-text-muted/40 font-semibold">
                  <div className="w-3.5 h-3.5 rounded border border-[#00FFF0]/10 flex-shrink-0"></div>
                  <span>Generating custom question schemas</span>
                </div>
              </div>
            </div>
          )}

          {loadingStep === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-heading font-extrabold text-text-main">Interview Agent Drafting Questions...</h2>
              <p className="text-xs text-text-muted">Creating initial Technical concepts challenges...</p>
              <div className="space-y-2.5 pt-4 text-left max-w-xs mx-auto">
                <div className="flex items-center gap-2.5 text-xs text-text-main font-semibold">
                  <CheckCircle size={14} className="text-[#00FF9D]" />
                  <span>Planner roadmap ready</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-text-main font-semibold">
                  <CheckCircle size={14} className="text-[#00FF9D]" />
                  <span>Skills analysis complete</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-[#00FFF0] font-semibold">
                  <RefreshCw size={14} className="spinner text-[#00FFF0]" />
                  <span>Composing real-world mock question</span>
                </div>
              </div>
            </div>
          )}

          {loadingStep === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-heading font-extrabold text-text-main">Feedback Agent Consolidating Reports...</h2>
              <p className="text-xs text-text-muted">Aggregating transcripts, checking scores, and writing recommendations...</p>
              <div className="space-y-2.5 pt-4 text-left max-w-xs mx-auto">
                <div className="flex items-center gap-2.5 text-xs text-text-main font-semibold">
                  <CheckCircle size={14} className="text-[#00FF9D]" />
                  <span>Main evaluations finalized</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-text-main font-semibold">
                  <CheckCircle size={14} className="text-[#00FF9D]" />
                  <span>Transcripts processed successfully</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-[#00FFF0] font-semibold">
                  <RefreshCw size={14} className="spinner text-[#00FFF0]" />
                  <span>Compiling strengths & weaknesses dashboard</span>
                </div>
              </div>
            </div>
          )}

          <p className="text-[10px] text-text-muted pt-4">Please do not refresh or navigate away.</p>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER: RESULTS DASHBOARD SCREEN
  // ==========================================
  if (session && session.status === 'completed') {
    return (
      <div id="printable-report" className="space-y-8 max-w-5xl mx-auto pb-16">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#00FFF0]/15 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-heading font-black bg-[#00FFF0]/10 border border-[#00FFF0]/20 text-[#00FFF0] uppercase tracking-widest">
                {session.difficulty}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-mono text-text-muted">
                📅 {formatDate(session.updatedAt)}
              </span>
            </div>
            <h1 className="text-3xl font-heading font-black text-text-main tracking-widest uppercase">Interview Performance Results</h1>
            <p className="text-xs font-mono text-text-muted uppercase">Target Job Role: <strong className="text-text-main font-bold font-heading">{session.jobRole}</strong></p>
          </div>
          
          <div className="flex items-center gap-3 no-print">
            <button 
              className="px-4 py-2.5 rounded-lg bg-[#0b1120] hover:border-[#00FFF0]/40 border border-[#00FFF0]/15 text-xs font-heading font-bold text-text-main hover:text-[#00FFF0] transition-all flex items-center gap-2 cursor-pointer"
              onClick={() => window.print()}
            >
              <FileText size={14} className="text-[#00FFF0]" />
              <span>Download PDF Report</span>
            </button>
            <button 
              className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-primary to-accent hover:brightness-110 text-white text-xs font-heading font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all cursor-pointer"
              onClick={resetInterview}
            >
              Start New Interview
            </button>
          </div>
        </div>

        {/* Score Index Columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-5 cyber-card p-6 border border-[#00FFF0]/15 bg-[#0b1120]/60 relative flex flex-col sm:flex-row items-center gap-6 justify-center">
            <div className="cyber-corner-tr" />
            <div className="cyber-corner-bl" />
            
            <div className="cyber-progress-circle shadow-md flex-shrink-0" style={{ '--progress': session.overallScore || 0 }}>
              <span className="cyber-progress-text">{session.overallScore || 0}%</span>
            </div>
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="font-heading font-bold text-sm text-[#00FFF0] uppercase tracking-wider">Cumulative Performance</h3>
              <p className="text-xs text-text-muted leading-relaxed font-sans mt-1">Your overall rating meets industry standard benchmarks for this role.</p>
            </div>
          </div>

          <div className="md:col-span-7 cyber-card p-6 border border-[#00FFF0]/15 bg-[#0b1120]/60 relative flex flex-col justify-center gap-5">
            <div className="cyber-corner-tr" />
            <div className="cyber-corner-bl" />
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-heading font-bold uppercase tracking-wider text-text-main">
                <span>Technical Proficiency</span>
                <span style={{ color: getStrokeColor(session.technicalScore) }}>{session.technicalScore}%</span>
              </div>
              <div className="h-2.5 bg-[#050816] border border-[#00FFF0]/10 rounded-none p-[1px] overflow-hidden">
                <div 
                  className="h-full transition-all duration-1000" 
                  style={{ width: `${session.technicalScore}%`, backgroundColor: getStrokeColor(session.technicalScore) }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-heading font-bold uppercase tracking-wider text-text-main">
                <span>Communication & Clarity</span>
                <span style={{ color: getStrokeColor(session.communicationScore) }}>{session.communicationScore}%</span>
              </div>
              <div className="h-2.5 bg-[#050816] border border-[#00FFF0]/10 rounded-none p-[1px] overflow-hidden">
                <div 
                  className="h-full transition-all duration-1000" 
                  style={{ width: `${session.communicationScore}%`, backgroundColor: getStrokeColor(session.communicationScore) }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Strengths & Weaknesses Panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="cyber-card p-6 border border-[#00FFF0]/15 bg-[#0b1120]/60 relative space-y-4">
            <div className="cyber-corner-tr" />
            <div className="cyber-corner-bl" />
            
            <h3 className="font-heading font-bold text-sm text-[#00FF9D] flex items-center gap-2 uppercase tracking-widest">
              <UserCheck size={18} />
              <span>Key Strengths</span>
            </h3>
            <ul className="space-y-3">
              {session.strengths.map((str, idx) => (
                <li key={idx} className="flex gap-2.5 text-xs text-text-muted leading-relaxed font-mono">
                  <span className="text-[#00FF9D] font-bold flex-shrink-0">✓</span>
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="cyber-card p-6 border border-[#00FFF0]/15 bg-[#0b1120]/60 relative space-y-4">
            <div className="cyber-corner-tr" />
            <div className="cyber-corner-bl" />
            
            <h3 className="font-heading font-bold text-sm text-[#FF4D6D] flex items-center gap-2 uppercase tracking-widest">
              <AlertCircle size={18} />
              <span>Identified Gaps</span>
            </h3>
            <ul className="space-y-3">
              {session.weaknesses.map((weak, idx) => (
                <li key={idx} className="flex gap-2.5 text-xs text-text-muted leading-relaxed font-mono">
                  <span className="text-[#FF4D6D] font-bold flex-shrink-0">⚠</span>
                  <span>{weak}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Lacking Skills tags */}
        {session.lackingSkills && session.lackingSkills.length > 0 && (
          <div className="cyber-card p-6 border border-[#00FFF0]/15 bg-[#0b1120]/60 relative space-y-4">
            <div className="cyber-corner-tr" />
            <div className="cyber-corner-bl" />
            
            <h3 className="font-heading font-bold text-sm text-[#FFD93D] flex items-center gap-2 uppercase tracking-widest">
              <TrendingUp size={18} />
              <span>Core Gaps / Key Skill Gaps</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {session.lackingSkills.map((skill, idx) => (
                <span key={idx} className="px-3 py-1 rounded-none text-xs font-mono font-bold bg-[#FFD93D]/5 border border-[#FFD93D]/25 text-[#FFD93D]">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        <div className="cyber-card p-6 border border-[#00FFF0]/15 bg-[#0b1120]/60 relative space-y-4">
          <div className="cyber-corner-tr" />
          <div className="cyber-corner-bl" />
          
          <h3 className="font-heading font-bold text-sm text-primary flex items-center gap-2 uppercase tracking-widest">
            <BookOpen size={18} />
            <span>Actionable Learning Roadmap</span>
          </h3>
          <div className="space-y-3">
            {session.recommendations.map((rec, idx) => (
              <div key={idx} className="flex gap-3 items-center p-3.5 rounded bg-[#050816] border border-[#00FFF0]/10">
                <span className="w-6 h-6 rounded bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-heading font-black text-xs flex-shrink-0">
                  {idx + 1}
                </span>
                <p className="text-xs font-mono text-text-main font-medium leading-relaxed">{rec}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Transcript Panel Accordion */}
        <div className="space-y-4">
          <h3 className="font-heading font-bold text-base text-[#00FFF0] uppercase tracking-widest">Full Interview Transcript</h3>
          
          {/* Interactive Accordion for screen display */}
          <div className="space-y-3 print:hidden">
            {session.questions.map((q, idx) => {
              const isOpen = expandedQuestion === idx;
              return (
                <div key={idx} className="cyber-card border border-[#00FFF0]/15 bg-[#0b1120]/45 hover:bg-[#0b1120]/75 transition-colors overflow-hidden">
                  <button 
                    className="w-full flex items-center justify-between p-4 text-left font-heading font-bold text-xs text-text-main gap-4 cursor-pointer" 
                    onClick={() => setExpandedQuestion(isOpen ? null : idx)}
                  >
                    <div className="flex flex-wrap items-center gap-2.5 min-w-0">
                      <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-mono tracking-widest ${
                        q.category === 'technical' ? 'bg-primary/10 border border-primary/20 text-primary' : 'bg-[#00FF9D]/10 border border-[#00FF9D]/20 text-[#00FF9D]'
                      }`}>
                        {q.category}
                      </span>
                      <h4 className="text-xs text-text-main truncate font-mono uppercase tracking-wider">Q{idx + 1}: {q.topic || 'Core Concept'}</h4>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <span className="text-xs font-mono font-bold" style={{ color: getStrokeColor(q.score) }}>
                        Score: {q.score}%
                      </span>
                      {isOpen ? <ChevronUp size={16} className="text-[#00FFF0]" /> : <ChevronDown size={16} className="text-[#00FFF0]" />}
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 border-t border-[#00FFF0]/10 bg-[#050816]/70 space-y-4 text-xs font-mono leading-relaxed">
                          <div className="space-y-1">
                            <span className="font-bold text-[9px] uppercase text-[#00FFF0]/60 tracking-wider block">Question prompt</span>
                            <p className="text-text-main font-semibold font-heading text-xs tracking-wider">{q.question}</p>
                          </div>
                          
                          <div className="p-3 bg-[#0b1120] rounded border border-[#00FFF0]/10 space-y-1">
                            <span className="font-bold text-[9px] uppercase text-text-muted tracking-wider block">Your transcribed answer</span>
                            <p className="text-text-main italic font-medium">"{q.userAnswer || 'No response provided.'}"</p>
                          </div>

                          <div className="border-l-2 border-primary pl-3 space-y-1">
                            <span className="font-bold text-[9px] uppercase text-primary tracking-wider block">Mentor critique feedback</span>
                            <p className="text-text-muted leading-relaxed text-[11px] font-sans">{q.feedback}</p>
                          </div>

                          <div className="border-l-2 border-[#00FF9D] pl-3 space-y-1">
                            <span className="font-bold text-[9px] uppercase text-[#00FF9D] tracking-wider block">Suggested benchmark answer</span>
                            <p className="text-text-muted leading-relaxed italic text-[11px] font-sans">"{q.idealAnswer}"</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Full detailed list for printed PDF */}
          <div className="hidden print:block space-y-6">
            {session.questions.map((q, idx) => (
              <div key={idx} className="p-5 rounded-lg border border-[#00FFF0]/15 bg-[#0b1120]/80 space-y-4 page-break-inside-avoid">
                <div className="flex justify-between items-center border-b border-[#00FFF0]/15 pb-2">
                  <span className="text-[10px] font-heading font-black uppercase text-[#00FFF0] tracking-wider">
                    Question {idx + 1} &mdash; {q.topic || 'Core Concept'} ({q.category})
                  </span>
                  <span className="text-xs font-mono font-bold" style={{ color: getStrokeColor(q.score) }}>
                    Score: {q.score}%
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-[8px] font-heading font-bold uppercase text-[#00FFF0]/60 tracking-wider block">Question:</span>
                  <p className="text-xs font-heading font-bold text-text-main leading-relaxed">{q.question}</p>
                </div>
                <div className="p-3 bg-[#050816]/60 rounded border border-[#00FFF0]/10 space-y-1 font-mono">
                  <span className="text-[8px] font-heading font-bold uppercase text-text-muted tracking-wider block">Your Transcribed Response:</span>
                  <p className="text-xs text-text-main italic font-medium">"{q.userAnswer || 'No response provided.'}"</p>
                </div>
                <div className="border-l-2 border-primary pl-3.5 space-y-1">
                  <span className="text-[8px] font-heading font-bold uppercase text-primary tracking-wider block">Mentor Feedback:</span>
                  <p className="text-text-muted text-[11px] leading-relaxed font-sans">{q.feedback}</p>
                </div>
                <div className="border-l-2 border-[#00FF9D] pl-3.5 space-y-1">
                  <span className="text-[8px] font-heading font-bold uppercase text-[#00FF9D] tracking-wider block">Suggested Answer:</span>
                  <p className="text-text-muted text-[11px] leading-relaxed italic font-sans">"{q.idealAnswer}"</p>
                </div>
              </div>
            ))}
          </div>

        </div>

        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            body, html {
              background-color: #050816 !important;
              color: #F8FAFC !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            aside, nav, .no-print, [role="navigation"], button {
              display: none !important;
            }
            main {
              margin-left: 0 !important;
              padding: 0 !important;
              width: 100% !important;
              max-width: 100% !important;
            }
            #printable-report {
              width: 100% !important;
              max-width: 100% !important;
              padding: 0 !important;
              margin: 0 !important;
            }
            .cyber-card {
              background: rgba(11, 17, 32, 0.95) !important;
              border-color: rgba(0, 240, 240, 0.2) !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .page-break-inside-avoid {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
          }
        `}} />

      </div>
    );
  }

  // ==========================================
  // RENDER: ACTIVE INTERVIEW SCREEN
  // ==========================================
  if (session && session.status !== 'completed') {
    const currentQuestion = session.questions[currentQuestionIndex];
    const totalQuestions = 3;
    const progressPercent = Math.min(((currentQuestionIndex + (evaluationResult ? 1.0 : 0)) / totalQuestions) * 100, 100);

    return (
      <div className="space-y-6 max-w-3xl mx-auto pb-16">
        
        {/* Active Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="text-[9px] font-heading font-black text-primary uppercase tracking-widest flex items-center gap-1.5">
              <Activity size={10} className="text-primary animate-pulse" />
              <span>Active Simulator Session</span>
            </span>
            <h2 className="text-xl font-heading font-bold text-text-main mt-0.5 tracking-wider uppercase">{session.jobRole}</h2>
          </div>
          <button 
            className="px-3.5 py-1.5 rounded bg-[#0b1120] hover:border-[#FF4D6D]/45 border border-[#00FFF0]/15 text-xs font-heading font-bold text-text-muted hover:text-[#FF4D6D] transition-colors cursor-pointer"
            onClick={resetInterview}
          >
            Quit Interview
          </button>
        </div>

        {/* Global Progress Bar */}
        <div className="h-2 bg-[#0b1120] border border-[#00FFF0]/15 p-[1px] rounded-none overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary via-accent to-secondary transition-all duration-300" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Interviewer holographic chat bubble */}
        <div className="cyber-card p-6 md:p-8 border border-[#00FFF0]/15 bg-[#0b1120]/80 space-y-6 relative overflow-hidden">
          <div className="cyber-corner-tr" />
          <div className="cyber-corner-bl" />
          <div className="scanner-line opacity-10" />
          
          <div className="flex items-center justify-between gap-4 relative z-10">
            <span className={`px-2.5 py-0.5 rounded text-[9px] font-mono uppercase tracking-widest ${
              currentQuestion.category === 'technical' ? 'bg-primary/15 border border-primary/30 text-primary' : 'bg-[#00FF9D]/15 border border-[#00FF9D]/30 text-[#00FF9D]'
            }`}>
              {currentQuestion.category} Question
            </span>
            <span className="text-xs font-mono text-text-muted uppercase tracking-wider">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </span>
          </div>

          <div className="flex items-start gap-4 relative z-10">
            <div className="w-11 h-11 rounded-lg bg-gradient-to-tr from-primary via-[#00FFF0] to-accent text-white flex items-center justify-center font-heading font-black text-sm flex-shrink-0 shadow-[0_0_12px_rgba(0,255,240,0.3)] animate-pulse border border-[#00FFF0]/20">
              AI
            </div>
            <div className="space-y-1">
              <p className="text-base md:text-lg font-heading font-bold text-text-main leading-relaxed tracking-wide">
                {currentQuestion.question}
              </p>
            </div>
          </div>

          {/* User Input Intake */}
          {!evaluationResult ? (
            <div className="space-y-5 pt-6 border-t border-[#00FFF0]/10 relative z-10">
              
              {/* Selector toggler */}
              <div className="flex gap-2 border-b border-[#00FFF0]/10 pb-4">
                <button
                  type="button"
                  className={`px-4 py-2 rounded text-xs font-heading font-bold uppercase tracking-widest flex items-center gap-1.5 cursor-pointer border transition-all ${
                    answerType === 'audio' 
                      ? 'bg-[#00FFF0]/10 border-[#00FFF0] text-[#00FFF0] shadow-[0_0_10px_rgba(0,255,240,0.15)]' 
                      : 'border-[#00FFF0]/15 bg-[#0b1120]/60 text-text-muted hover:text-[#00FFF0] hover:border-[#00FFF0]/40'
                  }`}
                  onClick={() => { setAnswerType('audio'); setError(''); }}
                >
                  <Mic size={14} />
                  <span>Speak Response (Voice)</span>
                </button>
                <button
                  type="button"
                  className={`px-4 py-2 rounded text-xs font-heading font-bold uppercase tracking-widest flex items-center gap-1.5 cursor-pointer border transition-all ${
                    answerType === 'text' 
                      ? 'bg-[#00FFF0]/10 border-[#00FFF0] text-[#00FFF0] shadow-[0_0_10px_rgba(0,255,240,0.15)]' 
                      : 'border-[#00FFF0]/15 bg-[#0b1120]/60 text-text-muted hover:text-[#00FFF0] hover:border-[#00FFF0]/40'
                  }`}
                  onClick={() => { setAnswerType('text'); setError(''); }}
                >
                  <Keyboard size={14} />
                  <span>Type Response (Text)</span>
                </button>
              </div>

              {/* Text Input */}
              {answerType === 'text' ? (
                <div className="space-y-2">
                  <label className="text-xs font-heading font-bold uppercase tracking-widest text-[#00FFF0] block">Type your answer:</label>
                  <textarea
                    rows={5}
                    placeholder="Provide your detailed answer..."
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-[#050816] border border-[#00FFF0]/15 text-xs font-mono text-text-main placeholder-text-muted/30 focus:outline-none focus:border-[#00FFF0] focus:shadow-[0_0_15px_rgba(0,255,240,0.1)] transition-all resize-none leading-relaxed"
                  />
                </div>
              ) : (
                /* Voice Input & Waveforms */
                <div className="flex flex-col items-center justify-center p-6 rounded-lg bg-[#050816]/50 border border-[#00FFF0]/15 space-y-4">
                  <div className="flex items-center gap-4">
                    {!isRecording ? (
                      <button
                        type="button"
                        className="w-14 h-14 rounded-full bg-gradient-to-r from-primary to-accent text-white flex items-center justify-center shadow-lg shadow-primary/20 hover:brightness-110 cursor-pointer border border-[#00FFF0]/20"
                        onClick={startRecording}
                      >
                        <Mic size={22} />
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="w-14 h-14 rounded-full bg-[#FF4D6D] text-white flex items-center justify-center shadow-lg shadow-red-500/20 cursor-pointer animate-pulse border border-[#FF4D6D]/30"
                        onClick={stopRecording}
                      >
                        <Square size={18} />
                      </button>
                    )}

                    {isRecording && (
                      <div className="flex flex-col font-mono">
                        <span className="text-xs font-bold text-[#FF4D6D] flex items-center gap-1.5 uppercase tracking-widest">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#FF4D6D] inline-block animate-ping" />
                          RECORDING: {formatTimer(recordingSeconds)}
                        </span>
                        
                        {/* Audio Waveforms bar indicator */}
                        <div className="flex gap-1 items-end h-6 mt-1.5">
                          <span className="wave-bar wave-active" style={{ animationDelay: '0.1s' }} />
                          <span className="wave-bar wave-active" style={{ animationDelay: '0.3s' }} />
                          <span className="wave-bar wave-active" style={{ animationDelay: '0.5s' }} />
                          <span className="wave-bar wave-active" style={{ animationDelay: '0.2s' }} />
                          <span className="wave-bar wave-active" style={{ animationDelay: '0.4s' }} />
                          <span className="wave-bar wave-active" style={{ animationDelay: '0.6s' }} />
                        </div>
                      </div>
                    )}
                  </div>

                  {!isRecording && audioUrl && (
                    <div className="flex flex-col items-center gap-3.5 w-full animate-fade-in font-mono">
                      <span className="text-xs font-bold text-[#00FF9D] flex items-center gap-1.5 uppercase tracking-widest">
                        <CheckCircle size={14} />
                        <span>Audio Recorded</span>
                      </span>
                      <audio src={audioUrl} controls className="w-full max-w-sm rounded" />
                      <button
                        type="button"
                        className="px-3.5 py-1.5 rounded border border-[#FF4D6D]/30 text-[#FF4D6D] text-[10px] font-heading font-bold bg-[#FF4D6D]/5 hover:bg-[#FF4D6D]/15 transition-all cursor-pointer flex items-center gap-1.5 uppercase"
                        onClick={deleteRecording}
                      >
                        <Trash2 size={12} />
                        <span>Delete & Re-record</span>
                      </button>
                    </div>
                  )}

                  {!isRecording && !audioUrl && (
                    <span className="text-[10px] font-mono text-text-muted uppercase tracking-widest">Click start to speak your answer...</span>
                  )}
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 p-3.5 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
                  <AlertCircle size={14} />
                  <span>{error}</span>
                </div>
              )}

              <button
                className="w-full flex items-center justify-center gap-2 py-3 rounded bg-gradient-to-r from-primary to-accent text-white font-heading font-bold text-xs tracking-widest uppercase shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all cursor-pointer disabled:opacity-50 hover:brightness-110"
                onClick={handleSubmitAnswer}
                disabled={evaluating || (answerType === 'text' ? !answer.trim() : !audioBlob)}
              >
                {evaluating ? (
                  <>
                    <RefreshCw className="spinner" size={14} />
                    <span>Submitting & evaluating answer...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Answer</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Immediate Feedback layout */
            <div className="space-y-6 pt-6 border-t border-[#00FFF0]/10 animate-fade-in relative z-10 font-mono">
              {answerType === 'audio' && (
                <div className="p-3.5 bg-primary/5 border-l-2 border-primary rounded text-xs">
                  <span className="font-bold text-[8px] uppercase text-primary tracking-widest block">Your Answer (Transcribed):</span>
                  <p className="text-text-main italic font-medium mt-1">"{answer}"</p>
                </div>
              )}

              <div className={`p-4 rounded border ${getScoreColorClass(evaluationResult.score)} text-xs font-heading font-bold flex items-center gap-3`}>
                <Award size={20} className="drop-shadow-[0_0_8px_currentColor]" />
                <div>
                  <h4 className="text-sm font-black tracking-widest uppercase">Score: {evaluationResult.score}/100</h4>
                  <p className="opacity-75 font-mono text-[9px] font-normal uppercase tracking-wider mt-0.5">Feedback generated by AI Mentor</p>
                </div>
              </div>

              <div className="border-l-2 border-primary pl-3 space-y-1 text-xs">
                <span className="font-bold text-[9px] uppercase text-primary tracking-widest block font-heading">Critique & Feedback</span>
                <p className="text-text-muted leading-relaxed font-sans text-xs">{evaluationResult.feedback}</p>
              </div>

              <div className="p-4 rounded bg-[#050816] border border-[#00FFF0]/10 text-xs space-y-1.5">
                <h4 className="font-heading font-bold text-text-main flex items-center gap-1.5 uppercase tracking-widest">
                  <Sparkles size={14} className="text-[#00FF9D]" />
                  <span>Suggested Answer</span>
                </h4>
                <p className="text-text-muted leading-relaxed italic font-sans text-xs">
                  "{evaluationResult.idealAnswer}"
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button 
                  className="flex-1 py-2.5 px-5 rounded bg-gradient-to-r from-primary to-accent text-white font-heading font-bold text-xs tracking-widest uppercase shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:brightness-110 flex items-center justify-center gap-1.5 cursor-pointer"
                  onClick={handleNextQuestion}
                >
                  <span>Next Question</span>
                  <ArrowRight size={14} />
                </button>
                <button 
                  className="flex-1 py-2.5 px-5 rounded bg-[#0b1120] hover:border-[#00FFF0]/40 border border-[#00FFF0]/15 text-xs font-heading font-bold text-text-main hover:text-[#00FFF0] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  onClick={handleFinishInterview}
                >
                  <span>Finish & View Report</span>
                  <Sparkles size={14} className="text-[#00FFF0]" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER: SETUP SCREEN (Step 1)
  // ==========================================
  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      
      {/* Header Banner */}
      <div className="text-center space-y-3 relative py-4">
        <h1 className="text-4xl font-heading font-black text-text-main tracking-widest uppercase flex items-center justify-center gap-3">
          <Compass className="text-[#00FFF0] animate-pulse" size={32} />
          <span>AI Mock Interviews</span>
        </h1>
        <p className="text-text-muted font-sans text-xs tracking-wider max-w-xl mx-auto uppercase">
          Practice job-specific interview questions in a safe, interactive environment. Speak or type your answers and get immediate grading with suggested improvement roadmaps.
        </p>
        <div className="w-32 h-[1px] bg-gradient-to-r from-transparent via-[#00FFF0] to-transparent mx-auto mt-2" />
      </div>

      {error && (
        <div className="flex items-center gap-2.5 p-4 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleStartInterview} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Stored profile options */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-6 cyber-card border border-[#00FFF0]/15 bg-[#0b1120]/60 relative space-y-4">
            <div className="cyber-corner-tr" />
            <div className="cyber-corner-bl" />
            
            <div>
              <label className="text-xs font-heading font-bold text-text-main uppercase tracking-widest">Resume Context (Optional)</label>
              <p className="text-[9px] font-mono text-text-muted mt-1 uppercase tracking-wider">Tailor the questions based on your uploaded resume data</p>
            </div>

            <div className="flex gap-2">
              {['none', 'saved', 'upload'].map((source) => (
                <button
                  key={source}
                  type="button"
                  className={`flex-1 py-2 rounded text-xs font-heading font-bold uppercase tracking-widest border transition-all cursor-pointer ${
                    resumeSource === source
                      ? 'bg-[#00FFF0]/10 border-[#00FFF0] text-[#00FFF0] shadow-[0_0_10px_rgba(0,255,240,0.1)]'
                      : 'border-[#00FFF0]/15 bg-[#0b1120]/60 text-text-muted hover:text-text-main hover:border-[#00FFF0]/40'
                  }`}
                  onClick={() => {
                    setResumeSource(source);
                    if (source !== 'upload') setFile(null);
                    if (source === 'saved' && savedResumes.length > 0 && !selectedResumeId) {
                      setSelectedResumeId(savedResumes[0]._id);
                    }
                  }}
                >
                  {source === 'none' ? 'No Resume' : source === 'saved' ? 'Use Saved' : 'Upload PDF'}
                </button>
              ))}
            </div>

            {resumeSource === 'saved' && (
              resumesLoading ? (
                <div className="flex items-center gap-2 text-xs font-mono text-text-muted p-2.5 rounded border border-[#00FFF0]/15 bg-[#0b1120]/40">
                  <RefreshCw className="spinner text-[#00FFF0]" size={14} />
                  <span>SYNCHRONIZING PROFILES...</span>
                </div>
              ) : savedResumes.length === 0 ? (
                <div className="p-3 border border-[#00FFF0]/15 rounded bg-[#0b1120]/60 text-center text-xs font-mono text-text-muted">
                  No saved resumes found. Upload a new PDF.
                </div>
              ) : (
                <div className="relative">
                  <select
                    className="w-full px-3 py-2.5 rounded bg-[#0b1120] border border-[#00FFF0]/15 text-xs font-mono text-text-main focus:outline-none focus:border-[#00FFF0] transition-all cursor-pointer appearance-none uppercase"
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                  >
                    {savedResumes.map(r => (
                      <option key={r._id} value={r._id} className="bg-[#0b1120]">
                        📁 {r.filename}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted text-[10px]">
                    ▼
                  </div>
                </div>
              )
            )}

            {resumeSource === 'upload' && (
              <div 
                className={`w-full min-h-[140px] rounded border-2 border-dashed flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all duration-300 relative overflow-hidden ${
                  isDragOver 
                    ? 'border-[#00FFF0] bg-[#00FFF0]/5' 
                    : file 
                      ? 'border-[#00FF9D]/40 bg-[#00FF9D]/5' 
                      : 'border-[#00FFF0]/20 bg-[#050816]/50 hover:border-[#00FFF0]/40'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={!file ? triggerFileSelect : undefined}
              >
                <div className="scanner-line opacity-25" />
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept=".pdf" 
                  style={{ display: 'none' }}
                />
                
                {file ? (
                  <div className="flex flex-col items-center gap-2 w-full relative z-10">
                    <FileText size={32} className="text-[#00FF9D] drop-shadow-[0_0_8px_rgba(0,255,157,0.3)]" />
                    <p className="text-xs font-mono font-bold text-text-main truncate max-w-[200px]">{file.name}</p>
                    <button 
                      type="button" 
                      className="px-2 py-1 rounded bg-[#0b1120] hover:border-[#FF4D6D]/45 border border-[#00FFF0]/15 text-[9px] font-heading font-bold text-text-muted hover:text-[#FF4D6D] transition-colors cursor-pointer" 
                      onClick={(e) => { e.stopPropagation(); removeFile(); }}
                    >
                      PURGE
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1.5 relative z-10">
                    <Upload size={24} className="text-text-muted animate-pulse" />
                    <p className="text-xs font-heading font-bold text-text-main uppercase tracking-widest">Drag & Drop PDF or click to browse</p>
                  </div>
                )}
              </div>
            )}

            {resumeSource === 'none' && (
              <div className="p-4 rounded bg-[#00FFF0]/5 border border-[#00FFF0]/15 flex items-start gap-3 animate-fade-in relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent pointer-events-none"></div>
                <Smile size={22} className="text-[#00FFF0] flex-shrink-0 mt-0.5 animate-pulse" />
                <div className="space-y-0.5">
                  <p className="font-heading font-bold text-xs text-text-main uppercase tracking-wider">General Profile Match Mode</p>
                  <p className="text-[9px] font-mono text-text-muted leading-relaxed uppercase mt-0.5">AI will focus questions strictly on the target job role without parsing resume details.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Target role inputs */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-6 cyber-card border border-[#00FFF0]/15 bg-[#0b1120]/60 relative space-y-5">
            <div className="cyber-corner-tr" />
            <div className="cyber-corner-bl" />
            
            <div className="space-y-2">
              <label htmlFor="jobRole" className="text-xs font-heading font-bold text-text-main uppercase tracking-widest">Target Job Role *</label>
              <input
                id="jobRole"
                type="text"
                placeholder="e.g. React Developer, Data Scientist, Product Manager"
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded bg-[#050816] border border-[#00FFF0]/15 text-xs font-mono text-text-main placeholder-text-muted/30 focus:outline-none focus:border-[#00FFF0] transition-all tracking-wider"
              />

              <div className="pt-2 space-y-2">
                <span className="text-[9px] font-heading font-bold text-[#00FFF0] uppercase tracking-wider block">Quick Select Presets:</span>
                <div className="flex flex-wrap gap-1.5">
                  {presetRoles.map(preset => (
                    <button
                      key={preset}
                      type="button"
                      className="px-2.5 py-1 rounded bg-[#0b1120] hover:border-[#00FFF0]/40 border border-[#00FFF0]/15 text-[9px] font-mono text-text-muted hover:text-text-main transition-colors cursor-pointer"
                      onClick={() => setJobRole(preset)}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Difficulty selector for premium feel */}
            <div className="space-y-2 border-t border-[#00FFF0]/10 pt-3">
              <label className="text-xs font-heading font-bold text-text-main uppercase tracking-widest">Select Difficulty</label>
              <div className="flex gap-2">
                {['easy', 'medium', 'hard'].map((level) => (
                  <button
                    key={level}
                    type="button"
                    className={`flex-1 py-1.5 rounded text-[10px] font-heading font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                      difficulty === level
                        ? level === 'easy' ? 'bg-[#00FF9D]/10 border-[#00FF9D] text-[#00FF9D] shadow-[0_0_10px_rgba(0,255,157,0.15)]' : level === 'medium' ? 'bg-[#FFD93D]/10 border-[#FFD93D] text-[#FFD93D] shadow-[0_0_10px_rgba(255,217,61,0.15)]' : 'bg-[#FF4D6D]/10 border-[#FF4D6D] text-[#FF4D6D] shadow-[0_0_10px_rgba(255,77,109,0.15)]'
                        : 'border-[#00FFF0]/15 bg-[#0b1120]/60 text-text-muted hover:text-[#00FFF0]'
                    }`}
                    onClick={() => setDifficulty(level)}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 rounded bg-gradient-to-r from-primary to-accent text-white font-heading font-bold text-xs tracking-widest uppercase shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all cursor-pointer disabled:opacity-50 hover:brightness-110"
              disabled={!jobRole.trim() || (resumeSource === 'upload' && !file)}
            >
              <Sparkles size={14} className="animate-spin-slow" />
              <span>Generate AI Interview Questions</span>
            </button>
          </div>

          <div className="flex items-start gap-2.5 p-4 rounded bg-[#0b1120]/50 border border-[#00FFF0]/15 text-[10px] font-mono text-text-muted leading-relaxed uppercase">
            <Info className="text-[#00FFF0] flex-shrink-0 mt-0.5" size={14} />
            <p>Planner and Interview Agents take around 10-15 seconds to generate custom behavioral and technical scenarios.</p>
          </div>
        </div>

      </form>
    </div>
  );
}
