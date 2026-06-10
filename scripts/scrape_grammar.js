import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as cheerio from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function scrapeGrammar() {
  console.log('Scraping mein-deutschbuch.de/grammatik.html...');
  const res = await axios.get('https://mein-deutschbuch.de/grammatik.html');
  const $ = cheerio.load(res.data);
  
  const rules = [];
  
  $('a').each((i, el) => {
    const href = $(el).attr('href');
    const title = $(el).attr('title') || $(el).text();
    if (href && href.endsWith('.html') && !href.includes('startseite') && !href.includes('videos')) {
      rules.push({
        title: title.trim(),
        url: 'https://mein-deutschbuch.de/' + href
      });
    }
  });

  const uniqueRules = Array.from(new Map(rules.map(r => [r.url, r])).values());
  
  const outPath = path.join(__dirname, '../src/data/grammar_links.json');
  fs.writeFileSync(outPath, JSON.stringify(uniqueRules, null, 2));
  console.log(`Saved ${uniqueRules.length} grammar rules to ${outPath}`);
}

scrapeGrammar().catch(console.error);
