export const HISTORY_KEY = 'edutest_history';

// Save a test result to local storage
export const saveTestResult = (subjectId, sessionId, title, score, totalQuestions, answers) => {
  try {
    const history = getHistory();
    const newEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      subjectId,
      sessionId,
      title,
      score,
      totalQuestions,
      answers // optionally save answers if the user wants to review exactly what they did
    };
    
    history.push(newEntry);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    return newEntry;
  } catch (error) {
    console.error("Failed to save history:", error);
  }
};

// Get all history
export const getHistory = () => {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to get history:", error);
    return [];
  }
};

// Clear history
export const clearHistory = () => {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error("Failed to clear history:", error);
  }
};
