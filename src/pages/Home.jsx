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
        <div className="glass-panel" style={{ maxWidth: '800px', margin: '0 auto 3rem auto', padding: '2rem', border: '3px solid var(--accent-primary)', clipPath: 'polygon(0 0, 100% 2%, 98% 100%, 2% 98%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '1rem' }}>
            <Target size={28} color="var(--accent-primary)" />
            <h2 style={{ fontSize: '1.8rem', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>Щоденні Завдання</h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {dailies.quests.map((quest) => (
              <div key={quest.id} style={{ background: 'var(--bg-secondary)', padding: '1rem', border: '2px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flexGrow: 1 }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: quest.completed ? 'var(--success)' : 'var(--text-primary)' }}>
                    {quest.text}
                  </h4>
                  <div style={{ background: 'var(--bg-primary)', height: '12px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                    <div style={{ 
                      width: `${Math.min(100, (quest.progress / quest.target) * 100)}%`, 
                      height: '100%', 
                      background: quest.completed ? 'var(--success)' : 'var(--accent-primary)',
                      transition: 'width 0.5s ease'
                    }} />
                  </div>
                </div>
                <div style={{ marginLeft: '1.5rem', fontWeight: '900', fontSize: '1.2rem', minWidth: '80px', textAlign: 'right', color: quest.completed ? 'var(--success)' : 'var(--accent-primary)' }}>
                  {quest.completed ? (
                    <CheckCircle2 size={32} />
                  ) : (
                    `${quest.progress} / ${quest.target}`
                  )}
                </div>
              </div>
            ))}
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
