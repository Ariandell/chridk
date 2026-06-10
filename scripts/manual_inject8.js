import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const exps = {
  "480_33": { "D": "Прийменник часу 'vor' (тому). 'vor sechs Jahren' (шість років тому) вимагає давального відмінка. Детальніше: https://mein-deutschbuch.de/praepositionen.html" },
  "480_34": { "B": "Давальний відмінок чоловічого роду (Dativ Maskulinum): 'an einem Schüleraustausch' (в обміні учнями). Детальніше: https://mein-deutschbuch.de/dativ.html" },
  "480_35": { "B": "Дієслово 'teilnehmen' у формі Partizip II (брав участь): 'hat ... teilgenommen'. Перфект. Детальніше: https://mein-deutschbuch.de/perfekt.html" },
  "480_36": { "C": "Дієслово 'absolvieren' (проходити/закінчувати) у формі Partizip II: 'hat ihr Praktikum ... absolviert'. Перфект." },
  "480_37": { "A": "Сполучник часу 'als' використовується для одноразових подій у минулому ('коли вона вперше приїхала...'). Детальніше: https://mein-deutschbuch.de/nebensaetze-als-wenn.html" },
  "480_38": { "D": "Інфінітив 'gehen' (їхати/йти) стоїть у кінці речення, оскільки на другому місці стоїть модальне дієслово 'wollte' (хотіла). 'ins Ausland gehen' (поїхати за кордон). Детальніше: https://mein-deutschbuch.de/modalverben.html" },
  "480_39": { "C": "Особовий займенник у давальному відмінку множини (Dativ Plural): 'viele von ihnen' (багато з них). Детальніше: https://mein-deutschbuch.de/personalpronomen.html" },
  "480_40": { "B": "Порядковий числівник (Ordinalzahl): 'zum zweiten Mal' (вдруге). Після злиття 'zu + dem' (zum) числівник має закінчення -en. Детальніше: https://mein-deutschbuch.de/ordinalzahlen.html" },
  "480_41": { "D": "Відносний займенник 'was' (що). Використовується після неозначених займенників, таких як alles: 'das ist alles, was zählt' (це все, що має значення). Детальніше: https://mein-deutschbuch.de/relativpronomen.html" },
  "480_42": { "A": "Ступінь порівняння прикметника (Komparativ): 'noch besser' (ще краще). Детальніше: https://mein-deutschbuch.de/komparation.html" }
};

const outPath = path.join(__dirname, '../src/data/tests/german_explanations.json');
let currentExps = {};
if (fs.existsSync(outPath)) {
  currentExps = JSON.parse(fs.readFileSync(outPath, 'utf8'));
}

currentExps = { ...currentExps, ...exps };
fs.writeFileSync(outPath, JSON.stringify(currentExps, null, 2));
console.log('Saved batch 8 (10 questions) to german_explanations.json');
