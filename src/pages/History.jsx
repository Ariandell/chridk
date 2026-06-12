import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHistory, clearHistory, deleteHistoryEntry } from '../utils/history';
import { ArrowLeft, Trash2, Calendar as CalendarIcon, Skull, CheckCircle2, ChevronRight, X } from 'lucide-react';
import calendarBg from '../assets/persona-5-calendar-background-ripped-from-the-ps4-ver-and-v0-e_WvRTzU3h8NRiSkXxtrDzSxL89fFBwXiSA-wTmvSCI.webp';
import daggerImg from '../assets/pngegg.png';

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
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const d = new Date(dateStr);
  return {
    month: months[parseInt(month) - 1],
    day: parseInt(day),
    weekday: days[d.getDay()]
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

  const handleDeleteEntry = (id) => {
    if (window.confirm('Видалити цей запис?')) {
      const updated = deleteHistoryEntry(id);
      setHistory(updated);
      
      const grouped = {};
      updated.forEach(entry => {
        const dStr = getLocalDateString(entry.date);
        if (!grouped[dStr]) grouped[dStr] = [];
        grouped[dStr].push(entry);
      });
      setHistoryByDate(grouped);
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
            <div key={entry.id} className="persona-card" style={{ 
              padding: '1.5rem',
              borderLeft: `6px solid ${scoreColor}`
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
                    <span className="clip-diagonal" style={{ textTransform: 'uppercase', color: 'var(--accent-primary)', background: 'rgba(217, 15, 35, 0.1)', padding: '0.2rem 0.6rem' }}>
                      {entry.subjectId}
                    </span>
                    <span>{new Date(entry.date).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: '900', color: scoreColor, textShadow: `2px 2px 0 #000`, whiteSpace: 'nowrap' }}>
                    {entry.score} / {entry.totalQuestions}
                  </div>
                  <div style={{ color: scoreColor, fontWeight: 'bold', fontSize: '1.1rem', textTransform: 'uppercase' }}>{percentage}% Правильно</div>
                </div>
              </div>
              
              <button 
                onClick={() => handleDeleteEntry(entry.id)}
                style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', opacity: 0.6, zIndex: 5 }}
                title="Видалити запис"
                onMouseOver={(e) => e.currentTarget.style.opacity = 1}
                onMouseOut={(e) => e.currentTarget.style.opacity = 0.6}
              >
                <Trash2 size={20} />
              </button>
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
        backgroundImage: `url(${calendarBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '1rem 0 5rem 0',
        borderTop: '5px solid #000',
        borderBottom: '5px solid #000',
        boxShadow: 'inset 0 0 100px rgba(0,0,0,1)',
        marginBottom: '3rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Dark overlay for readability */}
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 0 }} />

        <div 
          ref={carouselRef}
          style={{ 
            display: 'flex', 
            gap: '1rem', 
            overflowX: 'auto', 
            padding: '8rem 50vw 2rem 2rem', 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
            position: 'relative',
            zIndex: 1,
            alignItems: 'center'
          }}
          className="no-scrollbar"
        >
          {timeline.map((dateStr, index) => {
            const isToday = dateStr === todayStr;
            const isDeadline = dateStr === DEADLINE_DATE;
            const isPast = dateStr < todayStr;
            const isSelected = dateStr === selectedDate;
            const hasTests = historyByDate[dateStr] && historyByDate[dateStr].length > 0;
            const displayDate = formatDateToDisplay(dateStr);

            // Persona visual logic
            let bg = 'white';
            let color = 'black';
            let dateColor = 'black';
            let transform = `skewX(-10deg) translateY(${index % 2 === 0 ? '-15px' : '15px'}) rotate(${index % 2 === 0 ? '-2deg' : '2deg'})`;
            let outline = '3px solid #000';

            if (isDeadline) {
              bg = '#fff';
              color = '#000';
              dateColor = 'var(--error)'; // Red number for deadline
              transform = `skewX(-12deg) scale(1.3) translateY(${index % 2 === 0 ? '-15px' : '15px'}) rotate(-5deg)`;
              outline = '4px solid #000';
            } else if (isToday) {
              dateColor = '#4cc9f0'; // Blue for today like in the screenshot
              transform = `skewX(-10deg) scale(1.2) translateY(${index % 2 === 0 ? '-15px' : '15px'})`;
              outline = '4px solid #000';
            } else if (isPast) {
              bg = '#ddd'; // Grayish out past
              dateColor = '#333';
            }

            return (
              <div 
                key={dateStr}
                data-istoday={isToday}
                onClick={() => setSelectedDate(dateStr)}
                style={{ 
                  flexShrink: 0,
                  width: isDeadline ? '180px' : (isToday ? '160px' : '130px'),
                  height: '140px',
                  background: bg,
                  color: color,
                  transform: transform,
                  boxShadow: '8px 8px 0px rgba(0,0,0,1)',
                  border: outline,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.2s ease',
                  opacity: (isPast && !hasTests && !isSelected) ? 0.6 : 1,
                  zIndex: isSelected ? 10 : (isToday || isDeadline ? 5 : 1)
                }}
              >
                {/* Sword for TODAY */}
                {isToday && (
                  <div style={{ position: 'absolute', top: '-100px', right: '-70px', transform: 'rotate(-10deg)', zIndex: 10, pointerEvents: 'none', filter: 'drop-shadow(8px 8px 0px rgba(0,0,0,0.8))' }}>
                    <img src={daggerImg} alt="Dagger" style={{ width: '130px', height: 'auto', objectFit: 'contain' }} />
                  </div>
                )}

                {/* Has Tests Indicator */}
                {hasTests && !isSelected && !isDeadline && (
                  <div className="clip-badge" style={{ position: 'absolute', top: '-15px', right: '-15px', background: 'var(--accent-primary)', width: '30px', height: '30px', border: '3px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '900', fontSize: '1rem', transform: 'rotate(15deg)' }}>
                    !
                  </div>
                )}

                {/* Date Content */}
                <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                  <div style={{ fontSize: '1rem', fontWeight: '900', color: '#000', marginBottom: '-10px', textShadow: '1px 1px 0 #fff' }}>
                    {displayDate.month}
                  </div>
                  
                  <div style={{ fontSize: isDeadline ? '5.5rem' : (isToday ? '5rem' : '4rem'), fontWeight: '900', lineHeight: '1', color: dateColor, letterSpacing: '-2px', textShadow: '2px 2px 0px #000, -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff' }}>
                    {displayDate.day}
                  </div>
                  
                  <div style={{ 
                    background: '#000', 
                    color: '#fff', 
                    width: '100%', 
                    textAlign: 'center', 
                    padding: '0.2rem 0', 
                    marginTop: '0.5rem',
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    letterSpacing: '1px'
                  }}>
                    {displayDate.weekday}
                  </div>
                </div>

                {/* Selected Overlay */}
                {isSelected && (
                  <div style={{ position: 'absolute', inset: 0, border: '6px solid var(--accent-primary)', pointerEvents: 'none', zIndex: 5 }} />
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
