export const HISTORY_KEY = 'edutest_history';

// Helper to push history to cloud if token exists
const pushToCloud = async (historyData) => {
  const token = localStorage.getItem('google_token');
  if (!token) return;
  try {
    await fetch('/api/progress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ history: historyData })
    });
  } catch (err) {
    console.error('Background sync failed:', err);
  }
};

// Sync from cloud (called upon login)
export const syncProgressWithCloud = async (token) => {
  if (!token) return;
  try {
    const response = await fetch('/api/progress', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (response.ok) {
      const data = await response.json();
      if (data && data.history && Array.isArray(data.history)) {
        // Merge with local history or just replace?
        // Let's replace for simplicity, assuming cloud is source of truth after login
        if (data.history.length > 0) {
          localStorage.setItem(HISTORY_KEY, JSON.stringify(data.history));
        } else {
          // Cloud is empty, push local to cloud
          const local = getHistory();
          if (local.length > 0) {
            await pushToCloud(local);
          }
        }
      }
    }
  } catch (err) {
    console.error('Failed to sync with cloud:', err);
  }
};

// Save a test result to local storage and sync
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
      answers
    };
    
    history.push(newEntry);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    
    // Background sync
    pushToCloud(history);
    
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
    // Overwrite cloud with empty array if logged in
    pushToCloud([]);
  } catch (error) {
    console.error("Failed to clear history:", error);
  }
};
