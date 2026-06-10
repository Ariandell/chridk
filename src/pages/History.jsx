import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHistory, clearHistory } from '../utils/history';
import { ArrowLeft, Trash2, Calendar as CalendarIcon, Skull, CheckCircle2, ChevronRight, X } from 'lucide-react';

const DEADLINE_DATE = '2026-06-26';

const getLocalDateString = (d) => {
  const date = new Date(d);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const getDaysDiff = (startStr, endStr) => {
  const start = new Date(startStr);
  const end = new Date(endStr);
  return Math.round((end - start) / (1000 * 60 * 60 * 24));
};

const addDays = (dateStr, days) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return getLocalDateString(d);
};

const formatDateToDisplay = (dateStr) => {
  const [year, month, day] = dateStr.split('-');
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  return {
    month: months[parseInt(month) - 1],
    day: parseInt(day)
  };
};

const History = () => {
  const [history, setHistory] = useState([]);
  const [historyByDate, setHistoryByDate] = useState({});
  const [timeline, setTimeline] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const navigate = useNavigate();
  const carouselRef = useRef(null);

  const todayStr = getLocalDateString(new Date());

  useEffect(() => {
    const rawHistory = getHistory();
    setHistory(rawHistory);

    // Group by date
    const grouped = {};
    rawHistory.forEach(entry => {
      const dStr = getLocalDateString(entry.date);
      if (!grouped[dStr]) grouped[dStr] = [];
      grouped[dStr].push(entry);
    });
    setHistoryByDate(grouped);

    // Determine timeline start
    let startStr = getLocalDateString(new Date(new Date().setDate(new Date().getDate() - 7))); // Default start 7 days ago
    if (rawHistory.length > 0) {
      const earliest = rawHistory.reduce((min, p) => p.date < min ? p.date : min, rawHistory[0].date);
      const earliestStr = getLocalDateString(earliest);
      if (earliestStr < startStr) {
        startStr = earliestStr;
      }
    }

    // Determine timeline end (at least deadline, or today + 3 days if deadline passed)
    let endStr = DEADLINE_DATE;
    if (todayStr >= DEADLINE_DATE) {
      endStr = addDays(todayStr, 3);
    }

    const totalDays = getDaysDiff(startStr, endStr);
    const newTimeline = [];
    for (let i = 0; i <= totalDays; i++) {
      newTimeline.push(addDays(startStr, i));
    }
    setTimeline(newTimeline);
    setSelectedDate(todayStr); // Select today by default

  }, []);

  // Scroll to today on mount
  useEffect(() => {
    if (carouselRef.current) {
      setTimeout(() => {
        const todayEl = carouselRef.current.querySelector('[data-istoday="true"]');
        if (todayEl) {
          todayEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      }, 300);
    }
  }, [timeline]);

  const handleClear = () => {
    if (window.confirm('Ви впевнені, що хочете видалити всю історію? Ця дія незворотна.')) {
      clearHistory();
      setHistory([]);
      setHistoryByDate({});
    }
  };

  const renderTestsForDate = (dateStr) => {
    const tests = historyByDate[dateStr] || [];
    
    if (tests.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '3rem', border: '2px dashed var(--border-color)', opacity: 0.5 }}>
          <h3>Немає даних за цей день</h3>
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {tests.reverse().map((entry) => {
          const percentage = Math.round((entry.score / entry.totalQuestions) * 100);
          let scoreColor = 'var(--error)';
          if (percentage >= 80) scoreColor = 'var(--success)';
          else if (percentage >= 50) scoreColor = 'var(--accent-yellow)';

          return (
            <div key={entry.id} style={{ 
              background: 'var(--bg-secondary)', 
              padding: '1.5rem',
              clipPath: 'polygon(1% 0, 100% 0, 99% 100%, 0 100%)',
              borderLeft: `6px solid ${scoreColor}`,
              position: 'relative'
            }}>
              {percentage >= 90 && (
                <div style={{ position: 'absolute', top: '10px', right: '10px', color: 'var(--success)', transform: 'rotate(15deg)', opacity: 0.2 }}>
                  <CheckCircle2 size={64} />
                </div>
              )}
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                <div>
                  <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)', fontSize: '1.4rem' }}>{entry.title}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: 'bold' }}>
                    <span style={{ textTransform: 'uppercase', color: 'var(--accent-primary)', background: 'rgba(217, 15, 35, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                      {entry.subjectId}
                    </span>
                    <span>{new Date(entry.date).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: '900', color: scoreColor, textShadow: `2px 2px 0 #000` }}>
                    {entry.score} / {entry.totalQuestions}
                  </div>
                  <div style={{ color: scoreColor, fontWeight: 'bold', fontSize: '1.1rem', textTransform: 'uppercase' }}>{percentage}% Правильно</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem', overflowX: 'hidden' }}>
      <div className="container" style={{ marginBottom: '1rem' }}>
        <button 
          className="btn btn-secondary" 
          onClick={() => navigate('/')}
          style={{ marginBottom: '1rem' }}
        >
          <ArrowLeft size={18} /> На головну
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 className="text-gradient" style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '2.5rem', margin: 0, transform: 'rotate(-2deg)' }}>
            Timeline
          </h1>
          {history.length > 0 && (
            <button className="btn btn-secondary" onClick={handleClear} style={{ color: 'var(--error)', borderColor: 'var(--error)' }}>
              <Trash2 size={18} /> Очистити
            </button>
          )}
        </div>
      </div>

      {/* CALENDAR CAROUSEL */}
      <div style={{ 
        width: '100vw', 
        marginLeft: 'calc(-50vw + 50%)', 
        background: 'repeating-linear-gradient(45deg, #0f0f13, #0f0f13 10px, #1a1a24 10px, #1a1a24 20px)',
        padding: '3rem 0',
        borderTop: '4px solid var(--accent-primary)',
        borderBottom: '4px solid var(--accent-primary)',
        boxShadow: 'inset 0 0 50px rgba(0,0,0,0.8)',
        marginBottom: '3rem'
      }}>
        <div 
          ref={carouselRef}
          style={{ 
            display: 'flex', 
            gap: '1rem', 
            overflowX: 'auto', 
            padding: '1rem 50vw 1rem 2rem', 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none' 
          }}
          className="no-scrollbar"
        >
          {timeline.map((dateStr) => {
            const isToday = dateStr === todayStr;
            const isDeadline = dateStr === DEADLINE_DATE;
            const isPast = dateStr < todayStr;
            const isSelected = dateStr === selectedDate;
            const hasTests = historyByDate[dateStr] && historyByDate[dateStr].length > 0;
            const displayDate = formatDateToDisplay(dateStr);

            // Persona visual logic
            let bg = '#121217';
            let color = 'white';
            let transform = 'skewX(-10deg)';
            let borderColor = '#333';

            if (isDeadline) {
              bg = 'var(--error)';
              color = '#000';
              transform = 'skewX(-10deg) scale(1.1)';
              borderColor = '#000';
            } else if (isSelected) {
              bg = 'white';
              color = '#000';
              borderColor = 'var(--accent-primary)';
            } else if (hasTests) {
              borderColor = 'var(--accent-primary)';
            }

            return (
              <div 
                key={dateStr}
                data-istoday={isToday}
                onClick={() => setSelectedDate(dateStr)}
                style={{ 
                  flexShrink: 0,
                  width: isDeadline ? '160px' : '100px',
                  height: '140px',
                  background: bg,
                  color: color,
                  transform: transform,
                  border: `3px solid ${borderColor}`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected ? '0 0 20px rgba(255,255,255,0.3)' : (isDeadline ? '0 0 30px rgba(217, 15, 35, 0.5)' : '5px 5px 0 rgba(0,0,0,0.5)'),
                  opacity: (isPast && !hasTests && !isSelected) ? 0.4 : 1
                }}
              >
                {/* Red Cross for Past Days */}
                {isPast && !isSelected && !isDeadline && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                    <X size={80} color="rgba(217, 15, 35, 0.4)" strokeWidth={1} />
                  </div>
                )}

                {/* Has Tests Indicator */}
                {hasTests && !isSelected && !isDeadline && (
                  <div style={{ position: 'absolute', top: '-10px', right: '-10px', background: 'var(--accent-primary)', width: '20px', height: '20px', borderRadius: '50%', border: '2px solid #000' }} />
                )}

                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>
                  {displayDate.month}
                </div>
                <div style={{ fontSize: isDeadline ? '4rem' : '3.5rem', fontWeight: '900', lineHeight: '1', textShadow: isSelected ? 'none' : '2px 2px 0 rgba(0,0,0,0.5)' }}>
                  {displayDate.day}
                </div>
                
                {isToday && !isSelected && !isDeadline && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 'bold', marginTop: '0.5rem' }}>TODAY</div>
                )}

                {isDeadline && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', marginTop: '0.5rem', color: '#000', fontWeight: '900' }}>
                    <Skull size={16} /> DEADLINE
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="container">
        {selectedDate && (
          <div className="animate-slide-up">
            <h2 style={{ 
              fontSize: '2.5rem', 
              textTransform: 'uppercase', 
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              color: selectedDate === DEADLINE_DATE ? 'var(--error)' : 'white'
            }}>
              <CalendarIcon size={36} color="var(--accent-primary)" />
              {selectedDate === todayStr ? 'СЬОГОДНІ' : formatDateToDisplay(selectedDate).month + ' ' + formatDateToDisplay(selectedDate).day}
            </h2>
            
            {renderTestsForDate(selectedDate)}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
