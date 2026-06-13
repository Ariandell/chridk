export const DAILIES_KEY = 'edutest_dailies';

// Emoji tags for visual variety
const QUEST_TEMPLATES = [
  // === Pass-based ===
  { id: 'pass_any_1', text: 'Пройти будь-який тест', icon: '📋', color: '#e63946', target: 1, type: 'pass_test' },
  { id: 'pass_any_2', text: 'Пройти 2 тести поспіль', icon: '🔁', color: '#e63946', target: 2, type: 'pass_test' },
  { id: 'pass_efvv', text: 'Пройти тест ЄФВВ', icon: '💻', color: '#e63946', target: 1, type: 'pass_specific', subjectId: 'efvv_it' },
  { id: 'pass_tznk', text: 'Пройти тест ТЗНК', icon: '🧠', color: '#9b5de5', target: 1, type: 'pass_specific', subjectId: 'tznk' },
  { id: 'pass_german', text: 'Пройти тест з Іноземної мови', icon: '🇩🇪', color: '#06d6a0', target: 1, type: 'pass_specific', subjectId: 'evi_german' },
  { id: 'pass_block', text: 'Пройти блок тесту (режим блоків)', icon: '🧩', color: '#f4a261', target: 1, type: 'pass_block' },

  // === Score-based ===
  { id: 'score_70', text: 'Набрати 70%+ в будь-якому тесті', icon: '🥉', color: '#f4a261', target: 1, type: 'score_threshold', threshold: 70 },
  { id: 'score_80', text: 'Набрати 80%+ в будь-якому тесті', icon: '🥈', color: '#ffd166', target: 1, type: 'score_threshold', threshold: 80 },
  { id: 'score_90', text: 'Набрати 90%+ — ти монстр!', icon: '🥇', color: '#06d6a0', target: 1, type: 'score_threshold', threshold: 90 },

  // === Correct answers ===
  { id: 'correct_10', text: 'Дати 10 правильних відповідей', icon: '✅', color: '#06d6a0', target: 10, type: 'correct_answers' },
  { id: 'correct_25', text: 'Дати 25 правильних відповідей', icon: '✅', color: '#06d6a0', target: 25, type: 'correct_answers' },
  { id: 'correct_50', text: 'Дати 50 правильних відповідей за день', icon: '🔥', color: '#e63946', target: 50, type: 'correct_answers' },

  // === Time-based / streak ===
  // (Streak quests removed as they cannot be completed in a single day)

  // === Variety ===
  { id: 'two_subjects', text: 'Пройди тести з 2 різних предметів', icon: '📚', color: '#9b5de5', target: 2, type: 'unique_subjects' },
  { id: 'no_mistakes', text: 'Пройди тест без єдиної помилки (100%)', icon: '🏆', color: '#ffd166', target: 1, type: 'score_threshold', threshold: 100 },
  { id: 'complete_session', text: 'Дай відповідь на всі питання в тесті', icon: '📝', color: '#4cc9f0', target: 1, type: 'full_attempt' },
];

export const getDailies = () => {
  const data = localStorage.getItem(DAILIES_KEY);
  if (data) {
    try { return JSON.parse(data); } catch { return null; }
  }
  return null;
};

const pad = n => n.toString().padStart(2, '0');

const getTodayDate = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const getYesterdayDate = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const normalizeDate = (dStr) => {
  if (!dStr) return '';
  const parts = dStr.split('-');
  if (parts.length !== 3) return dStr;
  return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
};

// Seeded shuffle to keep same quests all day for the same date
const seededShuffle = (arr, seed) => {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const dateSeed = (dateStr) => dateStr.split('-').reduce((acc, n) => acc * 31 + parseInt(n), 0);

export const initializeDailies = () => {
  const today = getTodayDate();
  let current = getDailies();
  
  let lastLogin = current?.lastLoginDate ? normalizeDate(current.lastLoginDate) : '';
  let lastQuest = current?.lastQuestDate ? normalizeDate(current.lastQuestDate) : '';
  let currentStreak = current?.streak || 0;

  // Always update streak on visit
  if (lastLogin !== today) {
    if (lastLogin === getYesterdayDate()) {
      currentStreak += 1;
    } else {
      currentStreak = 1;
    }
    lastLogin = today;
  }

  let needsSave = false;
  let newData = { ...current };

  if (!current || lastQuest !== today || current.quests.some(q => !QUEST_TEMPLATES.find(t => t.id === q.id))) {
    // Same 3 quests all day (seeded by date)
    const shuffled = seededShuffle(QUEST_TEMPLATES, dateSeed(today));
    const selectedQuests = shuffled.slice(0, 3).map(q => ({ ...q, progress: 0, completed: false }));
    
    newData = {
      ...newData,
      quests: selectedQuests,
      lastQuestDate: today,
      uniqueSubjectsToday: []
    };
    needsSave = true;
  }
  
  if (newData.streak !== currentStreak || newData.lastLoginDate !== lastLogin) {
    newData.streak = currentStreak;
    newData.lastLoginDate = lastLogin;
    needsSave = true;
  }

  if (needsSave) {
    localStorage.setItem(DAILIES_KEY, JSON.stringify(newData));
  }
  
  return newData;
};

export const processTestResultForDailies = (result) => {
  const dailies = initializeDailies();
  const today = getTodayDate();
  
  // Track unique subjects seen today
  if (!dailies.uniqueSubjectsToday) dailies.uniqueSubjectsToday = [];
  if (!dailies.uniqueSubjectsToday.includes(result.subjectId)) {
    dailies.uniqueSubjectsToday.push(result.subjectId);
  }

  const percentage = Math.round((result.score / result.totalQuestions) * 100);
  const isBlockSession = result.sessionId && result.sessionId.includes('_block_');
  const allAnswered = result.totalAnswered === result.totalQuestions;
  
  // Process each quest
  dailies.quests.forEach(quest => {
    if (quest.completed) return;
    
    switch (quest.type) {
      case 'pass_test':
        quest.progress += 1;
        break;
      case 'pass_specific':
        if (result.subjectId === quest.subjectId) quest.progress += 1;
        break;
      case 'pass_block':
        if (isBlockSession) quest.progress += 1;
        break;
      case 'correct_answers':
        quest.progress += result.score;
        break;
      case 'score_threshold':
        if (percentage >= quest.threshold) quest.progress += 1;
        break;
      case 'unique_subjects':
        quest.progress = dailies.uniqueSubjectsToday.length;
        break;
      case 'streak_min':
        quest.progress = dailies.streak;
        break;
      case 'full_attempt':
        if (allAnswered) quest.progress += 1;
        break;
    }
    
    if (quest.progress >= quest.target) {
      quest.progress = quest.target;
      quest.completed = true;
    }
  });
  
  localStorage.setItem(DAILIES_KEY, JSON.stringify(dailies));
  return dailies;
};
