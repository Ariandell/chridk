import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import { processTestResultForDailies, getDailies, initializeDailies, DAILIES_KEY } from './dailies';

export const HISTORY_KEY = 'edutest_history';
export const MATERIALS_PROGRESS_KEY = 'edutest_materials_progress';

// Helper to push history to cloud if logged in
const pushToCloud = async (historyData, dailiesData, materialsProgressData) => {
  const user = auth.currentUser;
  if (!user) return;
  try {
    const userRef = doc(db, 'users', user.uid);
    const profile = {
      email: user.email || '',
      displayName: user.displayName || user.email?.split('@')[0] || 'Unknown',
      photoURL: user.photoURL || '',
      lastSync: new Date().toISOString()
    };
    
    const updateData = { profile, history: historyData, dailies: dailiesData };
    if (materialsProgressData) {
      updateData.materialsProgress = materialsProgressData;
    }
    
    await setDoc(userRef, updateData, { merge: true });
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
        const local = getHistory();
        
        // Merge cloud and local history to prevent data loss
        const mergedHistory = [...data.history];
        let hasNewLocalItems = false;
        
        local.forEach(localItem => {
          if (!mergedHistory.find(m => m.id === localItem.id)) {
            mergedHistory.push(localItem);
            hasNewLocalItems = true;
          }
        });

        // Save merged result to local
        localStorage.setItem(HISTORY_KEY, JSON.stringify(mergedHistory));
        
        // If we had local items that weren't in cloud, push the merged array back to cloud
        if (hasNewLocalItems) {
          await pushToCloud(mergedHistory, getDailies(), getMaterialProgress());
        }
      }
      if (data && data.dailies) {
        // Only load dailies from cloud if they are newer or we don't have them
        const localDailies = getDailies();
        if (!localDailies || data.dailies.lastLoginDate >= (localDailies.lastLoginDate || '')) {
           localStorage.setItem(DAILIES_KEY, JSON.stringify(data.dailies));
        }
      }
      
      // Materials progress sync
      if (data && data.materialsProgress) {
        const localProgress = getMaterialProgress();
        // Simple merge: cloud takes precedence for new fields, or just use cloud if local is empty
        const mergedProgress = { ...localProgress, ...data.materialsProgress };
        localStorage.setItem(MATERIALS_PROGRESS_KEY, JSON.stringify(mergedProgress));
      }
      
    } else {
      // Document doesn't exist yet, push local to cloud
      const local = getHistory();
      if (local.length > 0 || getDailies() || Object.keys(getMaterialProgress()).length > 0) {
        await pushToCloud(local, getDailies(), getMaterialProgress());
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
      totalAnswered: answers ? Object.keys(answers).length : 0,
      answers
    };
    
    history.push(newEntry);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    
    // Process dailies
    const newDailies = processTestResultForDailies(newEntry);
    
    // Background sync
    pushToCloud(history, newDailies);
    
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
    pushToCloud([], getDailies());
  } catch (error) {
    console.error("Failed to clear history:", error);
  }
};

// Delete a single history entry
export const deleteHistoryEntry = (id) => {
  try {
    const history = getHistory();
    const updatedHistory = history.filter(entry => entry.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
    pushToCloud(updatedHistory, getDailies(), getMaterialProgress());
    return updatedHistory;
  } catch (error) {
    console.error("Failed to delete history entry:", error);
    return getHistory();
  }
};

// Materials progress
export const getMaterialProgress = () => {
  try {
    const data = localStorage.getItem(MATERIALS_PROGRESS_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error("Failed to get material progress:", error);
    return {};
  }
};

export const saveMaterialProgress = (topicId, blockIndex) => {
  try {
    const progress = getMaterialProgress();
    progress[topicId] = blockIndex;
    localStorage.setItem(MATERIALS_PROGRESS_KEY, JSON.stringify(progress));
    
    // Background sync
    pushToCloud(getHistory(), getDailies(), progress);
    return progress;
  } catch (error) {
    console.error("Failed to save material progress:", error);
  }
};
