import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHistory, clearHistory } from '../utils/history';
import { ArrowLeft, Trash2, Calendar, CheckCircle2 } from 'lucide-react';

const History = () => {
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setHistory(getHistory().reverse()); // Show newest first
  }, []);

  const handleClear = () => {
    if (window.confirm('Ви впевнені, що хочете видалити всю історію?')) {
      clearHistory();
      setHistory([]);
    }
  };

  const formatDate = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleString('uk-UA', { 
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: '4rem' }}>
      <button 
        className="btn btn-secondary" 
        onClick={() => navigate('/')}
        style={{ marginBottom: '2rem' }}
      >
        <ArrowLeft size={18} /> На головну
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="text-gradient">Історія Тестувань</h1>
        {history.length > 0 && (
          <button className="btn btn-secondary" onClick={handleClear} style={{ color: 'var(--error)', borderColor: 'var(--error)' }}>
            <Trash2 size={18} /> Очистити
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <h2 style={{ color: 'var(--text-secondary)' }}>Ви ще не пройшли жодного тесту.</h2>
          <button className="btn btn-primary mt-4" onClick={() => navigate('/')}>Почати тестування</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {history.map((entry) => {
            const percentage = Math.round((entry.score / entry.totalQuestions) * 100);
            let scoreColor = 'var(--error)';
            if (percentage >= 80) scoreColor = 'var(--success)';
            else if (percentage >= 50) scoreColor = 'var(--accent-yellow)';

            return (
              <div key={entry.id} className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0', padding: '1.5rem' }}>
                <div>
                  <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{entry.title}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 'bold' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Calendar size={14}/> {formatDate(entry.date)}</span>
                    <span style={{ textTransform: 'uppercase', color: 'var(--accent-primary)' }}>{entry.subjectId}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '2rem', fontWeight: '900', color: scoreColor }}>
                    {entry.score} / {entry.totalQuestions}
                  </div>
                  <div style={{ color: scoreColor, fontWeight: 'bold' }}>{percentage}% Правильно</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default History;
