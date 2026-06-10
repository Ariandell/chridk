import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Laptop, BookA, Brain, CalendarDays, Flame, Target, CheckCircle2 } from 'lucide-react';
import { initializeDailies } from '../utils/dailies';
import efvvData from '../data/tests/efvv_it.json';
import tznkData from '../data/tests/tznk.json';
import eviData from '../data/tests/evi_german.json';

const SUBJECTS = [
  {
    id: 'efvv_it',
    data: efvvData,
    icon: Laptop,
    color: 'var(--accent-primary)'
  },
  {
    id: 'tznk',
    data: tznkData,
    icon: Brain,
    color: 'var(--accent-secondary)'
  },
  {
    id: 'evi_german',
    data: eviData,
    icon: BookA,
    color: 'var(--success)'
  }
];

const Home = () => {
  const navigate = useNavigate();
  const [dailies, setDailies] = useState(null);

  useEffect(() => {
    setDailies(initializeDailies());
  }, []);

  return (
    <div className="hero-section">
      <h1 className="hero-title">
        Підготовка до <span className="text-gradient">Іспитів</span>
      </h1>
      <p className="hero-subtitle">
        Проходьте тести минулих років з детальними поясненнями до кожного питання.
        Підготуйтесь до ЄВІ, ТЗНК та ЄФВВ на максимальний бал.
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', marginBottom: '3rem' }}>
        <button className="btn btn-primary" onClick={() => navigate('/braindead')} style={{ padding: '1rem 2rem', fontSize: '1.2rem', background: 'var(--accent-primary)' }}>
          <Flame size={24} /> BRAINDEAD MODE
        </button>
        <button className="btn btn-secondary" onClick={() => navigate('/history')} style={{ padding: '1rem 2rem', fontSize: '1.2rem' }}>
          <CalendarDays size={24} /> Історія Тестів
        </button>
      </div>

      {dailies && dailies.quests && dailies.quests.length > 0 && (
        <div style={{ maxWidth: '800px', margin: '0 auto 4rem auto', position: 'relative' }}>
          {/* Persona-style background accent */}
          <div style={{ position: 'absolute', top: '-10px', left: '-10px', right: '10px', bottom: '10px', background: 'var(--accent-primary)', clipPath: 'polygon(2% 0, 100% 4%, 98% 100%, 0 96%)', zIndex: 0 }} />
          
          <div style={{ position: 'relative', zIndex: 1, background: '#121217', padding: '2rem', clipPath: 'polygon(0 0, 100% 2%, 99% 100%, 1% 98%)', border: '2px solid var(--text-primary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '2rem' }}>
              <div style={{ background: 'var(--accent-primary)', padding: '0.5rem', clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'rotate(-10deg)' }}>
                <Target size={28} color="#000" />
              </div>
              <h2 style={{ fontSize: '2rem', margin: 0, textTransform: 'uppercase', fontWeight: '900', letterSpacing: '2px', textShadow: '2px 2px 0 var(--accent-primary)', transform: 'rotate(-2deg)' }}>Щоденні Завдання</h2>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {dailies.quests.map((quest) => (
                <div key={quest.id} style={{ 
                  background: quest.completed ? 'rgba(6, 214, 160, 0.1)' : 'var(--bg-secondary)', 
                  padding: '1.2rem', 
                  border: `2px solid ${quest.completed ? 'var(--success)' : 'var(--border-color)'}`, 
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  clipPath: 'polygon(0 0, 100% 0, 99% 100%, 1% 100%)',
                  transition: 'all 0.3s ease'
                }}>
                  <div style={{ fontSize: '2rem', filter: quest.completed ? 'none' : 'grayscale(100%)', opacity: quest.completed ? 1 : 0.7 }}>
                    {quest.icon || '🎯'}
                  </div>
                  
                  <div style={{ flexGrow: 1 }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: quest.completed ? 'var(--success)' : 'var(--text-primary)', textDecoration: quest.completed ? 'line-through' : 'none' }}>
                      {quest.text}
                    </h4>
                    
                    {!quest.completed && (
                      <div style={{ background: 'var(--bg-primary)', height: '14px', borderRadius: '0', overflow: 'hidden', border: '1px solid var(--border-color)', transform: 'skewX(-15deg)' }}>
                        <div style={{ 
                          width: `${Math.min(100, (quest.progress / quest.target) * 100)}%`, 
                          height: '100%', 
                          background: quest.color || 'var(--accent-primary)',
                          transition: 'width 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                        }} />
                      </div>
                    )}
                  </div>
                  
                  <div style={{ fontWeight: '900', fontSize: '1.4rem', minWidth: '70px', textAlign: 'right', color: quest.completed ? 'var(--success)' : (quest.color || 'var(--accent-primary)'), transform: 'rotate(2deg)' }}>
                    {quest.completed ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.3rem' }}>
                        <CheckCircle2 size={28} />
                      </div>
                    ) : (
                      `${quest.progress} / ${quest.target}`
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="subjects-grid">
        {SUBJECTS.map((subject) => {
          const Icon = subject.icon;
          return (
            <div key={subject.id} className="subject-card glass-panel">
              <div className="subject-icon" style={{ color: subject.color }}>
                <Icon size={24} />
              </div>
              <h2 className="subject-title">{subject.data.title}</h2>
              <p className="subject-desc">{subject.data.description}</p>
              
              <div className="subject-meta">
                <span className="meta-item">
                  ⏱️ {subject.data.sessions?.[0]?.durationMinutes || 150} хв
                </span>
                <span className="meta-item">
                  📝 {subject.data.sessions?.reduce((acc, s) => acc + s.questions.length, 0) || 0} питань загалом
                </span>
              </div>
              
              <button 
                className="btn btn-primary"
                style={{ width: '100%' }}
                onClick={() => navigate(`/subject/${subject.id}`)}
              >
                Вибрати іспит
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Home;
