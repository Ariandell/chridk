import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Tesseract from 'tesseract.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runOCR() {
  const filePath = path.join(__dirname, '../src/data/tests/evi_german.json');
  if (!fs.existsSync(filePath)) {
    console.log('File not found:', filePath);
    return;
  }
  
  const fileData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  console.log('Initializing Tesseract worker for German (deu)...');
  
  const worker = await Tesseract.createWorker('deu');
  let processed = 0;
  
  for (const session of fileData.sessions || []) {
    for (const question of session.questions || []) {
      
      // Process question image if any
      if (question.imageUrl) {
        const imgPath = path.join(__dirname, '../public', question.imageUrl);
        if (fs.existsSync(imgPath)) {
          console.log(`[Q ${question.id}] OCR for question image...`);
          const { data: { text } } = await worker.recognize(imgPath);
          if (text && text.trim()) {
            question.text = question.text ? question.text + '\n\n' + text.trim() : text.trim();
            question.originalImageUrl = question.imageUrl;
            delete question.imageUrl;
            processed++;
          }
        }
      }

      // Process option images
      for (const option of question.options) {
        if (option.imageUrl) {
          const imgPath = path.join(__dirname, '../public', option.imageUrl);
          if (fs.existsSync(imgPath)) {
            console.log(`[Q ${question.id} Opt ${option.id}] OCR...`);
            const { data: { text } } = await worker.recognize(imgPath);
            if (text && text.trim()) {
              option.text = text.trim();
              option.originalImageUrl = option.imageUrl;
              delete option.imageUrl;
              processed++;
            }
          }
        }
      }
      
      // Save progressively just in case
      if (processed % 10 === 0 && processed > 0) {
        fs.writeFileSync(filePath, JSON.stringify(fileData, null, 2));
      }
    }
  }

  // Final save
  fs.writeFileSync(filePath, JSON.stringify(fileData, null, 2));
  await worker.terminate();
  console.log(`Finished OCR! Processed ${processed} images.`);
}

runOCR().catch(console.error);
