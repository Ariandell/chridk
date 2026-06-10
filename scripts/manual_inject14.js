import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const exps = {
  "322_22": { "C": "Хоча вона жила в маленькому місті, 'тим не менш, вона насолоджується перевагами життя у великому місті' (trotzdem genießt sie die Vorzüge des Großstadtlebens)." },
  "322_23": { "C": "'З цим реченням' (Mit diesem Satz). Хлопець почав свою промову саме з цієї фрази." },
  "322_24": { "G": "Прийменник часу 'vor' (тому). 'vor über zehn Jahren' (понад десять років тому)." },
  "322_25": { "E": "Тема 'захисту клімату' (Klimaschutz)." },
  "322_26": { "F": "Стійкий вираз 'налякати/привернути увагу' або 'робити щось' (machen). Залежить від контексту тексту." },
  "322_27": { "B": "Прийменник 'über' (про). Доповідь про щось (Referat über)." },
  "322_28": { "E": "Спорт відіграє 'для' багатьох важливу роль (spielt für viele eine wichtige Rolle)." },
  "322_29": { "G": "Кожен другий підліток є 'членом' (Mitglied) спортивного клубу." },
  "322_30": { "D": "Для них 'важливо' (ist es wichtig) займатися спортом." },
  "322_31": { "C": "Для деяких це 'більше не' важливо (nicht mehr)." },
  "322_32": { "A": "Спорт займає 'багато' часу (viel Zeit)." },
  "322_33": { "B": "Зворотне дієслово 'sich interessieren' (цікавитися). Для першої особи однини (Ich) зворотний займенник — 'mich' (interessiere mich). Детальніше: https://mein-deutschbuch.de/reflexive-verben.html" },
  "322_34": { "B": "Означений артикль множини: 'die meisten Leute' (більшість людей). Детальніше: https://mein-deutschbuch.de/bestimmter-artikel.html" },
  "322_35": { "C": "Після модального дієслова wollen потрібен інфінітив у кінці речення: 'hinfahren' (поїхати туди). Детальніше: https://mein-deutschbuch.de/modalverben.html" },
  "322_36": { "B": "Відмінювання прикметника без артикля (Nullartikel) у знахідному відмінку середнього роду (Akkusativ Neutrum): 'schlechtes Wetter' (погана погода). Детальніше: https://mein-deutschbuch.de/adjektivdeklination-nach-nullartikel.html" },
  "322_37": { "A": "Присвійний артикль у давальному відмінку (Dativ Neutrum) після прийменника mit: 'mit meinem Auto' (моєю машиною). Детальніше: https://mein-deutschbuch.de/possessivartikel.html" },
  "322_38": { "B": "Прийменник 'von' вимагає давального відмінка. Фотографії (від/кого/чого) торнадо: 'Bilder von'. Детальніше: https://mein-deutschbuch.de/praepositionen.html" },
  "322_39": { "B": "Стійка конструкція 'es gibt' (є/існує) + Akkusativ." },
  "322_40": { "D": "Інфінітивна конструкція з zu: 'schwer zu finden' (важко знайти). Детальніше: https://mein-deutschbuch.de/infinitivkonstruktionen.html" },
  "322_41": { "A": "Підрядний сполучник 'dass' (що). 'Ich hoffe, dass...' (Я сподіваюсь, що...). Детальніше: https://mein-deutschbuch.de/nebensaetze-dass.html" },
  "322_42": { "C": "Допоміжне дієслово 'werden' використовується для утворення майбутнього часу (Futur I): 'werden ... verstehen' (будуть розуміти). Детальніше: https://mein-deutschbuch.de/futur-1.html" }
};

const outPath = path.join(__dirname, '../src/data/tests/german_explanations.json');
let currentExps = {};
if (fs.existsSync(outPath)) {
  currentExps = JSON.parse(fs.readFileSync(outPath, 'utf8'));
}

currentExps = { ...currentExps, ...exps };
fs.writeFileSync(outPath, JSON.stringify(currentExps, null, 2));
console.log('Saved batch 14 (21 questions) to german_explanations.json');
