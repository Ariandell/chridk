const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const OpenAI = require('openai');

const API_KEY = process.env.ALIBABA_API_KEY || '';

const client = new OpenAI({
  apiKey: API_KEY,
  baseURL: "https://ws-rs76nyppxqtnvawo.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1",
});

const MODEL_NAME = 'qwen3.7-plus'; 

const eviPath = path.join(__dirname, '../src/data/tests/evi_german.json');
const explanationsPath = path.join(__dirname, '../src/data/tests/german_explanations.json');
const grammarPath = path.join(__dirname, '../src/data/grammar.json');

const delay = ms => new Promise(res => setTimeout(res, ms));

async function fetchExplanation(questionObj, grammarLinks) {
  const grammarKeys = Object.keys(grammarLinks);
  
  const prompt = `Ти вчитель німецької мови. Твоя мета - пояснити, чому правильна відповідь у тесті є правильною, і чому інші варіанти є неправильними.
Пояснення має бути написане українською мовою, зрозуміло і лаконічно.

ОСЬ ПИТАННЯ:
Питання: "${questionObj.question}"
Варіанти відповідей:
${questionObj.options.map((opt, i) => `${i + 1}. ${opt.text} [ЦЕ ${opt.isCorrect ? 'ПРАВИЛЬНА' : 'НЕПРАВИЛЬНА'} ВІДПОВІДЬ]`).join('\n')}

УВАГА! Ти МАЄШ повернути відповідь СУВОРО у форматі JSON і більше ніякого тексту. Заборонено писати свої роздуми перед JSON. Одразу поверни блок \`\`\`json.

Очікуваний формат:
{
  "explanations": {
    "Текст варіанту 1": "Пояснення чому це правильно або неправильно.",
    "Текст варіанту 2": "Пояснення чому це правильно або неправильно.",
    "Текст варіанту N": "Пояснення..."
  },
  "grammar_topics": ["тема 1", "тема 2"] 
}

Правила для "grammar_topics": вибери 1-2 найважливіші граматичні теми з цього списку:
[${grammarKeys.join(', ')}]
Якщо жодна не підходить ідеально, залиш масив порожнім [].

ВАЖЛИВО: 
Ключі в об'єкті "explanations" МАЮТЬ ТОЧНО СПІВПАДАТИ з текстом варіантів відповідей! (не додавай туди текст [ЦЕ ПРАВИЛЬНА ВІДПОВІДЬ], використовуй оригінальний текст).
НІЯКОГО ІНШОГО ТЕКСТУ, ЛИШЕ ЧИСТИЙ JSON!`;

  try {
    console.log(`\n==================== Thinking Process for ${questionObj.id} ====================`);
    
    const stream = await client.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { role: "system", content: "Ти корисний AI-асистент, який повертає ТІЛЬКИ валідний JSON." },
        { role: "user", content: prompt }
      ],
      temperature: 0.2,
      stream: true,
    });

    let isAnswering = false;
    let fullResponse = "";

    for await (const chunk of stream) {
      if (!chunk.choices || chunk.choices.length === 0) continue;
      
      const delta = chunk.choices[0].delta;
      
      // Логування процесу мислення (якщо підтримується)
      if (delta.reasoning_content) {
        if (!isAnswering) {
          process.stdout.write(delta.reasoning_content);
        }
      }
      
      // Збір самої відповіді
      if (delta.content) {
        if (!isAnswering) {
          console.log(`\n==================== Full Response for ${questionObj.id} ====================`);
          isAnswering = true;
        }
        process.stdout.write(delta.content);
        fullResponse += delta.content;
      }
    }
    
    console.log("\n"); // Відступ після завершення виводу

    if (!fullResponse) return null;
    
    let jsonStr = fullResponse;
    const jsonMatch = fullResponse.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    } else {
      const start = fullResponse.indexOf('{');
      const end = fullResponse.lastIndexOf('}');
      if (start !== -1 && end !== -1) {
        jsonStr = fullResponse.substring(start, end + 1);
      }
    }

    const result = JSON.parse(jsonStr);

    if (result && result.explanations) {
      let linkStr = null;
      if (result.grammar_topics && result.grammar_topics.length > 0) {
        const topic = result.grammar_topics[0];
        if (grammarLinks[topic]) {
          linkStr = `\n\n💡 Підказка: Детальніше про граматику для цього завдання: [${topic}](${grammarLinks[topic]})`;
        }
      }
      return { explanations: result.explanations, link: linkStr };
    }
  } catch (error) {
    console.error("API Error:", error.message);
  }
  return null;
}

async function main() {
  if (!process.env.ALIBABA_API_KEY) {
    console.error("ПОМИЛКА: Не вказано ALIBABA_API_KEY у файлі .env!");
    process.exit(1);
  }

  const eviData = JSON.parse(fs.readFileSync(eviPath, 'utf8'));
  let existingExps = {};
  // Ми хочемо переписати всі питання, тому ігноруємо попередній файл або обнуляємо його.
  // Але для безпеки можемо просто перезаписувати ключі.
  // Якщо файл існує, ми його все одно прочитаємо, щоб не загубити іншу мову, якщо вона там є.
  if (fs.existsSync(explanationsPath)) {
    existingExps = JSON.parse(fs.readFileSync(explanationsPath, 'utf8'));
  }
  const grammarLinks = JSON.parse(fs.readFileSync(grammarPath, 'utf8'));

  const questionsToProcess = [];
  
  eviData.sessions.forEach(session => {
    session.questions.forEach(q => {
      questionsToProcess.push({
        id: q.id,
        question: q.text, 
        options: q.options.map(o => ({ text: o.text, isCorrect: o.isCorrect }))
      });
    });
  });

  // Пропускаємо перші 168 питань, які ви вже обробили (до 169-го)
  const startIndex = 168;
  const remainingQuestions = questionsToProcess.slice(startIndex);

  console.log(`Знайдено ${questionsToProcess.length} питань. Пропускаємо перші ${startIndex}. Запуск обробки для решти ${remainingQuestions.length}...`);
  
  const batchSize = 1;
  for (let i = 0; i < remainingQuestions.length; i += batchSize) {
    const batch = remainingQuestions.slice(i, i + batchSize);
    console.log(`Обробка питання ${i + 1 + startIndex} з ${questionsToProcess.length}`);
    
    const promises = batch.map(async (q) => {
      const exp = await fetchExplanation(q, grammarLinks);
      if (exp) {
        existingExps[q.id] = exp.explanations;
        
        // Знаходимо питання в eviData і додаємо лінк
        if (exp.link) {
          for (const session of eviData.sessions) {
            const targetQ = session.questions.find(quest => quest.id === q.id);
            if (targetQ && !targetQ.text.includes('💡 Підказка: Детальніше про граматику')) {
              targetQ.text += exp.link;
            }
          }
        }
        
        console.log(`[+] Додано пояснення для ${q.id}`);
      } else {
        console.log(`[-] Помилка отримання для ${q.id}`);
      }
    });

    await Promise.all(promises);
    fs.writeFileSync(explanationsPath, JSON.stringify(existingExps, null, 2), 'utf8');
    fs.writeFileSync(eviPath, JSON.stringify(eviData, null, 2), 'utf8');
    
    if (i + batchSize < remainingQuestions.length) {
      await delay(2000); 
    }
  }

  console.log('Генерацію завершено.');
}

main();
