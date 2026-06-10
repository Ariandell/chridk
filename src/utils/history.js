import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from './firebase';

export const HISTORY_KEY = 'edutest_history';

// Helper to push history to cloud if logged in
const pushToCloud = async (historyData) => {
  const user = auth.currentUser;
  if (!user) return;
  try {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, { history: historyData }, { merge: true });
  } catch (err) {
    console.error('Background sync failed:', err);
  }
};

// Sync from cloud (called upon login)
export const syncProgressWithCloud = async (uid) => {
  if (!uid) return;
  try {
    const userRef = doc(db, 'users', uid);
    const docSnap = await getDoc(userRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data && data.history && Array.isArray(data.history)) {
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
    } else {
      // Document doesn't exist yet, push local to cloud
      const local = getHistory();
      if (local.length > 0) {
        await pushToCloud(local);
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
