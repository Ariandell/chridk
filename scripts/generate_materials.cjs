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
  baseURL: "https://ws-44u22f3kqqe6ua7h.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1",
});

const MODEL_NAME = 'qwen3.7-max';

const topicsPath = path.join(__dirname, '../src/data/topics.json');
const materialsPath = path.join(__dirname, '../src/data/materials.json');

const delay = ms => new Promise(res => setTimeout(res, ms));

async function fetchMaterial(topic) {
  const prompt = `Ти викладач-ментор з ІТ. Твоя мета - підготувати матеріали для підготовки до ЄФВВ за темою: "${topic.title}".

Опис теми: "${topic.description}"

Вимоги до формату:
Тобі потрібно розбити тему на 3-8 логічних БЛОКІВ (мікронавчання). Важливо: блоки не повинні бути гігантськими, але мають бути ДУЖЕ ДЕТАЛЬНИМИ. 
Кожен блок має бути повноцінною статтею (мінімум 300-500 слів), яка "розжовує" тему. Не пиши просто короткі списки. Якщо це алгоритми чи патерни — розпиши кожен з них детально, з повноцінним прикладом коду для КОЖНОГО (а не тільки для одного).
Студент вивчає тему майже з нуля. Роби матеріал детальним, але таким, що легко запам'ятовується: використовуй яскраві життєві аналогії та порівняльні таблиці.
ОБОВ'ЯЗКОВО додавай розгорнуті приклади реального коду (SQL, Python, C++, Java), математичні формули ($latex$), детальні розрахунки складності (Big O) з покроковим поясненням.
Додавай "Пастки ЄФВВ" (типові помилки, на яких ловлять студентів).
Після кожного блоку обов'язково додавай 3-5 тестових питань у форматі ЄФВВ (з 4 варіантами А, Б, В, Г), які закріплюють щойно прочитаний блок.

УВАГА! Поверни результат СУВОРО у форматі JSON у такому вигляді:
{
  "blocks": [
    {
      "title": "1. Назва блоку",
      "content": "Текст теорії у форматі Markdown (короткі абзаци, списки, $latex$)...",
      "tests": [
        {
          "question": "Текст питання?",
          "options": [
            {"id": "А", "text": "Варіант 1"},
            {"id": "Б", "text": "Варіант 2"},
            {"id": "В", "text": "Варіант 3"},
            {"id": "Г", "text": "Варіант 4"}
          ],
          "answer": "А",
          "explanation": "Коротке пояснення, чому саме ця відповідь правильна."
        }
      ]
    }
  ]
}

Повертай ТІЛЬКИ валідний JSON без зайвого тексту чи markdown блоків навколо нього.`;

  try {
    console.log(`\n==================== Thinking Process for ${topic.title} ====================`);
    
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
        if (!isAnswering) {
          process.stdout.write(delta.reasoning_content);
        }
      }
      
      if (delta.content) {
        if (!isAnswering) {
          console.log(`\n==================== Generating JSON ====================`);
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
    return parsed.blocks;
  } catch (error) {
    console.error("API Error or JSON Parsing Error:", error.message);
    return null;
  }
}

async function main() {
  if (!fs.existsSync(topicsPath)) {
    console.error("Файл topics.json не знайдено! Спочатку запустіть extract_topics.cjs");
    process.exit(1);
  }

  const topics = JSON.parse(fs.readFileSync(topicsPath, 'utf8'));
  
  let materials = [];
  if (fs.existsSync(materialsPath)) {
    materials = JSON.parse(fs.readFileSync(materialsPath, 'utf8'));
  }

  const remainingTopics = topics.filter(t => !materials.some(m => m.id === t.id && m.blocks && m.blocks.length > 0));

  console.log(`Всього тем: ${topics.length}. Залишилось згенерувати: ${remainingTopics.length}`);

  for (let i = 0; i < remainingTopics.length; i++) {
    const topic = remainingTopics[i];
    console.log(`\n[${i + 1}/${remainingTopics.length}] Генеруємо матеріали для: ${topic.title}`);
    
    let attempts = 0;
    let content = null;
    while (attempts < 3 && !content) {
      content = await fetchMaterial(topic);
      if (!content) {
        attempts++;
        await delay(2000 * attempts);
      }
    }
    
    if (content) {
      materials.push({
        id: topic.id,
        title: topic.title,
        blocks: content
      });
      fs.writeFileSync(materialsPath, JSON.stringify(materials, null, 2), 'utf8');
      console.log(`[+] Збережено.`);
    } else {
      console.log(`[-] Помилка генерації.`);
    }
    
    await delay(1000);
  }
  
  console.log("Генерацію матеріалів успішно завершено!");
}

main();
