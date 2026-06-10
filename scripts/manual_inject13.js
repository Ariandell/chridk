import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const exps = {
  "322_1": { "G": "Заголовок: 'Gute-Nacht-Geschichten für die Kleinsten' (Казки на ніч для найменших). Текст розповідає про Піщану людину (Sandmann), яка сипле дітям пісок в очі, щоб вони заснули." },
  "322_2": { "C": "Заголовок: 'Internationaler Erfolg eines deutschen Fernsehfilms' (Міжнародний успіх німецького телефільму). У тексті йдеться про німецькі детективи (Krimi), які стали популярними не лише в Німеччині." },
  "322_3": { "H": "Заголовок: 'Stars aus Tiergärten' (Зірки із зоопарків). Текст розповідає про телевізійні документальні фільми, де головними героями є тварини із зоопарків." },
  "322_4": { "E": "Заголовок: 'Ein Ort, der viel Interessantes bietet' (Місце, яке пропонує багато цікавого). Описується столиця Рейнланд-Пфальцу (Майнц), де під час прогулянки містом можна побачити багато цікавого з різних тем." },
  "322_5": { "F": "Заголовок: 'Eine Straße für den Film' (Вулиця для фільму). У тексті згадуються відомі голлівудські зірки, що працюють у районі Бабельсберг, який славиться кіноіндустрією." },
  "322_6": { "C": "Головне завдання особистого консультанта: 'Schüler bei der Berufswahl zu beraten' (радити учням при виборі професії)." },
  "322_7": { "C": "Проект побудований на тому, що: 'Die Studenten geben den Schülern Ratschläge für die Zukunft' (студенти дають учням поради на майбутнє)." },
  "322_8": { "D": "Наставниця: 'Tina gibt Jennifer wichtige praktische Tipps' (Тіна дає Дженніфер важливі практичні поради щодо вступу)." },
  "322_9": { "B": "Проблема може виникнути: 'Wenn die Schüler unerfahrene Betreuer bekommen' (якщо учні отримують недосвідчених наставників)." },
  "322_10": { "B": "Студенти роблять це, тому що: 'Sie sammeln Erfahrungen für ihre Zukunft' (вони збирають досвід для свого майбутнього)." },
  "322_11": { "C": "Дітер хоче вчити англійську, але не має часу на регулярні заняття. Оголошення C пропонує 'online von zu Hause aus' (онлайн з дому) або інтенсивні курси на вихідних." },
  "322_12": { "E": "Наталі хоче навчитися в'язати, щоб робити власні светри. Оголошення E пропонує 'Strickkurse' (курси в'язання)." },
  "322_13": { "F": "Сім'я Краузе їде на море і шукає місце, де можна залишити кота на час відпустки. Оголошення F пропонує 'Katzenpension' (готель для котів), де доглянуть за твариною." },
  "322_14": { "D": "Сім'я Крамер шукає вчителя англійської для 12-річної доньки вдома. Оголошення D пропонує репетиторство з англійської 'bequem in Ihrem Zuhause' (зручно у вас вдома)." },
  "322_15": { "A": "Катя хоче купити в'язаний светр, але не вміє в'язати. Оголошення A пропонує готовий одяг 'handgestrickte Pullis' (светри ручної в'язки від бабусь)." },
  "322_16": { "B": "Пані Бергер шукає когось, хто догляне за котом У НЕЇ ВДОМА під час відрядження. Оголошення B пропонує 'Betreuung ... bei Ihnen zu Hause' (догляд ... у вас вдома)." },
  "322_17": { "G": "Підрядне речення з 'dass' (що). Манфред радий, 'що в місті так багато відбувається' (dass in der Stadt so viel passiert). Детальніше: https://mein-deutschbuch.de/nebensaetze-dass.html" },
  "322_18": { "F": "Ще одне підрядне речення з 'dass': 'що вона в Берліні швидко знайомиться з новими людьми' (dass sie in Berlin schnell neue Leute kennen lernt)." },
  "322_19": { "D": "Відносне підрядне речення, яке пояснює хто така ця дівчина: 'яка вже жила за межами Берліна' (die bereits außerhalb von Berlin gelebt hat). Детальніше: https://mein-deutschbuch.de/relativsaetze.html" },
  "322_20": { "H": "Підрядне речення причини зі сполучником 'weil' (тому що): 'тому що вона більше року прожила в маленькому містечку' (weil sie über ein Jahr in einer Kleinstadt gewohnt hat). Детальніше: https://mein-deutschbuch.de/nebensaetze-weil-da.html" },
  "322_21": { "A": "Підрядне речення: можна робити 'те, що хочеш' (was man will). Відносний займенник 'was'. Детальніше: https://mein-deutschbuch.de/relativpronomen.html" }
};

const outPath = path.join(__dirname, '../src/data/tests/german_explanations.json');
let currentExps = {};
if (fs.existsSync(outPath)) {
  currentExps = JSON.parse(fs.readFileSync(outPath, 'utf8'));
}

currentExps = { ...currentExps, ...exps };
fs.writeFileSync(outPath, JSON.stringify(currentExps, null, 2));
console.log('Saved batch 13 (21 questions) to german_explanations.json');
