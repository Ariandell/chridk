import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const exps = {
  "632_5": { "E": "Верена хоче здобути комерційну професію у великій компанії. Оголошення E (від великої мережі C&A) пропонує навчання на продавця та комерсанта ('Ausbildung zum Kaufmann')." },
  "632_8": { "B": "Сюзанна згадує, що її однокласники раніше не розуміли її передового стилю: 'Die Schüler verstanden damals nicht, wie fortschrittlich ihr Stil war'." },
  "632_9": { "C": "Їй подобається екологічний та соціальний підхід: 'Susanne gefällt es, wenn Modehersteller Umweltfreundlichkeit und Soziales verbinden'." },
  "632_21": { "C": "Іменник 'Geld' (гроші). У тексті йдеться про те, що запускати феєрверки — це буквально спалювати гроші на вітер." }
};

const outPath = path.join(__dirname, '../src/data/tests/german_explanations.json');
let currentExps = {};
if (fs.existsSync(outPath)) {
  currentExps = JSON.parse(fs.readFileSync(outPath, 'utf8'));
}

currentExps = { ...currentExps, ...exps };
fs.writeFileSync(outPath, JSON.stringify(currentExps, null, 2));
console.log('Saved missing 4 questions to german_explanations.json');
