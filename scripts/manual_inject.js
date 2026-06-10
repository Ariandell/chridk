import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, '../src/data/tests/evi_german.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const myAnswers = {
  "632_5": {
    "E": "Це оголошення ідеально підходить Верені. \"C&A\" - це велика мережа магазинів одягу (großes Geschäft). Вони пропонують навчання на продавця та комерсанта (\"Ausbildung zum Verkäufer, Kaufmann\"). Обов'язки включають консультацію клієнтів (\"Kundenberatung\"), що забезпечує контакт з людьми.",
    "A": "Це реклама курсів аргентинського танго для студентів. Верена шукає роботу та навчання, а не курси танців.",
    "B": "Це пропозиція підробітку на канікули - вигул собак (Hundesitter). Це не комерційна професія і не робота у великому магазині.",
    "C": "Це реклама інтернет-магазину комп'ютерів. Вони просто продають техніку, а не пропонують навчання (Ausbildung).",
    "D": "Тут хтось шукає приватного вчителя танців (Discofox). Не підходить для Верени.",
    "F": "Студентська група шукає волонтерів для тестування технічної допомоги. Це не навчання комерційній професії.",
    "G": "Це реклама послуг школи для собак (Hundeschule).",
    "H": "Хоча це комерційна посада (kaufmännische Fachkraft), вона вимагає вже **закінченої** освіти (Abgeschlossene kaufmännische Ausbildung), а Верена тільки хоче її здобути (erlernen). Крім того, це офісна робота, а не робота у великому магазині з людьми."
  },
  "632_8": {
    "A": "Неправильно. У тексті сказано, що вона була біологічкою (\"Biologielehrerin\"), а не просто еко-активісткою, і учні над нею тихцем насміхалися (\"gekichert\"), а не поважали за це.",
    "B": "Правильно! Учні тоді не усвідомлювали, що її стиль випередив час: \"Wir ahnten damals aber nicht, dass unsere Lehrerin einfach schon der Zeit voraus war.\"",
    "C": "Неправильно. У тексті згадуються її великі в'язані кофти (\"Strickjacken\"), але не сказано, що вона в'язала їх сама.",
    "D": "Неправильно. Учні не наслідували її (\"nachgeahmt\"), а навпаки, насміхалися з її стилю і називали її \"еко-матусею\"."
  },
  "632_9": {
    "A": "Неправильно. Терміни мають різне значення (Grüne Mode - матеріали, Faire Mode - умови праці).",
    "B": "Неправильно. У тексті не згадується про дефіцит або те, що виробники не можуть покрити попит.",
    "C": "Правильно! Сюзанні найбільше подобається \"Öko-Mode\", тому що вона поєднує екологічні та соціальні аспекти: \"Mir gefällt die Idee der 'Öko-Mode' am besten, weil sie diese ökologischen und sozialen Aspekte vereint.\"",
    "D": "Неправильно. Сучасний тренд екомоди - це не \"простий\" одяг, а \"schick und raffiniert\" (елегантний та витончений)."
  }
};

let applied = 0;
data.sessions[0].questions.forEach(q => {
  if (myAnswers[q.id]) {
    q.options.forEach(o => {
      if (myAnswers[q.id][o.id]) {
        o.explanation = myAnswers[q.id][o.id];
      }
    });
    applied++;
  }
});

fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
console.log('Injected', applied, 'questions');
