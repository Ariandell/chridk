const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { GoogleGenerativeAI } = require('@google/generative-ai');

const API_KEY = process.env.VITE_GEMINI_API_KEY || 'YOUR_API_KEY_HERE';
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemma-4-26b-a4b-it" });

const eviPath = path.join(__dirname, '../src/data/tests/evi_german.json');
const explanationsPath = path.join(__dirname, '../src/data/tests/german_explanations.json');

// Словник посилань на граматику
const grammarLinks = {
  "infinitivkonstruktionen": "https://mein-deutschbuch.de/infinitivkonstruktionen.html",
  "passiv": "https://mein-deutschbuch.de/passiv.html",
  "dativ": "https://mein-deutschbuch.de/dativ.html",
  "passiv-praeteritum": "https://mein-deutschbuch.de/passiv-praeteritum.html",
  "modalverben": "https://mein-deutschbuch.de/modalverben.html",
  "relativpronomen": "https://mein-deutschbuch.de/relativpronomen.html",
  "adjektivdeklination": "https://mein-deutschbuch.de/adjektivdeklination.html",
  "genitiv": "https://mein-deutschbuch.de/genitiv.html",
  "adjektivdeklination-nach-nullartikel": "https://mein-deutschbuch.de/adjektivdeklination-nach-nullartikel.html",
  "praeteritum": "https://mein-deutschbuch.de/praeteritum.html",
  "praepositionen": "https://mein-deutschbuch.de/praepositionen.html",
  "plusquamperfekt": "https://mein-deutschbuch.de/plusquamperfekt.html",
  "praesens": "https://mein-deutschbuch.de/praesens.html",
  "reflexive-verben": "https://mein-deutschbuch.de/reflexive-verben.html",
  "komparation": "https://mein-deutschbuch.de/komparation.html",
  "perfekt": "https://mein-deutschbuch.de/perfekt.html",
  "nebensaetze-als-wenn": "https://mein-deutschbuch.de/nebensaetze-als-wenn.html",
  "personalpronomen": "https://mein-deutschbuch.de/personalpronomen.html",
  "ordinalzahlen": "https://mein-deutschbuch.de/ordinalzahlen.html",
  "verben-mit-praepositionalergaenzungen": "https://mein-deutschbuch.de/verben-mit-praepositionalergaenzungen.html",
  "pronominaladverbien": "https://mein-deutschbuch.de/pronominaladverbien.html",
  "adjektivdeklination-mit-dem-unbestimmten-artikel": "https://mein-deutschbuch.de/adjektivdeklination-mit-dem-unbestimmten-artikel.html",
  "hauptsaetze": "https://mein-deutschbuch.de/hauptsaetze.html",
  "interrogativpronomen": "https://mein-deutschbuch.de/interrogativpronomen.html",
  "praepositionen-mit-dativ": "https://mein-deutschbuch.de/praepositionen-mit-dativ.html",
  "nebensaetze-dass": "https://mein-deutschbuch.de/nebensaetze-dass.html",
  "relativsaetze": "https://mein-deutschbuch.de/relativsaetze.html",
  "nebensaetze-weil-da": "https://mein-deutschbuch.de/nebensaetze-weil-da.html",
  "bestimmter-artikel": "https://mein-deutschbuch.de/bestimmter-artikel.html",
  "possessivartikel": "https://mein-deutschbuch.de/possessivartikel.html",
  "futur-1": "https://mein-deutschbuch.de/futur-1.html",
  "passiv-perfekt": "https://mein-deutschbuch.de/passiv-perfekt.html",
  "konjunktiv-1": "https://mein-deutschbuch.de/konjunktiv-1.html",
  "verben-mit-datiivergaenzungen": "https://mein-deutschbuch.de/verben-mit-datiivergaenzungen.html"
};

const grammarKeys = Object.keys(grammarLinks);

const eviData = JSON.parse(fs.readFileSync(eviPath, 'utf8'));
let explanations = {};
if (fs.existsSync(explanationsPath)) {
  explanations = JSON.parse(fs.readFileSync(explanationsPath, 'utf8'));
}

async function getExplanationForQuestion(question, options) {
  const prompt = `Ти вчитель німецької мови. Твоє завдання пояснити питання з німецького тесту (рівень B1/B2) українською мовою.

Питання: ${question}
Варіанти відповідей:
${options.map(o => `${o.id}: ${o.text}`).join('\n')}

Створи коротке, але чітке пояснення для КОЖНОГО варіанту відповіді (чому він правильний або чому він неправильний/не підходить за контекстом чи граматикою). 

Якщо це питання перевіряє конкретне граматичне правило, обери ОДНУ тему з цього списку:
[${grammarKeys.join(', ')}]
Якщо це перевірка лексики, читання тексту чи жодна тема не підходить - вкажи "NONE".

Відповідай СУВОРО у форматі JSON:
{
  "explanations": {
    "A": "Пояснення для A...",
    "B": "Пояснення для B...",
    "C": "Пояснення для C...",
    "D": "Пояснення для D..."
  },
  "grammar_topic": "passiv" або "NONE"
}
НІЯКОГО ІНШОГО ТЕКСТУ, ЛИШЕ ЧИСТИЙ JSON!`;

  try {
    const result_ai = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { 
        temperature: 0.2
      }
    });

    const text = result_ai.response.text();
    
    if (!text) return null;
    
    // Екстракція JSON (оскільки Gemma може додавати текст або маркдаун)
    let jsonStr = text;
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    } else {
      // Спроба знайти будь-які дужки, якщо маркдауну немає
      const start = text.indexOf('{');
      const end = text.lastIndexOf('}');
      if (start !== -1 && end !== -1) {
        jsonStr = text.substring(start, end + 1);
      }
    }

    const result = JSON.parse(jsonStr);

    if (result && result.explanations) {
      // Додаємо лінку на граматику, якщо тема знайдена у нашому словнику
      if (result.grammar_topic && result.grammar_topic !== "NONE" && grammarLinks[result.grammar_topic]) {
        // Знаходимо правильну відповідь (нам би було добре знати яка правильна, але ми додамо просто як примітку)
        // Можна додати до першого ліпшого пояснення, або як загальний коментар
        // В нашому об'єкті explanations ми зберігаємо просто ключі варіантів.
        // Додамо посилання до всіх правильних відповідей? Ні, просто додамо примітку до найдовшого пояснення (зазвичай правильного) 
        // або до всіх. Краще додати до самого об'єкту або модифікувати пояснення для правильного варіанту.
        // Ми не маємо доступу до правильної відповіді в промпті (щоб не підказувати), але можемо додати це до одного з варіантів, який містить слово "Правильн" або "Підходить".
        
        let linkAdded = false;
        const linkStr = `\n\nДетальніше про цю граматику: ${grammarLinks[result.grammar_topic]}`;
        
        for (const key of Object.keys(result.explanations)) {
          if (result.explanations[key].toLowerCase().includes('правильн') || result.explanations[key].toLowerCase().includes('підходить')) {
            result.explanations[key] += linkStr;
            linkAdded = true;
            break;
          }
        }
        
        // Якщо не знайшли слова "правильно", додаємо до першого варіанту
        if (!linkAdded) {
          const firstKey = Object.keys(result.explanations)[0];
          result.explanations[firstKey] += linkStr;
        }
      }
      return result.explanations;
    }
  } catch (error) {
    console.error('API Error:', error.message);
  }
  return null;
}

async function processAll() {
  const questionsToProcess = [];
  
  eviData.sessions.forEach(session => {
    session.questions.forEach(q => {
      // Перевіряємо чи є вже ВСІ ключі (хоча б стільки, скільки опцій) в збереженому json
      const existingExps = explanations[q.id];
      if (!existingExps || Object.keys(existingExps).length < q.options.length) {
        questionsToProcess.push(q);
      }
    });
  });
  
  console.log(`Знайдено ${questionsToProcess.length} питань без пояснень. Запуск обробки...`);
  
  // Обробляємо частинами, щоб не зловити Rate Limit
  const batchSize = 5;
  for (let i = 0; i < questionsToProcess.length; i += batchSize) {
    const batch = questionsToProcess.slice(i, i + batchSize);
    console.log(`Обробка пакету ${i/batchSize + 1} з ${Math.ceil(questionsToProcess.length / batchSize)}`);
    
    const promises = batch.map(async (q) => {
      const exp = await getExplanationForQuestion(q.text, q.options);
      if (exp) {
        explanations[q.id] = exp;
        console.log(`[+] Додано пояснення для ${q.id}`);
      } else {
        console.log(`[-] Помилка отримання для ${q.id}`);
      }
    });
    
    await Promise.all(promises);
    
    // Зберігаємо після кожного пакету
    fs.writeFileSync(explanationsPath, JSON.stringify(explanations, null, 2));
    
    // Пауза 2 секунди
    await new Promise(r => setTimeout(r, 2000));
  }
  
  console.log('Генерацію завершено.');
}

if (!process.env.VITE_GEMINI_API_KEY) {
  console.error("ПОМИЛКА: Не вказано VITE_GEMINI_API_KEY у змінних середовища.");
  process.exit(1);
}

processAll();
