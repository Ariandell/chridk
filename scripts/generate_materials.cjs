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

const topicsPath = path.join(__dirname, '../src/data/topics.json');
const materialsPath = path.join(__dirname, '../src/data/materials.json');

const delay = ms => new Promise(res => setTimeout(res, ms));

async function fetchMaterial(topic) {
  const prompt = `Ти топовий експерт з інформаційних технологій. 
Твоя мета - підготувати детальну, якісну, і легко читабельну шпаргалку / навчальний матеріал для студентів, які готуються до Єдиного Фахового Вступного Випробування (ЄФВВ) за темою: "${topic.title}".

Опис теми: "${topic.description}"

Вимоги:
1. Матеріал має бути структурований у форматі Markdown.
2. Використовуй заголовки (##, ###), списки, жирний шрифт для виділення головного.
3. Пояснюй ключові поняття, алгоритми, технології, формули. Якщо доречно, використовуй LaTeX математику всередині $...$ або $$...$$.
4. Матеріал має бути вичерпним, але без зайвої "води". Фокус на суті, яка потрібна для здачі тесту.
5. Об'єм: 1500-3000 слів.

Поверни ТІЛЬКИ текст у форматі Markdown, без додаткових пояснень або блоків коду навколо нього. Почни одразу із заголовка # ${topic.title}`;

  try {
    console.log(`\n==================== Thinking Process for ${topic.title} ====================`);
    
    const stream = await client.chat.completions.create({
      model: MODEL_NAME,
      messages: [
        { role: "system", content: "Ти корисний AI-асистент, який пише професійні навчальні матеріали у Markdown." },
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
      
      if (delta.reasoning_content) {
        if (!isAnswering) {
          process.stdout.write(delta.reasoning_content);
        }
      }
      
      if (delta.content) {
        if (!isAnswering) {
          console.log(`\n==================== Generating Markdown ====================`);
          isAnswering = true;
        }
        process.stdout.write(delta.content);
        fullResponse += delta.content;
      }
    }
    
    console.log("\n"); 
    return fullResponse;
  } catch (error) {
    console.error("API Error:", error.message);
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

  const remainingTopics = topics.filter(t => !materials.some(m => m.id === t.id && m.content.length > 100));

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
      // Remove generic markdown block quotes if they exist
      let cleanContent = content;
      if (cleanContent.startsWith('\`\`\`markdown')) {
        cleanContent = cleanContent.replace(/^\`\`\`markdown\n?/, '').replace(/\n?\`\`\`$/, '');
      }

      materials.push({
        id: topic.id,
        title: topic.title,
        content: cleanContent
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
