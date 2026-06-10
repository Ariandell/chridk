import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, ArrowLeft } from 'lucide-react';
import efvvData from '../data/tests/efvv_it.json';
import tznkData from '../data/tests/tznk.json';
import eviData from '../data/tests/evi_german.json';

const TEST_DATA = {
  efvv_it: efvvData,
  tznk: tznkData,
  evi_german: eviData,
};

const Subject = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const subject = TEST_DATA[subjectId];

  if (!subject) return null;

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '4rem' }}>
      <button 
        className="btn btn-secondary" 
        onClick={() => navigate('/')}
        style={{ marginBottom: '2rem' }}
      >
        <ArrowLeft size={18} /> Назад до предметів
      </button>

      <h1 className="hero-title" style={{ fontSize: '2.5rem', textAlign: 'left', marginBottom: '1rem' }}>
        {subject.title}
      </h1>
      <p className="text-secondary mb-8">{subject.description}</p>

      <div className="subjects-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
        {subject.sessions && subject.sessions.map((session) => (
          <div key={session.id} className="subject-card glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>{session.title}</h3>
            
            <div className="subject-meta" style={{ marginBottom: '1.5rem' }}>
              <span className="meta-item">
                <Clock size={16} /> {session.durationMinutes} хв
              </span>
              <span className="meta-item">
                📝 {session.questions.length} питань
              </span>
            </div>
            
            <button 
              className="btn btn-primary"
              style={{ width: '100%' }}
              onClick={() => navigate(`/exam/${subjectId}/${session.id}`)}
            >
              Пройти тест
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Subject;
