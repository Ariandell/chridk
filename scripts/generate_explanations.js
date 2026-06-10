import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_KEY = process.env.VITE_GEMINI_API_KEY || 'YOUR_API_KEY_HERE';
const URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function generateExplanations(question) {
  const optionsText = question.options.map(o => `${o.id}: ${o.text}`).join('\n');
  const correctOption = question.options.find(o => o.isCorrect)?.id || 'Невідомо';

  const prompt = `Ти експерт-викладач. Поясни завдання для студента.
Питання:
${question.text}

Варіанти відповідей:
${optionsText}

Правильна відповідь: ${correctOption}

Завдання: Напиши коротке (1-2 речення) і чітке пояснення українською мовою для КОЖНОГО варіанту. Поясни чому неправильні є неправильними, а правильний - правильним.
Формат відповіді ТІЛЬКИ JSON (без маркдауну, без \`\`\`json):
{
  "${question.options[0].id}": "пояснення...",
  "${question.options[1].id}": "пояснення..."
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

async function processFile(filename) {
  const filePath = path.join(__dirname, '../src/data/tests', filename);
  console.log(`Processing ${filename}...`);
  
  if (!fs.existsSync(filePath)) return;
  const fileData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  let modified = false;

  for (const session of fileData.sessions || []) {
    for (const question of session.questions || []) {
      // Skip if explanations are already generated
      // The default explanation was set by the scraper as "Детальне пояснення наразі недоступне..."
      const needsExplanation = question.options.some(o => 
        o.explanation && o.explanation.includes('недоступне')
      );

      if (!needsExplanation) continue;

      console.log(`Generating for question ${question.id}...`);
      
      let retries = 5;
      let exps = null;
      while (retries > 0 && !exps) {
        exps = await generateExplanations(question);
        if (!exps) {
          retries--;
          console.log(`Rate limit hit or error. Waiting 30 seconds before retry... (${retries} left)`);
          await delay(30000); // 30 sec backoff on error to clear RPM bucket
        }
      }

      if (exps) {
        for (const option of question.options) {
          if (exps[option.id]) {
            option.explanation = exps[option.id];
            modified = true;
          }
        }
        // Save intermediate progress
        fs.writeFileSync(filePath, JSON.stringify(fileData, null, 2));
      } else {
        console.log(`Failed to generate for ${question.id} after retries. Aborting to prevent skipping.`);
        process.exit(1);
      }

      // Respect rate limit (15 RPM = 1 request every 4 seconds)
      await delay(4100);
    }
  }

  console.log(`Finished ${filename}.`);
}

async function main() {
  await processFile('tznk.json');
  await processFile('efvv_it.json');
  console.log('All done!');
}

main();
