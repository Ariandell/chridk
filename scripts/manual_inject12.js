import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const exps = {
  "364_22": { "F": "Ринок популярний, тому що там 'німецькі продавці продають їм пиво, ковбасу, солодощі та іграшки Made in Germany' (wo ihnen deutsche Verkäufer Bier, Bratwurst... verkaufen)." },
  "364_23": { "D": "Міста 'розділені' Рейном (getrennt). 'durch den Rhein getrennt'." },
  "364_24": { "B": "Німецькі супермаркети мають багато 'пропозицій' (Angebote)." },
  "364_25": { "G": "Люди з Німеччини їздять до Швейцарії 'і навпаки' (und umgekehrt)." },
  "364_26": { "C": "Щоб відсвяткувати карнавал в 'обох' містах (in beiden Städten)." },
  "364_27": { "E": "Свято проходить 'разом з' (zusammen mit) людьми з іншого боку." },
  "364_28": { "G": "'Відкриття' озонової діри (die Entdeckung des Ozonlochs)." },
  "364_29": { "B": "Пасивний стан (Passiv): знання 'здобуваються' (Erkenntnisse werden ... gewonnen)." },
  "364_30": { "C": "Дослідники з 30 різних 'країн' (verschiedene Länder)." },
  "364_31": { "H": "Вони працюють на більш ніж 80 'дослідницьких станціях' (Forschungsstationen)." },
  "364_32": { "F": "Сьогодні є багато вражаючих 'зображень' (spektakuläre Bilder) цієї території." },
  "364_33": { "B": "Питальне слово 'woher' (звідки). 'Звідки насправді походять голоси?' Детальніше: https://mein-deutschbuch.de/interrogativpronomen.html" },
  "364_34": { "D": "Прийменник 'für' (для). Відомий голос 'для' відеоігор. Детальніше: https://mein-deutschbuch.de/praepositionen.html" },
  "364_35": { "B": "Вказівний займенник 'das' (це). 'Das ist ein Beruf' (Це професія)." },
  "364_36": { "C": "Особовий займенник у давальному відмінку: 'gehört zu ihnen' (належить до них). Прийменник 'zu' вимагає Dativ. Детальніше: https://mein-deutschbuch.de/personalpronomen.html" },
  "364_37": { "A": "Прийменник 'von' для вираження приналежності (заміна Genitiv). Детальніше: https://mein-deutschbuch.de/praepositionen-mit-dativ.html" },
  "364_38": { "D": "Відмінювання прикметника: 'in vielen Spielen' (у багатьох іграх). Dativ Plural має закінчення -en. Детальніше: https://mein-deutschbuch.de/adjektivdeklination.html" },
  "364_39": { "B": "Дієслово teilnehmen (брати участь) у формі Perfekt: 'hat ... teilgenommen'. Детальніше: https://mein-deutschbuch.de/perfekt.html" },
  "364_40": { "C": "Допоміжне дієслово 'ist' для утворення Perfekt з дієсловом 'geworden' (стала). Детальніше: https://mein-deutschbuch.de/perfekt.html" },
  "404_41": { "A": "Wait, it's 364_41. Сполучник сурядності 'denn' (оскільки/тому що). Вводить головне речення з прямим порядком слів. Детальніше: https://mein-deutschbuch.de/hauptsaetze.html" },
  "364_41": { "A": "Сполучник сурядності 'denn' (оскільки/тому що). Вводить головне речення з прямим порядком слів. Детальніше: https://mein-deutschbuch.de/hauptsaetze.html" },
  "364_42": { "D": "Відносний займенник 'denen' у давальному відмінку множини (Dativ Plural): 'Spiele, in denen ...' (Ігри, в яких...). Детальніше: https://mein-deutschbuch.de/relativpronomen.html" }
};

const outPath = path.join(__dirname, '../src/data/tests/german_explanations.json');
let currentExps = {};
if (fs.existsSync(outPath)) {
  currentExps = JSON.parse(fs.readFileSync(outPath, 'utf8'));
}

currentExps = { ...currentExps, ...exps };
fs.writeFileSync(outPath, JSON.stringify(currentExps, null, 2));
console.log('Saved batch 12 (21 questions) to german_explanations.json');
