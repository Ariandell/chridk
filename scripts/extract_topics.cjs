const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const OpenAI = require('openai');

const API_KEY = process.env.ALIBABA_API_KEY_FOR_LECTIONS || process.env.ALIBABA_API_KEY || '';

if (!API_KEY) {
  console.error("ALIBABA_API_KEY_FOR_LECTIONS is not set");
  process.exit(1);
}

const client = new OpenAI({
  apiKey: API_KEY,
  baseURL: "https://ws-rs76nyppxqtnvawo.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1",
});

const MODEL_NAME = 'qwen3.7-max';

const efvvPath = path.join(__dirname, '../src/data/tests/efvv_it.json');
const topicsPath = path.join(__dirname, '../src/data/topics.json');

async function main() {
  const data = JSON.parse(fs.readFileSync(efvvPath, 'utf8'));
  const allQuestions = [];
  data.sessions.forEach(session => {
    session.questions.forEach(q => allQuestions.push(q.text));
  });

  console.log(`Завантажено ${allQuestions.length} питань. Відправляємо на аналіз до ${MODEL_NAME}...`);

  const prompt = `Ти експерт з інформаційних технологій та укладач навчальних програм.
Ось список зі 140 питань тесту ЄФВВ з ІТ:
${allQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

Твоє завдання:
Проаналізуй ці питання і виокреми рівно 15-20 ключових макро-тем (наприклад, "Бази даних", "Життєвий цикл ПЗ", "Комп'ютерні мережі", "Кібербезпека", "Алгоритми та структури даних" тощо), які покривають весь матеріал.

УВАГА! Поверни результат СУВОРО у форматі JSON у такому вигляді:
{
  "topics": [
    {
      "id": "db",
      "title": "Бази даних та SQL",
      "description": "Короткий опис того, що входить у цю тему (1-2 речення)."
    },
    ...
  ]
}

Повертай ТІЛЬКИ валідний JSON без зайвого тексту чи markdown блоків навколо нього, або з ними, але я розпаршу їх регуляркою. Головне - структура.`;

  try {
    console.log(`\n==================== Очікуємо відповідь від моделі... ====================`);
    const stream = await client.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { role: "system", content: "Ти корисний AI-асистент, який повертає валідний JSON." },
        { role: "user", content: prompt }
      ],
      temperature: 0.1,
      stream: true,
    });

    let isAnswering = false;
    let fullResponse = "";

    for await (const chunk of stream) {
      if (!chunk.choices || chunk.choices.length === 0) continue;
      const delta = chunk.choices[0].delta;
      if (delta.reasoning_content) {
        if (!isAnswering) process.stdout.write(delta.reasoning_content);
      }
      if (delta.content) {
        if (!isAnswering) {
          console.log(`\n\n[ОТРИМУЮ JSON...]`);
          isAnswering = true;
        }
        process.stdout.write(delta.content);
        fullResponse += delta.content;
      }
    }
    
    console.log("\n"); 

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

    const parsed = JSON.parse(jsonStr);
    
    fs.writeFileSync(topicsPath, JSON.stringify(parsed.topics, null, 2), 'utf8');
    console.log(`Успішно збережено ${parsed.topics.length} тем у src/data/topics.json!`);

  } catch (error) {
    console.error("API Error:", error.message);
  }
}

main();
