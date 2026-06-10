import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Retroactively add links to old explanations
const outPath = path.join(__dirname, '../src/data/tests/german_explanations.json');
let currentExps = {};
if (fs.existsSync(outPath)) {
  currentExps = JSON.parse(fs.readFileSync(outPath, 'utf8'));
}

const addLink = (id, option, searchTxt, link) => {
  if (currentExps[id] && currentExps[id][option] && !currentExps[id][option].includes('mein-deutschbuch.de')) {
    if (currentExps[id][option].includes(searchTxt)) {
      currentExps[id][option] += ` Детальніше: ${link}`;
    }
  }
};

addLink('632_14', 'H', 'інфінітива з часткою zu', 'https://mein-deutschbuch.de/infinitivkonstruktionen.html');
addLink('632_16', 'G', 'Пасивний стан', 'https://mein-deutschbuch.de/passiv.html');
addLink('632_22', 'A', 'прийменника bei + Dativ', 'https://mein-deutschbuch.de/dativ.html');
addLink('632_24', 'C', 'Пасивний стан у минулому часі', 'https://mein-deutschbuch.de/passiv-praeteritum.html');
addLink('632_28', 'A', 'Модальне дієслово', 'https://mein-deutschbuch.de/modalverben.html');
addLink('632_30', 'C', 'Відносний займенник', 'https://mein-deutschbuch.de/relativpronomen.html');
addLink('537_15', 'D', 'Більшість німців', 'https://mein-deutschbuch.de/adjektivdeklination.html');

// Copy 537_11 to 537_30 to 512_11 to 512_30
for (let i = 11; i <= 30; i++) {
  const sourceId = `537_${i}`;
  const targetId = `512_${i}`;
  if (currentExps[sourceId]) {
    currentExps[targetId] = JSON.parse(JSON.stringify(currentExps[sourceId]));
  }
}

fs.writeFileSync(outPath, JSON.stringify(currentExps, null, 2));
console.log('Retroactive links added and 512_11-30 cloned successfully.');
