import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, RotateCcw } from 'lucide-react';

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state;

  if (!state || !state.data || !state.answers) {
    return (
      <div className="results-container">
        <h2>Немає даних для відображення</h2>
        <button className="btn btn-primary mt-4" onClick={() => navigate('/')}>
          На головну
        </button>
      </div>
    );
  }

  const { data, answers } = state;
  let correctCount = 0;
  
  data.questions.forEach((q) => {
    const selectedOptionId = answers[q.id];
    const correctOption = q.options.find(o => o.isCorrect);
    if (selectedOptionId === correctOption.id) {
      correctCount++;
    }
  });

  const percentage = Math.round((correctCount / data.questions.length) * 100);

  return (
    <div className="results-container animate-fade-in">
      <h2>Результати: {data.title}</h2>
      <p className="text-secondary mb-8">Ваш результат проходження тесту</p>
      
      <div className="score-circle">
        {percentage}%
      </div>
      
      <h3 className="mb-4">
        Правильних відповідей: {correctCount} з {data.questions.length}
      </h3>
      
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
        <button className="btn btn-secondary" onClick={() => navigate(`/exam/${state.subjectId}/${data.id}`)}>
          <RotateCcw size={18} /> Спробувати ще раз
        </button>
        <button className="btn btn-primary" onClick={() => navigate(`/subject/${state.subjectId}`)}>
          <Home size={18} /> До списку тестів
        </button>
      </div>
    </div>
  );
};

export default Results;
