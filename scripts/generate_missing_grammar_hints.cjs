const fs = require('fs');

const API_KEY = process.env.VITE_GEMINI_API_KEY || 'YOUR_API_KEY_HERE';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${API_KEY}`;

const eviPath = './src/data/tests/evi_german.json';
const hintsPath = './src/data/tests/german_grammar_hints.json';

const eviData = JSON.parse(fs.readFileSync(eviPath, 'utf8'));
let hints = {};
if (fs.existsSync(hintsPath)) {
  hints = JSON.parse(fs.readFileSync(hintsPath, 'utf8'));
}

async function getGrammarHint(questionText, optionsText) {
  const prompt = `You are a German teacher.
Analyze this test question and its options:
Question: ${questionText}
Options: ${optionsText}

Determine if this question tests a specific grammar rule (e.g., prepositions, passive voice, verb conjugation, adjectives, cases).
If it's just pure vocabulary or reading comprehension, reply EXACTLY with "NONE".
If it is a grammar question, provide a short summary of the grammar rule being tested (in Ukrainian, max 1 sentence), and the best link to mein-deutschbuch.de covering this rule.
Format your response exactly like this:
TEXT: [Your short Ukrainian summary]
LINK: [https://mein-deutschbuch.de/...]`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2 }
      })
    });
    
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    if (text.includes('NONE') || !text.includes('LINK:')) {
      return null;
    }
    
    const textPart = text.match(/TEXT:\s*(.+)/)?.[1];
    const linkPart = text.match(/LINK:\s*(https?:\/\/[^\s]+)/)?.[1];
    
    if (textPart && linkPart) {
      return { text: textPart.trim(), link: linkPart.trim() };
    }
  } catch (error) {
    console.error('API Error:', error);
  }
  return null;
}

async function processAll() {
  const questionsToProcess = [];
  
  eviData.sessions.forEach(session => {
    session.questions.forEach(q => {
      if (!hints[q.id]) {
        questionsToProcess.push(q);
      }
    });
  });
  
  console.log(`Found ${questionsToProcess.length} questions without hints. Processing...`);
  
  const batchSize = 10;
  for (let i = 0; i < questionsToProcess.length; i += batchSize) {
    const batch = questionsToProcess.slice(i, i + batchSize);
    console.log(`Processing batch ${i/batchSize + 1} of ${Math.ceil(questionsToProcess.length / batchSize)}`);
    
    const promises = batch.map(async (q) => {
      const optionsText = q.options.map(o => `${o.id}: ${o.text}`).join(', ');
      const hint = await getGrammarHint(q.text, optionsText);
      if (hint) {
        hints[q.id] = hint;
        console.log(`[+] Added hint for ${q.id}: ${hint.text}`);
      } else {
        console.log(`[-] No grammar hint for ${q.id}`);
      }
    });
    
    await Promise.all(promises);
    
    // Save progress after each batch
    fs.writeFileSync(hintsPath, JSON.stringify(hints, null, 2));
    
    // Small delay to prevent rate limiting
    await new Promise(r => setTimeout(r, 1000));
  }
  
  console.log('Done processing all questions.');
}

processAll();
