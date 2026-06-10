export const getSessionsForSubject = (subject, isBlockMode = false) => {
  if (!subject) return [];
  if (!isBlockMode) return subject.sessions;

  const result = [];
  const CHUNK_SIZE = 30;
  // Threshold is set to 50 so we don't unnecessarily split tests that are slightly above 30 (like 42).
  const MIN_QUESTIONS_FOR_SPLIT = 50; 

  subject.sessions.forEach(session => {
    if (session.questions && session.questions.length > MIN_QUESTIONS_FOR_SPLIT) {
      for (let i = 0; i < session.questions.length; i += CHUNK_SIZE) {
        const chunk = session.questions.slice(i, i + CHUNK_SIZE);
        const blockIndex = Math.floor(i / CHUNK_SIZE) + 1;
        const proportionalDuration = Math.ceil((session.durationMinutes / session.questions.length) * chunk.length);
        
        result.push({
          ...session,
          id: `${session.id}_block_${blockIndex}`,
          title: `${session.title} (Блок ${blockIndex})`,
          questions: chunk,
          durationMinutes: proportionalDuration,
          originalId: session.id
        });
      }
    } else {
      result.push(session);
    }
  });

  return result;
};

export const getSessionById = (subject, sessionId) => {
  if (!subject) return null;
  
  // Try finding it directly first
  const directSession = subject.sessions.find(s => s.id === sessionId);
  if (directSession) return directSession;

  // If not found directly, it might be a block session.
  // We generate the blocks and look for it.
  if (sessionId.includes('_block_')) {
    const blockSessions = getSessionsForSubject(subject, true);
    return blockSessions.find(s => s.id === sessionId) || null;
  }

  return null;
};
