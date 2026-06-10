import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { 
  ClipboardList, 
  AlertCircle, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Brain, 
  Trophy, 
  ChevronRight, 
  Play, 
  ArrowLeft, 
  Award, 
  HelpCircle,
  Cpu,
  Layers,
  Flame,
  Terminal,
  Activity
} from 'lucide-react';

export default function Quiz() {
  // Page states: 'setup', 'playing', 'results'
  const [gameState, setGameState] = useState('setup');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Setup forms
  const [quizMode, setQuizMode] = useState('jd'); // 'jd' or 'skills'
  const [jobTitleList, setJobTitleList] = useState([]);
  const [selectedJobTitle, setSelectedJobTitle] = useState('');
  
  const [availableSkills, setAvailableSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [customSkillInput, setCustomSkillInput] = useState('');
  
  const [difficulty, setDifficulty] = useState('Easy');
  const [numQuestions, setNumQuestions] = useState(5);
  
  // Quiz gameplay states
  const [quizData, setQuizData] = useState(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionIndex: selectedOptionString }

  // Fetch report history for setup dropdowns
  const loadSetupData = async () => {
    try {
      const reportData = await api.get('/api/interview/history');
      const reports = reportData.reports || [];
      
      const titles = [...new Set(reports.map(r => r.title || r.jobDescription).filter(Boolean))];
      setJobTitleList(titles);
      if (titles.length > 0) {
        setSelectedJobTitle(titles[0]);
      }
      
      const allGaps = [];
      reports.forEach(r => {
        if (r.skillGaps && Array.isArray(r.skillGaps)) {
          r.skillGaps.forEach(g => {
            if (g.skill) allGaps.push(g.skill);
          });
        }
      });
      const uniqueGaps = [...new Set(allGaps)];
      setAvailableSkills(uniqueGaps);
      if (uniqueGaps.length > 0) {
        setSelectedSkills([uniqueGaps[0]]);
      }
    } catch (err) {
      console.error("Failed to load coaching history for quiz:", err);
    }
  };

  useEffect(() => {
    loadSetupData();
  }, []);

  const handleAddCustomSkill = (e) => {
    e.preventDefault();
    if (!customSkillInput.trim()) return;
    const cleanSkill = customSkillInput.trim();
    if (!selectedSkills.includes(cleanSkill)) {
      setSelectedSkills(prev => [...prev, cleanSkill]);
      if (!availableSkills.includes(cleanSkill)) {
        setAvailableSkills(prev => [...prev, cleanSkill]);
      }
    }
    setCustomSkillInput('');
  };

  const handleToggleSkill = (skill) => {
    setSelectedSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const handleStartQuiz = async (e) => {
    e.preventDefault();
    setError('');

    if (quizMode === 'jd' && !selectedJobTitle) {
      setError('Please select a target job profile.');
      return;
    }
    if (quizMode === 'skills' && selectedSkills.length === 0) {
      setError('Please select or enter at least one skill.');
      return;
    }

    const parsedNum = Number(numQuestions);
    if (isNaN(parsedNum) || parsedNum < 1 || !Number.isInteger(parsedNum)) {
      setError('Please enter a valid positive integer for the number of questions (minimum 1).');
      return;
    }
    if (parsedNum > 30) {
      setError('Please enter a number of questions between 1 and 30.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        mode: quizMode,
        numQuestions: parsedNum,
        difficulty,
        jobTitle: quizMode === 'jd' ? selectedJobTitle : undefined,
        skills: quizMode === 'skills' ? selectedSkills : undefined
      };
      
      const data = await api.post('/api/quiz/generate', payload);
      setQuizData(data.quiz);
      setCurrentQuestionIdx(0);
      setAnswers({});
      setGameState('playing');
    } catch (err) {
      console.error("Failed to start quiz:", err);
      setError(err.message || "Failed to generate quiz questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (option) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestionIdx]: option
    }));
  };

  const handleNext = () => {
    const currentQuestion = quizData.questions[currentQuestionIdx];
    const selected = answers[currentQuestionIdx] || '';
    const correct = currentQuestion.correctAnswer || '';
    const isCorrect = selected.trim().toLowerCase() === correct.trim().toLowerCase();

    if (isCorrect) {
      setDifficulty(prev => {
        if (prev === 'Easy') return 'Medium';
        if (prev === 'Medium') return 'Hard';
        return 'Hard';
      });
    }

    if (currentQuestionIdx < quizData.questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = () => {
    const gradedQuestions = quizData.questions.map((q, idx) => {
      const selected = answers[idx] || '';
      const correct = q.correctAnswer || '';
      return {
        question: q.question,
        options: q.options,
        correctAnswer: correct,
        selectedAnswer: selected,
        isCorrect: selected.trim().toLowerCase() === correct.trim().toLowerCase(),
        explanation: q.explanation
      };
    });

    const lastQuestionGraded = gradedQuestions[currentQuestionIdx];
    let finalDifficulty = difficulty;
    if (lastQuestionGraded && lastQuestionGraded.isCorrect) {
      if (difficulty === 'Easy') finalDifficulty = 'Medium';
      else if (difficulty === 'Medium') finalDifficulty = 'Hard';
    }
    setDifficulty(finalDifficulty);

    const correctCount = gradedQuestions.filter(q => q.isCorrect).length;
    const finalScore = Math.round((correctCount / quizData.questions.length) * 100);

    setQuizData(prev => ({
      ...prev,
      score: finalScore,
      questions: gradedQuestions
    }));
    setGameState('results');
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#00FF9D';
    if (score >= 50) return '#FFD93D';
    return '#FF4D6D';
  };

  // ==========================================
  // RENDER: PLAYING GAME VIEW
  // ==========================================
  if (gameState === 'playing') {
    const currentQuestion = quizData.questions[currentQuestionIdx];
    const totalQuestions = quizData.questions.length;
    const isAnswered = answers[currentQuestionIdx] !== undefined;

    return (
      <div className="space-y-6 max-w-3xl mx-auto pb-16">
        
        {/* Navigation Bar */}
        <div className="flex items-center gap-4">
          <button 
            className="px-4 py-2 rounded bg-[#0b1120] hover:border-[#FF2E9A]/45 border border-[#00FFF0]/15 text-xs font-heading font-bold text-text-muted hover:text-[#FF2E9A] transition-all cursor-pointer flex items-center gap-1 font-mono uppercase"
            onClick={() => {
              if (window.confirm("Exit quiz? Your progress will be lost.")) setGameState('setup');
            }}
          >
            <ArrowLeft size={14} /> 
            <span>&lt; Exit Quiz</span>
          </button>
          
          <h2 className="text-lg font-heading font-bold text-text-main leading-tight truncate uppercase tracking-widest flex-1">
            // {quizData.title || 'COGNITIVE QUIZ'}
          </h2>
        </div>

        {/* Global Progress Indicators */}
        <div className="p-5 cyber-card border border-[#00FFF0]/15 bg-[#0b1120]/60 relative space-y-3">
          <div className="cyber-corner-tr" />
          <div className="cyber-corner-bl" />
          
          <div className="flex justify-between text-xs font-mono font-bold uppercase tracking-wider text-text-main">
            <span>Question Index {currentQuestionIdx + 1} of {totalQuestions}</span>
            <span className="px-2 py-0.5 rounded text-[9px] uppercase font-heading font-black bg-primary/10 border border-primary/20 text-primary">
              DIFFICULTY: {difficulty}
            </span>
          </div>
          <div className="h-2 bg-[#050816] border border-[#00FFF0]/15 rounded-none p-[1px] overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300" 
              style={{ width: `${((currentQuestionIdx + 1) / totalQuestions) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question Panel Card */}
        <div className="p-6 md:p-8 cyber-card border border-[#00FFF0]/15 bg-[#0b1120]/80 relative space-y-6">
          <div className="cyber-corner-tr" />
          <div className="cyber-corner-bl" />
          
          <div className="flex items-start gap-4">
            <HelpCircle className="text-[#00FFF0] flex-shrink-0 mt-0.5 animate-pulse" size={24} />
            <h3 className="text-base md:text-lg font-heading font-bold text-text-main leading-relaxed tracking-wide">
              {currentQuestion.question}
            </h3>
          </div>

          <div className="flex flex-col gap-3.5 pt-4 border-t border-[#00FFF0]/10 font-mono text-xs">
            {currentQuestion.options.map((option, idx) => {
              const letter = String.fromCharCode(65 + idx);
              const isSelected = answers[currentQuestionIdx] === option;
              return (
                <button
                  key={idx}
                  className={`w-full flex items-center text-left gap-4 p-4 rounded border text-xs font-bold transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-[#00FFF0]/5 border-[#00FFF0] text-[#00FFF0] shadow-[0_0_10px_rgba(0,255,240,0.15)]' 
                      : 'border-[#00FFF0]/15 bg-[#050816]/50 text-text-muted hover:text-text-main hover:border-[#00FFF0]/40'
                  }`}
                  onClick={() => handleSelectOption(option)}
                >
                  <span className={`w-7 h-7 rounded text-[10px] font-heading font-black flex items-center justify-center flex-shrink-0 transition-colors ${
                    isSelected ? 'bg-primary text-white border border-primary' : 'bg-[#0b1120] border border-[#00FFF0]/20 text-text-muted'
                  }`}>
                    {letter}
                  </span>
                  <span className="leading-relaxed">{option}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex justify-between items-center gap-4">
          <button 
            className="px-4 py-2.5 rounded bg-[#0b1120] hover:border-[#00FFF0]/45 border border-[#00FFF0]/15 text-xs font-heading font-bold text-text-main hover:text-[#00FFF0] disabled:opacity-30 cursor-pointer transition-all uppercase tracking-wider"
            onClick={handlePrev} 
            disabled={currentQuestionIdx === 0}
          >
            Previous
          </button>
          
          {currentQuestionIdx === totalQuestions - 1 ? (
            <button 
              className="px-6 py-2.5 rounded bg-gradient-to-r from-primary to-accent hover:brightness-110 text-white text-xs font-heading font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all cursor-pointer disabled:opacity-55"
              onClick={handleSubmitQuiz} 
              disabled={loading}
            >
              {loading ? <RefreshCw className="spinner" size={16} /> : 'Submit Quiz'}
            </button>
          ) : (
            <button 
              className="px-6 py-2.5 rounded bg-gradient-to-r from-primary to-accent hover:brightness-110 text-white text-xs font-heading font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all cursor-pointer disabled:opacity-55"
              onClick={handleNext}
              disabled={!isAnswered}
            >
              <span className="flex items-center gap-1.5">
                <span>Next Question</span>
                <ChevronRight size={14} />
              </span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER: COMPLETED GAME RESULTS SCREEN
  // ==========================================
  if (gameState === 'results') {
    const scoreColor = getScoreColor(quizData.score);
    return (
      <div className="space-y-8 max-w-4xl mx-auto pb-16">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#00FFF0]/15 pb-6">
          <h2 className="text-2xl font-heading font-black text-text-main tracking-widest uppercase">Assessment Results</h2>
          <button 
            className="px-5 py-2.5 rounded bg-gradient-to-r from-primary to-accent hover:brightness-110 text-white text-xs font-heading font-bold tracking-widest uppercase shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all cursor-pointer"
            onClick={() => setGameState('setup')}
          >
            Start New Quiz
          </button>
        </div>

        {/* Score Ring Summary Box */}
        <div className="cyber-card p-6 md:p-8 border border-[#00FFF0]/15 bg-[#0b1120]/60 relative flex flex-col sm:flex-row items-center gap-8 justify-center">
          <div className="cyber-corner-tr" />
          <div className="cyber-corner-bl" />
          
          <div className="cyber-progress-circle shadow-md flex-shrink-0" style={{ '--progress': quizData.score, background: `conic-gradient(${scoreColor} calc(var(--progress) * 1%), rgba(255, 255, 255, 0.05) 0)` }}>
            <span className="cyber-progress-text" style={{ color: scoreColor, textShadow: `0 0 8px ${scoreColor}80` }}>{quizData.score}%</span>
          </div>

          <div className="space-y-3 text-center sm:text-left">
            <Trophy className="mx-auto sm:mx-0 animate-bounce" size={32} style={{ color: scoreColor, filter: `drop-shadow(0 0 8px ${scoreColor})` }} />
            <h3 className="text-lg font-heading font-bold text-text-main uppercase tracking-wider">Quiz Completed</h3>
            <p className="text-xs font-mono text-text-muted leading-relaxed max-w-md uppercase mt-1">
              Correctly resolved {quizData.questions.filter(q => q.isCorrect).length} out of {quizData.questions.length} question nodes.
              {quizData.score >= 80 
                ? ' Excellent performance! You demonstrate an exceptional command of these concepts.' 
                : quizData.score >= 50 
                ? ' Commendable attempt, but addressing the minor gaps in review below will strengthen your depth.' 
                : ' Noticeable understanding gaps identified. We recommend revisiting the study resources.'}
            </p>
          </div>
        </div>

        {/* Question Breakdown List */}
        <div className="space-y-6">
          <h3 className="font-heading font-bold text-base text-[#00FFF0] uppercase tracking-widest">Diagnostic Breakdown</h3>
          <div className="space-y-6">
            {quizData.questions.map((q, idx) => (
              <div 
                key={idx} 
                className={`cyber-card p-6 border flex flex-col gap-5 ${
                  q.isCorrect ? 'border-[#00FF9D]/30 bg-[#00FF9D]/5' : 'border-[#FF4D6D]/30 bg-[#FF4D6D]/5'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  {q.isCorrect ? (
                    <CheckCircle size={22} className="text-[#00FF9D] flex-shrink-0 mt-0.5 drop-shadow-[0_0_6px_rgba(0,255,157,0.3)]" />
                  ) : (
                    <XCircle size={22} className="text-[#FF4D6D] flex-shrink-0 mt-0.5 drop-shadow-[0_0_6px_rgba(255,77,109,0.3)]" />
                  )}
                  <h4 className="font-heading font-bold text-sm text-text-main leading-relaxed">
                    Question {idx + 1}: {q.question}
                  </h4>
                </div>

                <div className="grid grid-cols-1 gap-2.5 pl-9 font-mono text-xs">
                  {q.options.map((option, oIdx) => {
                    const letter = String.fromCharCode(65 + oIdx);
                    const isSelected = q.selectedAnswer === option;
                    const isCorrectAnswer = q.correctAnswer === option;
                    
                    let styleClass = 'border-[#00FFF0]/10 bg-[#050816]/50 text-text-muted';
                    if (isCorrectAnswer) styleClass = 'border-[#00FF9D]/35 bg-[#00FF9D]/10 text-[#00FF9D]';
                    else if (isSelected) styleClass = 'border-[#FF4D6D]/35 bg-[#FF4D6D]/10 text-[#FF4D6D]';

                    return (
                      <div 
                        key={oIdx} 
                        className={`flex items-center justify-between p-3 rounded border text-xs font-semibold ${styleClass}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-bold">{letter}</span>
                          <span>{option}</span>
                        </div>
                        {isCorrectAnswer && <span className="px-2.5 py-0.5 rounded text-[8px] bg-[#00FF9D]/20 text-[#00FF9D] uppercase font-bold tracking-widest font-heading">Correct Answer</span>}
                        {isSelected && !isCorrectAnswer && <span className="px-2.5 py-0.5 rounded text-[8px] bg-[#FF4D6D]/20 text-[#FF4D6D] uppercase font-bold tracking-widest font-heading">Your Answer</span>}
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-start gap-2.5 p-3.5 rounded bg-[#050816] border border-[#00FFF0]/10 text-xs text-text-muted leading-relaxed pl-9 font-mono">
                  <Brain size={16} className="text-primary flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <strong className="text-text-main block">Explanation</strong>
                    <p className="text-[11px] font-sans leading-relaxed text-text-muted">{q.explanation}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER: SETUP SCREEN
  // ==========================================
  return (
    <div className="space-y-8 max-w-2xl mx-auto pb-16">
      
      {/* Header Banner */}
      <div className="text-center space-y-3 relative py-4">
        <h1 className="text-4xl font-heading font-black text-text-main tracking-widest uppercase flex items-center justify-center gap-3">
          <Brain className="text-[#00FFF0] animate-pulse" size={32} />
          <span>Interview Prep Quiz</span>
        </h1>
        <p className="text-text-muted font-sans text-xs tracking-wider max-w-xl mx-auto uppercase">
          Test your knowledge with custom quizzes generated by AI based on your target job or skill gaps.
        </p>
        <div className="w-32 h-[1px] bg-gradient-to-r from-transparent via-[#00FFF0] to-transparent mx-auto mt-2" />
      </div>

      {error && (
        <div className="flex items-center gap-2.5 p-4 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="p-8 md:p-12 cyber-card border border-[#00FFF0]/15 bg-[#0b1120]/60 relative text-center glow-primary">
          <div className="cyber-corner-tr" />
          <div className="cyber-corner-bl" />
          
          <div className="text-center w-full max-w-xs mx-auto space-y-6">
            <div className="inline-flex p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 text-[#00FFF0] animate-pulse">
              <Brain size={36} className="spinner text-[#00FFF0]" />
            </div>
            
            <h2 className="text-xl font-heading font-black text-[#00FFF0] uppercase tracking-widest">
              Generating Quiz...
            </h2>
            
            <p className="text-[10px] font-mono text-text-muted uppercase tracking-wider">
              Difficulty: {difficulty} | Questions: {numQuestions}
            </p>
            
            <div className="w-full h-1.5 bg-[#050816] border border-[#00FFF0]/20 rounded-none p-[1px] overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-secondary animate-pulse" style={{ width: '60%' }} />
            </div>
          </div>
        </div>
      ) : (
        <div className="cyber-card p-6 border border-[#00FFF0]/15 bg-[#0b1120]/60 relative">
          <div className="cyber-corner-tr" />
          <div className="cyber-corner-bl" />
          
          <form onSubmit={handleStartQuiz} className="space-y-6">
            <h3 className="font-heading font-bold text-sm text-text-main uppercase tracking-widest">Configure Your Quiz</h3>

            <div className="space-y-2.5">
              <label className="text-xs font-heading font-bold text-text-muted uppercase tracking-widest">Quiz Scope Mode</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  className={`flex-1 py-2.5 rounded text-xs font-heading font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                    quizMode === 'jd' 
                      ? 'bg-[#00FFF0]/10 border-[#00FFF0] text-[#00FFF0] shadow-[0_0_10px_rgba(0,255,240,0.1)]' 
                      : 'border-[#00FFF0]/15 bg-[#0b1120]/60 text-text-muted hover:text-text-main hover:border-[#00FFF0]/40'
                  }`}
                  onClick={() => setQuizMode('jd')}
                >
                  Target Job Profile
                </button>
                <button
                  type="button"
                  className={`flex-1 py-2.5 rounded text-xs font-heading font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                    quizMode === 'skills' 
                      ? 'bg-[#00FFF0]/10 border-[#00FFF0] text-[#00FFF0] shadow-[0_0_10px_rgba(0,255,240,0.1)]' 
                      : 'border-[#00FFF0]/15 bg-[#0b1120]/60 text-text-muted hover:text-text-main hover:border-[#00FFF0]/40'
                  }`}
                  onClick={() => setQuizMode('skills')}
                >
                  Target Skills
                </button>
              </div>
            </div>

            {quizMode === 'jd' ? (
              <div className="space-y-2 animate-fade-in pt-1">
                <label htmlFor="jobTitleSelect" className="text-xs font-heading font-bold text-text-muted uppercase tracking-widest">Select Job Profile *</label>
                {jobTitleList.length === 0 ? (
                  <div className="p-3.5 border border-[#FF4D6D]/30 bg-[#FF4D6D]/5 rounded text-xs font-mono text-[#FF4D6D] uppercase">
                    No analyzed job profiles found. Upload a resume first to extract targets!
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      id="jobTitleSelect"
                      className="w-full px-4 py-3 rounded bg-[#0b1120] border border-[#00FFF0]/15 text-xs font-mono text-text-main focus:outline-none focus:border-[#00FFF0] transition-all cursor-pointer appearance-none uppercase tracking-wider"
                      value={selectedJobTitle}
                      onChange={(e) => setSelectedJobTitle(e.target.value)}
                    >
                      {jobTitleList.map((t, idx) => (
                        <option key={idx} value={t} className="bg-[#0b1120]">{t}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted text-xs">
                      ▼
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in pt-1">
                <label className="text-xs font-heading font-bold text-text-muted uppercase tracking-widest">Select Target Skills *</label>
                
                {availableSkills.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 max-h-[140px] overflow-y-auto p-3 border border-[#00FFF0]/15 rounded bg-[#050816]/70">
                    {availableSkills.map((skill, idx) => (
                      <label key={idx} className="flex items-center gap-2.5 text-xs font-mono text-text-muted cursor-pointer hover:text-text-main transition-colors uppercase">
                        <input
                          type="checkbox"
                          checked={selectedSkills.includes(skill)}
                          onChange={() => handleToggleSkill(skill)}
                          className="rounded-none border-[#00FFF0]/20 bg-[#050816] text-[#00FFF0] focus:ring-0 focus:ring-offset-0"
                        />
                        <span>{skill}</span>
                      </label>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add another skill (e.g. Docker, SQL)..."
                    value={customSkillInput}
                    onChange={(e) => setCustomSkillInput(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded bg-[#050816] border border-[#00FFF0]/15 text-xs font-mono text-text-main placeholder-text-muted/30 focus:outline-none focus:border-[#00FFF0] transition-all uppercase"
                  />
                  <button 
                    type="button" 
                    className="px-4 py-2 rounded bg-[#0b1120] hover:border-[#00FFF0]/40 border border-[#00FFF0]/15 text-xs font-heading font-bold text-text-main hover:text-[#00FFF0] cursor-pointer transition-colors uppercase tracking-wider" 
                    onClick={handleAddCustomSkill}
                  >
                    Add
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2 border-t border-[#00FFF0]/10 pt-4">
              <label htmlFor="numQuestionsInput" className="text-xs font-heading font-bold text-text-muted uppercase tracking-widest">Number of Questions</label>
              <input
                id="numQuestionsInput"
                type="number"
                min="1"
                max="30"
                className="w-full px-4 py-2.5 rounded bg-[#050816] border border-[#00FFF0]/15 text-xs font-mono text-text-main focus:outline-none focus:border-[#00FFF0] transition-all tracking-wider"
                placeholder="Enter number of questions (1-30)"
                value={numQuestions}
                onChange={(e) => setNumQuestions(e.target.value)}
              />
            </div>

            <button 
              type="submit" 
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded bg-gradient-to-r from-primary via-accent to-primary text-white font-heading font-bold text-xs tracking-widest uppercase shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all cursor-pointer disabled:opacity-50 hover:brightness-110"
              disabled={(quizMode === 'jd' && !selectedJobTitle) || (quizMode === 'skills' && selectedSkills.length === 0)}
            >
              <Play size={14} /> 
              <span>Generate & Start Quiz</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
