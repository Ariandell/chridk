import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, URL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicImagesDir = path.join(__dirname, '../public/images');
if (!fs.existsSync(publicImagesDir)) {
  fs.mkdirSync(publicImagesDir, { recursive: true });
}

const URLS = {
  /*
  tznk: [
    'https://zno.osvita.ua/master/tznpk/629/',
    'https://zno.osvita.ua/master/tznpk/534/',
    'https://zno.osvita.ua/master/tznpk/508/',
    'https://zno.osvita.ua/master/tznpk/485/',
    'https://zno.osvita.ua/master/tznpk/409/',
    'https://zno.osvita.ua/master/tznpk/378/',
    'https://zno.osvita.ua/master/tznpk/324/',
    'https://zno.osvita.ua/master/tznpk/267/'
  ],
  efvv_it: [
    'https://zno.osvita.ua/master/it/644/'
  ],
  */
  evi_german: [
    'https://zno.osvita.ua/master/german/632/',
    'https://zno.osvita.ua/master/german/537/',
    'https://zno.osvita.ua/master/german/512/',
    'https://zno.osvita.ua/master/german/480/',
    'https://zno.osvita.ua/master/german/404/',
    'https://zno.osvita.ua/master/german/364/',
    'https://zno.osvita.ua/master/german/322/',
    'https://zno.osvita.ua/master/german/273/'
  ]
};

async function downloadImage(imgUrl) {
  try {
    const fullUrl = new URL(imgUrl, 'https://zno.osvita.ua').href;
    const filename = path.basename(fullUrl);
    const filepath = path.join(publicImagesDir, filename);
    
    if (!fs.existsSync(filepath)) {
      const response = await axios({
        url: fullUrl,
        method: 'GET',
        responseType: 'stream'
      });
      const writer = fs.createWriteStream(filepath);
      response.data.pipe(writer);
      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });
    }
    return `/images/${filename}`;
  } catch (err) {
    console.error(`Failed to download image ${imgUrl}`);
    return null;
  }
}

async function scrapePage(url) {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    
    const testTitle = $('.test-title h1').text().trim() || 'Тест';
    const testId = url.split('/').filter(Boolean).pop(); // e.g., '632'
    
    const questions = [];

    const tasks = $('.task-card').toArray();
    for (let i = 0; i < tasks.length; i++) {
      const qCard = $(tasks[i]);
      
      // Helper to extract text with line breaks
      const extractTextWithBreaks = (el) => {
        let html = el.html() || '';
        html = html.replace(/<br\s*[\/]?>/gi, '\n');
        html = html.replace(/<\/p>/gi, '\n\n');
        const temp = cheerio.load(html);
        return temp.text().trim().replace(/[ \t]+/g, ' ').replace(/\n\s*\n/g, '\n\n');
      };
      
      const qEl = qCard.find('.question');
      const text = extractTextWithBreaks(qEl);
      
      // Look for images in the question
      const qImgSrc = qEl.find('img').attr('src');
      let qImageUrl = null;
      if (qImgSrc) {
        qImageUrl = await downloadImage(qImgSrc);
      }

      const options = [];
      const answersEls = qCard.find('.answers .answer').toArray();
      for (let j = 0; j < answersEls.length; j++) {
        const ans = $(answersEls[j]);
        const marker = ans.find('.marker').text().trim();
        ans.find('.marker').remove();
        let ansText = extractTextWithBreaks(ans);
        
        const ansImgSrc = ans.find('img').attr('src');
        let ansImageUrl = null;
        if (ansImgSrc) {
          ansImageUrl = await downloadImage(ansImgSrc);
        }

        options.push({
          id: marker || String.fromCharCode(65 + j),
          text: ansText,
          imageUrl: ansImageUrl,
          isCorrect: false,
          explanation: "Детальне пояснення наразі недоступне. Ми працюємо над їх додаванням."
        });
      }

      // Find correct answer
      const resultVal = qCard.find('input[name="result"]').val();
      if (resultVal && options.length > 0) {
        const correctIndex = resultVal.charCodeAt(0) - 97;
        if (correctIndex >= 0 && correctIndex < options.length) {
          options[correctIndex].isCorrect = true;
        } else {
          if(options.length > 0 && correctIndex >= 0 && correctIndex < options.length) {
             options[correctIndex].isCorrect = true;
          }
        }
      }

      if (options.length > 0 && (text || qImageUrl)) {
        questions.push({
          id: `${testId}_${i + 1}`,
          text: text,
          imageUrl: qImageUrl,
          options: options
        });
      }
    }

    return {
      id: testId,
      title: testTitle,
      durationMinutes: 150, // default, could be overridden in data
      questions: questions
    };
  } catch (err) {
    console.error(`Error scraping ${url}:`, err.message);
    return null;
  }
}

async function main() {
  const dataPath = path.join(__dirname, '../src/data/tests');
  
  for (const [subject, urls] of Object.entries(URLS)) {
    console.log(`Scraping subject: ${subject}`);
    
    // Read existing file to keep metadata
    const filePath = path.join(dataPath, `${subject}.json`);
    let fileData = {
      id: subject,
      title: subject,
      sessions: []
    };
    
    if (fs.existsSync(filePath)) {
      const oldData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      fileData.title = oldData.title || subject;
      fileData.description = oldData.description || '';
    }
    
    for (const url of urls) {
      console.log(` - fetching ${url}`);
      const sessionData = await scrapePage(url);
      if (sessionData && sessionData.questions.length > 0) {
        fileData.sessions.push(sessionData);
        console.log(`   -> added ${sessionData.questions.length} questions.`);
      }
    }
    
    // Delete legacy 'questions' field if it exists
    delete fileData.questions;
    delete fileData.durationMinutes;
    
    fs.writeFileSync(filePath, JSON.stringify(fileData, null, 2));
    console.log(`Saved ${fileData.sessions.length} sessions to ${subject}.json`);
  }
}

main();
