export const DAILIES_KEY = 'edutest_dailies';

const QUEST_TEMPLATES = [
  { id: 'pass_test', text: 'Пройти 1 будь-який тест', target: 1, type: 'pass_test' },
  { id: 'correct_10', text: 'Дати 10 правильних відповідей', target: 10, type: 'correct_answers' },
  { id: 'score_80', text: 'Пройти тест з результатом 80%+', target: 1, type: 'score_80' },
  { id: 'correct_20', text: 'Дати 20 правильних відповідей', target: 20, type: 'correct_answers' },
  { id: 'pass_efvv', text: 'Пройти тест ЄФВВ', target: 1, type: 'pass_specific', subjectId: 'efvv_it' },
  { id: 'pass_tznk', text: 'Пройти тест ТЗНК', target: 1, type: 'pass_specific', subjectId: 'tznk' },
];

export const getDailies = () => {
  const data = localStorage.getItem(DAILIES_KEY);
  if (data) {
    try { return JSON.parse(data); } catch { return null; }
  }
  return null;
};

const getTodayDate = () => {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

const getYesterdayDate = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};

export const initializeDailies = () => {
  const today = getTodayDate();
  const current = getDailies();
  
  if (!current || current.lastQuestDate !== today) {
    // Generate new quests
    const shuffled = [...QUEST_TEMPLATES].sort(() => 0.5 - Math.random());
    const selectedQuests = shuffled.slice(0, 3).map(q => ({ ...q, progress: 0, completed: false }));
    
    // Update streak logic
    let newStreak = current ? current.streak : 0;
    // If lastLoginDate was not today and not yesterday, break streak
    if (current && current.lastLoginDate !== today && current.lastLoginDate !== getYesterdayDate()) {
      newStreak = 0;
    }
    
    const newData = {
      ...current,
      quests: selectedQuests,
      lastQuestDate: today,
      lastLoginDate: current?.lastLoginDate || '',
      streak: newStreak
    };
    
    localStorage.setItem(DAILIES_KEY, JSON.stringify(newData));
    return newData;
  }
  
  return current;
};

export const processTestResultForDailies = (result) => {
  const dailies = initializeDailies();
  const today = getTodayDate();
  let updated = false;
  
  // Update streak if this is the first test passed today
  if (dailies.lastLoginDate !== today) {
    if (dailies.lastLoginDate === getYesterdayDate()) {
      dailies.streak += 1;
    } else {
      dailies.streak = 1;
    }
    dailies.lastLoginDate = today;
    updated = true;
  }
  
  // Process quests
  dailies.quests.forEach(quest => {
    if (quest.completed) return;
    
    if (quest.type === 'pass_test') {
      quest.progress += 1;
    } else if (quest.type === 'correct_answers') {
      quest.progress += result.score;
    } else if (quest.type === 'score_80') {
      const percentage = (result.score / result.totalQuestions) * 100;
      if (percentage >= 80) quest.progress += 1;
    } else if (quest.type === 'pass_specific') {
      if (result.subjectId === quest.subjectId) quest.progress += 1;
    }
    
    if (quest.progress >= quest.target) {
      quest.progress = quest.target;
      quest.completed = true;
    }
    updated = true;
  });
  
  if (updated) {
    localStorage.setItem(DAILIES_KEY, JSON.stringify(dailies));
  }
  
  return dailies;
};
