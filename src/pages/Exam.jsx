import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, ArrowRight, ArrowLeft, CheckCircle2, XCircle, LogOut, Pause, Play, RefreshCw, Image as ImageIcon, X, ExternalLink } from 'lucide-react';
import efvvData from '../data/tests/efvv_it.json';
import tznkData from '../data/tests/tznk.json';
import eviData from '../data/tests/evi_german.json';
import germanExps from '../data/tests/german_explanations.json';
import germanHints from '../data/tests/german_grammar_hints.json';
import { saveTestResult } from '../utils/history';
import { getImagePath } from '../utils/imagePath';
import GeminiAssistant from '../components/GeminiAssistant';
import TranslatorTooltip from '../components/TranslatorTooltip';
import { playSelectSound } from '../utils/sound';
import { getSessionById } from '../utils/testModes';

const TEST_DATA = {
  efvv_it: efvvData,
  tznk: tznkData,
  evi_german: eviData,
};

// Utility to render links nicely in Persona style
const renderTextWithLinks = (text) => {
  if (!text) return null;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, i) => {
    if (part.match(urlRegex)) {
      return (
        <a 
          key={i} 
          href={part} 
          target="_blank" 
          rel="noopener noreferrer" 
          onClick={(e) => e.stopPropagation()}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
            padding: '0.2rem 0.6rem', margin: '0 0.2rem',
            background: 'var(--bg-secondary)', color: 'var(--accent-primary)',
            border: '2px solid var(--accent-primary)',
            fontWeight: 'bold', fontSize: '0.85rem', textDecoration: 'none',
            verticalAlign: 'middle', transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => { e.currentTarget.style.background = 'var(--accent-primary)'; e.currentTarget.style.color = '#fff'; }}
          onMouseOut={(e) => { e.currentTarget.style.background = 'var(--bg-secondary)'; e.currentTarget.style.color = 'var(--accent-primary)'; }}
        >
          <ExternalLink size={14} /> ПОСИЛАННЯ
        </a>
      );
    }
    return <span key={i}>{part}</span>;
  });
};

const Exam = () => {
  const { subjectId, sessionId } = useParams();
  const navigate = useNavigate();
  
  const subject = TEST_DATA[subjectId];
  const data = getSessionById(subject, sessionId);

  const getInitialProgress = () => {
    try {
      const saved = localStorage.getItem(`exam_progress_${subjectId}_${sessionId}`);
      if (saved) {
        return JSON.parse(saved);
      }
      return null;
    } catch { return null; }
  };
  const savedProgress = getInitialProgress();

  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(savedProgress?.currentQuestionIdx || 0);
  const [showHint, setShowHint] = useState(false);
  const [answers, setAnswers] = useState(savedProgress?.answers || {}); // { questionId: selectedOptionId }
  const [timeLeft, setTimeLeft] = useState(savedProgress?.timeLeft ?? (data ? (data.durationMinutes || 150) * 60 : 0));
  const [isFinished, setIsFinished] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [expandedOptions, setExpandedOptions] = useState({}); // { optionId: boolean }
  const [portalTarget, setPortalTarget] = useState(null);
  const [translationContext, setTranslationContext] = useState(null);

  useEffect(() => {
    if (!data || isFinished) return;
    localStorage.setItem(`exam_progress_${subjectId}_${sessionId}`, JSON.stringify({
      answers,
      currentQuestionIdx,
      timeLeft
    }));
  }, [answers, currentQuestionIdx, timeLeft, subjectId, sessionId, data, isFinished]);

  useEffect(() => {
    setPortalTarget(document.getElementById('header-portal-target'));
  }, []);

  // Reset expanded explanations when question changes
  useEffect(() => {
    setExpandedOptions({});
    setShowHint(false); // Reset hint visibility
    setTranslationContext(null);
  }, [currentQuestionIdx]);

  // Use ref to keep track of the last tick for background tab accuracy
  const lastTickTime = React.useRef(Date.now());
  const answersRef = React.useRef(answers);
  
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    if (!data) {
      navigate('/');
      return;
    }

    lastTickTime.current = Date.now(); // Reset on mount or pause change

    const timer = setInterval(() => {
      const now = Date.now();
      const deltaSecs = (now - lastTickTime.current) / 1000;
      lastTickTime.current = now;

      if (isPaused) {
        return;
      }

      setTimeLeft((prev) => {
        const nextTime = prev - deltaSecs;
        if (nextTime <= 1 && prev > 1) {
          clearInterval(timer);
          // Manually handle finish to avoid stale closure
          setIsFinished(true);
          localStorage.removeItem(`exam_progress_${subjectId}_${sessionId}`);
          
          let score = 0;
          data.questions.forEach(q => {
            const selectedId = answersRef.current[q.id];
            if (selectedId) {
              const option = q.options.find(o => o.id === selectedId);
              if (option && option.isCorrect) score++;
            }
          });
          saveTestResult(subjectId, sessionId, data.title, score, data.questions.length, answersRef.current);
          navigate('/results', { state: { data, answers: answersRef.current, subjectId } });
          return 0;
        }
        return Math.max(0, nextTime);
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [data, navigate, isPaused, subjectId, sessionId]);

  if (!data) return null;

  const currentQuestion = data.questions[currentQuestionIdx];
  const selectedOptionId = answers[currentQuestion.id];
  const isAnswered = !!selectedOptionId;

  useEffect(() => {
    let timeoutId;
    
    const handleSelectionChange = () => {
      clearTimeout(timeoutId);
      
      timeoutId = setTimeout(() => {
        if (!currentQuestion || !answers[currentQuestion.id] || isPaused) return;
        
        const selection = window.getSelection();
        const text = selection.toString().trim();
        
        if (text && text.length > 0) {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          
          if (rect.width > 0) {
            setTranslationContext({
              text,
              x: rect.left + rect.width / 2,
              y: rect.top + window.scrollY,
            });
          }
        }
      }, 500);
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      clearTimeout(timeoutId);
    };
  }, [answers, currentQuestion, isPaused]);

  const handleOptionSelect = (optionId) => {
    if (isAnswered || isPaused) return;
    playSelectSound();
    setAnswers({
      ...answers,
      [currentQuestion.id]: optionId
    });
  };

  const toggleExpansion = (id) => {
    setExpandedOptions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleNext = () => {
    if (currentQuestionIdx < data.questions.length - 1) {
      playSelectSound();
      setCurrentQuestionIdx(currentQuestionIdx + 1);
      setExpandedOptions({});
    }
  };

  const handlePrev = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(currentQuestionIdx - 1);
      setExpandedOptions({});
    }
  };

  const handleFinish = () => {
    setIsFinished(true);
    localStorage.removeItem(`exam_progress_${subjectId}_${sessionId}`);
    
    // Calculate score
    let score = 0;
    data.questions.forEach(q => {
      const selectedId = answers[q.id];
      if (selectedId) {
        const option = q.options.find(o => o.id === selectedId);
        if (option && option.isCorrect) score++;
      }
    });

    saveTestResult(subjectId, sessionId, data.title, score, data.questions.length, answers);
    
    navigate('/results', { state: { data, answers, subjectId } });
  };

  const handleResetTimer = () => {
    if (window.confirm('Ви впевнені, що хочете скинути таймер на початок?')) {
      setTimeLeft((data.durationMinutes || 150) * 60);
      setIsPaused(false);
    }
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="animate-fade-in container" style={{ paddingBottom: '4rem' }}>
      <button 
        className="btn btn-secondary" 
        onClick={() => navigate(`/subject/${subjectId}`)}
        style={{ marginBottom: '1rem' }}
      >
        <LogOut size={18} /> Перервати тест
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.2rem', color: 'var(--accent-primary)' }}>{data.title}</h2>
          <span className="text-secondary" style={{ fontWeight: 'bold' }}>MISSION {currentQuestionIdx + 1} / {data.questions.length}</span>
        </div>
      </div>

      {/* Portal Exam Controls to the Global Header */}
      {portalTarget && createPortal(
        <>
          <GeminiAssistant 
            currentQuestion={currentQuestion} 
            answers={answers} 
            germanExps={germanExps} 
            subjectId={subjectId} 
          />
          {isPaused && (
            <div style={{ color: 'var(--accent-primary)', fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'uppercase' }}>
              ЗАМОРОЖЕНО
            </div>
          )}
          <div className={`timer ${timeLeft < 300 ? 'warning' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: isPaused ? 0.5 : 1, fontSize: '1.1rem', fontWeight: '900', color: 'var(--text-primary)' }}>
            <Clock size={18} />
            {formatTime(timeLeft)}
          </div>
          <button className="btn btn-secondary" onClick={togglePause} title={isPaused ? "Розморозити" : "Заморозити час"} style={{ padding: '0.4rem' }}>
            {isPaused ? <Play size={16} /> : <Pause size={16} />}
          </button>
          <button className="btn btn-secondary" onClick={handleResetTimer} title="Скинути таймер" style={{ padding: '0.4rem' }}>
            <RefreshCw size={16} />
          </button>
        </>,
        portalTarget
      )}

      <div className="question-container glass-panel" style={{ position: 'relative' }}>
        {isPaused && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.95)', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', clipPath: 'polygon(0 0, 100% 2%, 98% 100%, 2% 98%)' }}>
            <Pause size={64} style={{ marginBottom: '1rem', color: 'var(--accent-primary)' }} />
            <h2 style={{ marginBottom: '2rem', color: 'var(--accent-primary)', fontSize: '2.5rem', textTransform: 'uppercase' }}>ЗАМОРОЖЕНО</h2>
            <button className="btn btn-primary" onClick={togglePause}>
              <Play size={18} /> RESUME
            </button>
          </div>
        )}

        {/* Question Tracker Grid */}
        <div className="tracker-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '2px solid var(--border-color)' }}>
          {data.questions.map((q, idx) => {
            const isAnsweredItem = !!answers[q.id];
            let statusClass = 'tracker-unanswered';
            if (isAnsweredItem) {
              const selectedOpt = q.options.find(o => o.id === answers[q.id]);
              if (selectedOpt && selectedOpt.isCorrect) {
                statusClass = 'tracker-correct';
              } else {
                statusClass = 'tracker-wrong';
              }
            }
            if (idx === currentQuestionIdx) {
              statusClass += ' tracker-current';
            }

            return (
              <div 
                key={q.id}
                onClick={() => !isPaused && setCurrentQuestionIdx(idx)}
                className={`tracker-item ${statusClass}`}
                style={{
                  width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: '900', fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s',
                  clipPath: 'polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px)'
                }}
              >
                {idx + 1}
              </div>
            );
          })}
        </div>

        <h3 className="text-gradient" style={{ display: 'inline-block', marginBottom: '1rem', borderBottom: '3px solid var(--accent-primary)', paddingBottom: '0.2rem' }}>ЗАВДАННЯ {currentQuestionIdx + 1}</h3>
        
        {/* Render standard image if it exists (not OCR'd) */}
        {currentQuestion.imageUrl && (
          <div style={{ marginBottom: '1.5rem', textAlign: 'center', background: 'var(--bg-primary)', padding: '1rem', border: '2px solid var(--border-color)' }}>
            <img src={getImagePath(currentQuestion.imageUrl)} alt="Question" style={{ maxWidth: '100%', height: 'auto' }} />
          </div>
        )}

        {/* Pre-answer grammar hint button */}
        {!answers[currentQuestion.id] && germanHints && germanHints[currentQuestion.id] && (
          <div style={{ marginBottom: '1rem' }}>
            <button 
              className="btn btn-secondary clip-diagonal"
              onClick={() => setShowHint(!showHint)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                fontSize: '0.85rem', padding: '0.3rem 0.8rem',
                background: showHint ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                color: showHint ? '#fff' : 'var(--accent-primary)',
                border: '2px solid var(--accent-primary)',
                transition: 'all 0.2s ease'
              }}
            >
              <span style={{ fontWeight: 'bold' }}>💡 ПІДКАЗКА</span>
            </button>
            
            {showHint && (
              <div className="clip-sharp" style={{
                marginTop: '0.5rem', padding: '0.8rem', background: 'var(--bg-secondary)',
                borderLeft: '4px solid var(--accent-primary)',
                fontSize: '0.95rem', animation: 'fadeIn 0.2s ease'
              }}>
                <div style={{ marginBottom: '0.5rem', fontWeight: '500' }}>
                  {germanHints[currentQuestion.id].text}
                </div>
                <a 
                  href={germanHints[currentQuestion.id].link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                    color: 'var(--accent-primary)', fontWeight: 'bold', textDecoration: 'none',
                    fontSize: '0.9rem'
                  }}
                >
                  <ExternalLink size={14} /> Читати правило
                </a>
              </div>
            )}
          </div>
        )}

        <div className="question-text" style={{ fontSize: '1.1rem', fontWeight: '500', marginBottom: '2rem' }}>
          {currentQuestion.text}
          {currentQuestion.originalImageUrl && (
            <div style={{ marginTop: '1rem' }}>
              <div 
                className="btn btn-secondary" 
                role="button"
                style={{ padding: '0.3rem 0.6rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }} 
                onClick={(e) => toggleExpansion('main_scan')}
              >
                <ImageIcon size={14} style={{ marginRight: '0.3rem' }} /> 
                {expandedOptions['main_scan'] ? "СХОВАТИ СКАН" : "ПОКАЗАТИ СКАН"}
              </div>
              {expandedOptions['main_scan'] && (
                <div style={{ marginTop: '0.5rem', background: 'var(--bg-primary)', padding: '0.5rem', border: '2px solid var(--border-color)' }}>
                  <img src={getImagePath(currentQuestion.originalImageUrl)} alt="Original Scan" style={{ maxWidth: '100%', height: 'auto' }} />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="options-list">
          {currentQuestion.options.map((option) => {
            const isSelected = selectedOptionId === option.id;
            let className = "option-btn";
            
            if (isAnswered) {
              if (option.isCorrect) className += " correct";
              else if (isSelected) className += " wrong";
            } else if (isSelected) {
              className += " selected";
            }

            // Filter out the dummy placeholder text that was injected into evi_german.json
            const isDummy = option.explanation && option.explanation.includes("наразі недоступне");
            const validOptionExp = isDummy ? null : option.explanation;
            
            let matchFromExps = null;
            if (germanExps[currentQuestion.id]) {
              if (germanExps[currentQuestion.id][option.id]) {
                matchFromExps = germanExps[currentQuestion.id][option.id];
              } else {
                const expKeys = Object.keys(germanExps[currentQuestion.id]);
                // Try exact match first
                let matchedKey = expKeys.find(k => k.trim() === option.text.trim());
                // If not found, try partial match (sometimes AI trims differently)
                if (!matchedKey) {
                   matchedKey = expKeys.find(k => option.text.includes(k) || k.includes(option.text));
                }
                if (matchedKey) {
                  matchFromExps = germanExps[currentQuestion.id][matchedKey];
                }
              }
            }
            
            const explanationText = validOptionExp || matchFromExps;
            const questionHasExps = validOptionExp || (germanExps[currentQuestion.id] && Object.keys(germanExps[currentQuestion.id]).length > 0);

            return (
              <div key={option.id} className="option-btn-wrapper">
                <div
                  className={className}
                  onClick={() => handleOptionSelect(option.id)}
                  style={{ cursor: (isAnswered || isPaused) ? 'default' : 'pointer' }}
                  role="button"
                >
                  <div className="option-letter">{option.id}</div>
                  <div style={{ flexGrow: 1, textAlign: 'left', whiteSpace: 'pre-wrap' }}>
                    {option.text}
                    
                    {option.imageUrl && (
                      <div style={{ marginTop: '0.5rem', background: 'var(--bg-primary)', padding: '0.5rem', border: '2px solid var(--border-color)', display: 'inline-block' }}>
                        <img src={getImagePath(option.imageUrl)} alt="Option" style={{ maxWidth: '100%', height: 'auto' }} />
                      </div>
                    )}

                    {option.originalImageUrl && (
                      <div style={{ marginTop: '0.5rem' }} onClick={e => e.stopPropagation()}>
                        <div 
                          className="btn btn-secondary" 
                          role="button"
                          style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }} 
                          onClick={(e) => toggleExpansion(`${option.id}_scan`)}
                        >
                          <ImageIcon size={12} style={{ marginRight: '0.3rem' }} /> ОРИГІНАЛ
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* The info 'I' button inline inside the rectangle */}
                  {isAnswered && questionHasExps && (
                    <div 
                      onClick={(e) => { e.stopPropagation(); toggleExpansion(option.id); }}
                      className="clip-badge" style={{
                        width: '24px', height: '24px', display: 'flex', 
                        alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 'bold', fontSize: '14px',
                        cursor: 'pointer', opacity: 0.9
                      }}
                      title="Показати пояснення"
                    >
                      I
                    </div>
                  )}

                  {isAnswered && option.isCorrect && <CheckCircle2 className={(isSelected || option.isCorrect) && questionHasExps ? "" : "ml-auto"} size={24} style={!((isSelected || option.isCorrect) && questionHasExps) ? { marginLeft: 'auto', flexShrink: 0, color: '#fff' } : { flexShrink: 0, color: '#fff' }} />}
                  {isAnswered && isSelected && !option.isCorrect && <XCircle className={(isSelected || option.isCorrect) && questionHasExps ? "" : "ml-auto"} size={24} style={!((isSelected || option.isCorrect) && questionHasExps) ? { marginLeft: 'auto', flexShrink: 0, color: '#fff' } : { flexShrink: 0, color: '#fff' }} />}
                </div>

                {/* Inline Expansion Area for Explanation / Scans */}
                {(expandedOptions[option.id] || expandedOptions[`${option.id}_scan`]) && (
                  <div style={{
                    marginTop: '0.5rem', background: 'var(--bg-primary)', padding: '1rem', 
                    borderLeft: `4px solid ${option.isCorrect ? 'var(--success)' : (isSelected ? 'var(--error)' : 'var(--border-color)')}`,
                    borderBottom: '2px solid var(--border-color)', borderRight: '2px solid var(--border-color)',
                    animation: 'fadeIn 0.2s ease'
                  }}>
                    {expandedOptions[option.id] && questionHasExps && (
                      <div style={{ fontSize: '1.05rem', lineHeight: '1.5', whiteSpace: 'pre-wrap', marginBottom: expandedOptions[`${option.id}_scan`] ? '1rem' : '0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: option.isCorrect ? 'var(--success)' : (isSelected ? 'var(--error)' : 'var(--text-primary)'), fontWeight: 'bold' }}>
                          {option.isCorrect ? <CheckCircle2 size={18} /> : (isSelected ? <XCircle size={18} /> : <div/>)}
                          <span style={{ textTransform: 'uppercase' }}>ПОЯСНЕННЯ</span>
                        </div>
                        {explanationText && renderTextWithLinks(explanationText)}
                        {!explanationText && germanExps[currentQuestion.id] && Object.entries(germanExps[currentQuestion.id]).map(([optId, text]) => (
                          <div key={optId} style={{ marginBottom: '0.5rem' }}>
                            <strong style={{ color: 'var(--accent-primary)' }}>Варіант {optId}:</strong> {renderTextWithLinks(text)}
                          </div>
                        ))}
                      </div>
                    )}
                    {expandedOptions[`${option.id}_scan`] && option.originalImageUrl && (
                      <div style={{ textAlign: 'center' }}>
                        <img src={getImagePath(option.originalImageUrl)} alt="Original Option Scan" style={{ maxWidth: '100%', height: 'auto', border: '2px solid var(--border-color)' }} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="exam-footer" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
        <button 
          className="btn btn-secondary" 
          onClick={handlePrev}
          disabled={currentQuestionIdx === 0 || isPaused}
        >
          <ArrowLeft size={18} /> BACK
        </button>
        
        {currentQuestionIdx === data.questions.length - 1 ? (
          <button className="btn btn-primary" onClick={handleFinish} disabled={isPaused}>
            FINISH <CheckCircle2 size={18} />
          </button>
        ) : (
          <button className="btn btn-primary" onClick={handleNext} disabled={isPaused}>
            NEXT <ArrowRight size={18} />
          </button>
        )}
      </div>

      <TranslatorTooltip context={translationContext} onClose={() => setTranslationContext(null)} />
    </div>
  );
};

export default Exam;
