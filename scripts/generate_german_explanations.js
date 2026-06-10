import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = process.env.VITE_GEMINI_API_KEY || 'YOUR_API_KEY_HERE';
// Switch to 3.1-flash-lite which has 500 requests/day limit
const URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const grammarLinksPath = path.join(__dirname, '../src/data/grammar_links.json');
let grammarLinks = [];
if (fs.existsSync(grammarLinksPath)) {
  grammarLinks = JSON.parse(fs.readFileSync(grammarLinksPath, 'utf8'));
}
const grammarLinksContext = grammarLinks.map(g => `${g.title}: ${g.url}`).join('\n');

async function generateExplanations(question) {
  const optionsText = question.options.map(o => `${o.id}: ${o.text}`).join('\n');
  const correctOption = question.options.find(o => o.isCorrect)?.id || 'Невідомо';

  const prompt = `Ти супер-експерт та викладач німецької мови рівня C2. Твоя ціль - допомогти студенту підготуватися до іспиту (ЄВІ в магістратуру).
Ось завдання з іспиту:
Текст питання:
${question.text}

Варіанти відповідей:
${optionsText}

Правильна відповідь: ${correctOption}

Завдання:
1. Напиши детальне, але дуже зрозуміле пояснення українською мовою для КОЖНОГО варіанту. Поясни чому неправильні є неправильними, а правильний - правильним.
2. Якщо це питання на перевірку граматики, лексики або структури речення, ОБОВ'ЯЗКОВО додай після свого пояснення конкретне посилання на сайт https://mein-deutschbuch.de. 
Ось список існуючих статей з цього сайту:
${grammarLinksContext}

Обери найбільш релевантне посилання з цього списку (якщо підходить) і додай його до пояснення правильної відповіді або тих відповідей, де це необхідно. Якщо це просто питання на розуміння тексту, посилання можна не давати.

Формат відповіді ТІЛЬКИ JSON:
{
  "${question.options[0].id}": "пояснення + посилання (якщо потрібно)...",
  "${question.options[1].id}": "пояснення + посилання (якщо потрібно)..."
}`;

  try {
    const response = await axios.post(
      URL,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json"
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': API_KEY
        }
      }
    );

    const textRes = response.data.candidates[0].content.parts[0].text;
    const result = JSON.parse(textRes);
    return result;
  } catch (error) {
    console.error(`API Error for question ${question.id}:`, error?.response?.data || error.message);
    return null;
  }
}

async function runGermanExplanations() {
  const filePath = path.join(__dirname, '../src/data/tests/evi_german.json');
  console.log(`Processing German Explanations...`);
  
  if (!fs.existsSync(filePath)) return;
  const fileData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  for (const session of fileData.sessions || []) {
    for (const question of session.questions || []) {
      // Check if it already has explanations or if there are no options
      if (!question.options || question.options.length === 0) continue;
      
      const needsExplanation = question.options.some(o => 
        !o.explanation || o.explanation.includes('недоступне')
      );

      if (!needsExplanation) continue;

      console.log(`Generating explanation for German question ${question.id}...`);
      
      let retries = 5;
      let exps = null;
      while (retries > 0 && !exps) {
        exps = await generateExplanations(question);
        if (!exps) {
          retries--;
          console.log(`Rate limit hit or error. Waiting 30 seconds before retry... (${retries} left)`);
          await delay(30000); 
        }
      }

      if (exps) {
        for (const option of question.options) {
          if (exps[option.id]) {
            option.explanation = exps[option.id];
          }
        }
        // Save intermediate progress
        fs.writeFileSync(filePath, JSON.stringify(fileData, null, 2));
      } else {
        console.log(`Failed to generate for ${question.id} after retries. Aborting.`);
        process.exit(1);
      }

      // Respect rate limit (15 RPM = 1 request every 4 seconds)
      await delay(4100);
    }
  }

  console.log(`Finished German Explanations!`);
}

runGermanExplanations();
