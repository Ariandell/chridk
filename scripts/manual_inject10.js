import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const exps = {
  "404_21": { "C": "Німеччина шукає рішення 'разом із державами-членами Європейського Союзу' (mit den Mitgliedsstaaten der Europäischen Union finden)." },
  "404_22": { "E": "Багатьом людям не подобається ідея скасування літнього часу, 'тому що вони люблять довгі світлі вечори' (sie lieben die langen hellen Abende)." },
  "404_23": { "C": "Перший банкомат був 'встановлений' (wurde ... aufgestellt). Це пасивний стан (Passiv). Детальніше: https://mein-deutschbuch.de/passiv.html" },
  "404_24": { "B": "Щоб отримати готівку, потрібен був спеціальний ключ (um ... zu bekommen). Це інфінітивна конструкція з um...zu. Детальніше: https://mein-deutschbuch.de/infinitivkonstruktionen.html" },
  "404_25": { "F": "Ключ видали 1000 'клієнтам' (den 1000 Kunden). Іменник у давальному відмінку множини (Dativ Plural)." },
  "404_26": { "E": "Система виявилася 'непрактичною' (unpraktisch), тому що ключ залишався в автоматі." },
  "404_27": { "A": "Оскільки система була непрактичною, банкомат незабаром 'демонтували' (wurde demontiert)." },
  "404_28": { "G": "Органна музика стала 'нематеріальною' культурною спадщиною (zum immateriellen Weltkulturerbe). Відмінювання прикметника після злиття прийменника з артиклем (zu + dem = zum). Детальніше: https://mein-deutschbuch.de/adjektivdeklination.html" },
  "404_29": { "B": "Німеччина 'відома' своїми органами (ist bekannt)." },
  "404_30": { "A": "Стійкий вираз 'відігравати важливу роль' (eine wichtige Rolle spielen)." },
  "404_31": { "E": "Виготовлення органів має тут дуже довгу 'традицію' (eine sehr lange Tradition)." },
  "404_32": { "C": "'Більшість' органів (die meisten Orgeln)." },
  "404_33": { "B": "Дієслово у минулому часі (Präteritum) для множини: 'suchten' (шукали). Детальніше: https://mein-deutschbuch.de/praeteritum.html" },
  "404_34": { "C": "Прийменник місця 'на' (острові Рюген): 'auf der Insel Rügen'. Вимагає Dativ. Детальніше: https://mein-deutschbuch.de/praepositionen.html" },
  "404_35": { "A": "Стійке керування дієслова: 'suchen nach' + Dativ (шукати щось). Детальніше: https://mein-deutschbuch.de/verben-mit-praepositionalergaenzungen.html" },
  "404_36": { "A": "Займенниковий прислівник 'dafür' (для цього). Вони потребували для цього металошукач. Детальніше: https://mein-deutschbuch.de/pronominaladverbien.html" },
  "404_37": { "C": "Минулий час Plusquamperfekt: 'hatten ... mitgenommen' (взяли з собою). Детальніше: https://mein-deutschbuch.de/plusquamperfekt.html" },
  "404_38": { "B": "Називний відмінок чоловічого роду (Nominativ Maskulinum): 'der 13-jährige Schüler' (13-річний учень)." },
  "404_39": { "C": "Відмінювання прикметника після неозначеного артикля у знахідному відмінку (Akkusativ Maskulinum): 'einen wertvollen Schatz'. Детальніше: https://mein-deutschbuch.de/adjektivdeklination-mit-dem-unbestimmten-artikel.html" },
  "404_40": { "A": "Відносний займенник (Relativpronomen) для множини: 'die' (монети, які...). Детальніше: https://mein-deutschbuch.de/relativpronomen.html" },
  "404_41": { "C": "Підрядний сполучник 'dass' (що). Експерти вірять, що цей скарб належить королю. Детальніше: https://mein-deutschbuch.de/nebensaetze-dass.html" },
  "404_42": { "B": "Дієслово-зв'язка 'sein' у третій особі однини (Präsens): 'ist' (є). Найбільший скарб, який будь-коли був знайдений." }
};

const outPath = path.join(__dirname, '../src/data/tests/german_explanations.json');
let currentExps = {};
if (fs.existsSync(outPath)) {
  currentExps = JSON.parse(fs.readFileSync(outPath, 'utf8'));
}

currentExps = { ...currentExps, ...exps };
fs.writeFileSync(outPath, JSON.stringify(currentExps, null, 2));
console.log('Saved batch 10 (22 questions) to german_explanations.json');
