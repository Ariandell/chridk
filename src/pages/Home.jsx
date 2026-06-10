import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Laptop, BookA, Brain, CalendarDays, Flame } from 'lucide-react';
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

  return (
    <div className="hero-section">
      <h1 className="hero-title">
        Підготовка до <span className="text-gradient">Іспитів</span>
      </h1>
      <p className="hero-subtitle">
        Проходьте тести минулих років з детальними поясненнями до кожного питання.
        Підготуйтесь до ЄВІ, ТЗНК та ЄФВВ на максимальний бал.
      </p>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '3rem' }}>
        <button className="btn btn-primary" onClick={() => navigate('/braindead')} style={{ padding: '1rem 2rem', fontSize: '1.2rem', background: 'var(--accent-primary)' }}>
          <Flame size={24} /> BRAINDEAD MODE
        </button>
        <button className="btn btn-secondary" onClick={() => navigate('/history')} style={{ padding: '1rem 2rem', fontSize: '1.2rem' }}>
          <CalendarDays size={24} /> Історія Тестів
        </button>
      </div>

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
