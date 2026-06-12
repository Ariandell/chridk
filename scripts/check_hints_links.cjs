const fs = require('fs');
const path = require('path');
const https = require('https');

const hintsPath = path.join(__dirname, '../src/data/tests/german_grammar_hints.json');
const data = JSON.parse(fs.readFileSync(hintsPath, 'utf8'));

// Collect all unique URLs
const urls = new Set();
for (const key of Object.keys(data)) {
  if (data[key].link) urls.add(data[key].link);
}

function checkUrl(url) {
  return new Promise((resolve) => {
    const req = https.get(url, { timeout: 10000 }, (res) => {
      resolve({ url, status: res.statusCode });
    });
    req.on('error', (err) => resolve({ url, status: 'ERROR', error: err.message }));
    req.on('timeout', () => { req.destroy(); resolve({ url, status: 'TIMEOUT' }); });
  });
}

async function main() {
  const allUrls = [...urls];
  console.log(`Перевіряю ${allUrls.length} URL з german_grammar_hints.json...\n`);
  
  for (let i = 0; i < allUrls.length; i++) {
    const r = await checkUrl(allUrls[i]);
    const icon = r.status === 200 ? '✅' : '❌';
    console.log(`[${i+1}/${allUrls.length}] ${icon} ${r.status} - ${r.url}`);
    await new Promise(r => setTimeout(r, 300));
  }
}

main();
