const fs = require('fs');
const path = require('path');
const https = require('https');

const grammarPath = path.join(__dirname, '../src/data/grammar.json');
const eviPath = path.join(__dirname, '../src/data/tests/evi_german.json');
const explanationsPath = path.join(__dirname, '../src/data/tests/german_explanations.json');

// Collect all unique mein-deutschbuch.de URLs from all files
function extractUrls(text) {
  const regex = /https?:\/\/mein-deutschbuch\.de\/[a-z0-9\-]+\.html/gi;
  return [...new Set(text.match(regex) || [])];
}

const grammarData = fs.readFileSync(grammarPath, 'utf8');
const eviData = fs.readFileSync(eviPath, 'utf8');
const explanationsData = fs.readFileSync(explanationsPath, 'utf8');

const allUrls = new Set([
  ...extractUrls(grammarData),
  ...extractUrls(eviData),
  ...extractUrls(explanationsData),
]);

console.log(`Знайдено ${allUrls.size} унікальних URL для перевірки.\n`);

function checkUrl(url) {
  return new Promise((resolve) => {
    const req = https.get(url, { timeout: 10000 }, (res) => {
      resolve({ url, status: res.statusCode });
    });
    req.on('error', (err) => {
      resolve({ url, status: 'ERROR', error: err.message });
    });
    req.on('timeout', () => {
      req.destroy();
      resolve({ url, status: 'TIMEOUT' });
    });
  });
}

async function main() {
  const results = [];
  const urls = [...allUrls];
  
  for (let i = 0; i < urls.length; i++) {
    const result = await checkUrl(urls[i]);
    const statusIcon = result.status === 200 ? '✅' : '❌';
    console.log(`[${i+1}/${urls.length}] ${statusIcon} ${result.status} - ${result.url}`);
    results.push(result);
    // Small delay to be polite to the server
    await new Promise(r => setTimeout(r, 300));
  }

  const broken = results.filter(r => r.status !== 200);
  console.log(`\n========== ПІДСУМОК ==========`);
  console.log(`Всього перевірено: ${results.length}`);
  console.log(`Працюють: ${results.filter(r => r.status === 200).length}`);
  console.log(`Зламаних: ${broken.length}`);
  
  if (broken.length > 0) {
    console.log(`\nЗламані URL:`);
    broken.forEach(b => console.log(`  ${b.status} - ${b.url}`));
  }
}

main();
