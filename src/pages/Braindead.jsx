import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Brain, Play } from 'lucide-react';
import efvvData from '../data/tests/efvv_it.json';
import tznkData from '../data/tests/tznk.json';
import eviData from '../data/tests/evi_german.json';

const TEST_DATA = {
  efvv_it: efvvData,
  tznk: tznkData,
  evi_german: eviData,
};

const Braindead = () => {
  const navigate = useNavigate();

  // Combine all tests into one list
  const allTests = [];
  Object.keys(TEST_DATA).forEach(subjectId => {
    const subject = TEST_DATA[subjectId];
    if (subject && subject.sessions) {
      subject.sessions.forEach(session => {
        allTests.push({
          subjectId,
          subjectTitle: subject.title,
          ...session
        });
      });
    }
  });

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: '4rem' }}>
      <button 
        className="btn btn-secondary" 
        onClick={() => navigate('/')}
        style={{ marginBottom: '2rem' }}
      >
        <ArrowLeft size={18} /> На головну
      </button>

      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <Brain size={64} style={{ color: 'var(--accent-primary)', marginBottom: '1rem' }} />
        <h1 className="text-gradient" style={{ fontSize: '3rem' }}>BRAINDEAD MODE</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', fontWeight: 'bold' }}>АБСОЛЮТНО ВСІ ТЕСТИ В ОДНОМУ МІСЦІ</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {allTests.map((test, index) => (
          <div key={`${test.subjectId}-${test.id}`} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', marginBottom: 0 }}>
            <div style={{ color: 'var(--accent-primary)', fontWeight: '900', fontSize: '0.8rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
              {test.subjectTitle}
            </div>
            <h3 style={{ flexGrow: 1, marginBottom: '1.5rem', fontSize: '1.1rem' }}>{test.title}</h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                {test.questions.length} питань
              </div>
              <button 
                className="btn btn-primary" 
                onClick={() => navigate(`/exam/${test.subjectId}/${test.id}`)}
                style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
              >
                <Play size={16} /> ПОЧАТИ
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Braindead;
