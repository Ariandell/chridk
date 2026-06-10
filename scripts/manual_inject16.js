import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const exps = {
  "273_22": { "F": "Кон'юнктив I (непряма мова): 'sei noch nicht geklärt' (ще не з'ясовано). Детальніше: https://mein-deutschbuch.de/konjunktiv-1.html" },
  "273_23": { "A": "Дієслово у множині 'drohen' (загрожують), оскільки підмет у множині. Керування: drohen + Dativ (загрожувати комусь). Детальніше: https://mein-deutschbuch.de/verben-mit-datiivergaenzungen.html" },
  "273_24": { "C": "Прийменник 'gegen' (проти) вимагає Akkusativ: 'Gesetz gegen Betrug' (закон проти шахрайства). Детальніше: https://mein-deutschbuch.de/praepositionen.html" },
  "273_25": { "D": "Пасивний стан (Passiv) у минулому часі: 'wurde ... beschlossen' (було прийнято). Детальніше: https://mein-deutschbuch.de/passiv.html" },
  "273_26": { "C": "Родовий відмінок (Genitiv): 'Auf der Grundlage des neuen Gesetzes' (На основі нового закону). Детальніше: https://mein-deutschbuch.de/genitiv.html" },
  "273_27": { "A": "Інфінітив пасивного стану: 'können ... bestraft werden' (можуть бути покарані). Детальніше: https://mein-deutschbuch.de/passiv.html" },
  "273_28": { "B": "Іменник 'Haft' (ув'язнення). Засуджені до ув'язнення (zu Haft verurteilt)." },
  "273_29": { "A": "Найвищий ступінь порівняння прикметника (Superlativ) у знахідному відмінку (Akkusativ): 'den größten Skandal' (найбільший скандал). Детальніше: https://mein-deutschbuch.de/komparation.html" },
  "273_30": { "B": "Стійке керування: 'beteiligt sein an' + Dativ (бути причетним до чогось). Детальніше: https://mein-deutschbuch.de/verben-mit-praepositionalergaenzungen.html" },
  "273_31": { "D": "Стійкий вираз: 'in diesem Kontext' (у цьому контексті)." },
  "273_32": { "B": "Стійка конструкція: 'gilt als' (вважається кимось/чимось)." },
  "273_33": { "C": "Стійке керування дієслова: 'leiden unter' + Dativ (страждати від чогось/через щось). 'leidet unter einem Brexit'. Детальніше: https://mein-deutschbuch.de/verben-mit-praepositionalergaenzungen.html" },
  "273_34": { "H": "Іменник: 'politische Differenzen' (політичні розбіжності)." },
  "273_35": { "G": "Німеччина є найважливішим 'членом' (Mitglied) союзу." },
  "273_36": { "A": "Іменник 'Austritt' (вихід). Вихід Великобританії з ЄС (Brexit)." },
  "273_37": { "E": "Прийменник 'gegenüber' (стосовно/навпроти), який часто ставиться після іменника: 'den Briten gegenüber' (по відношенню до британців). Вимагає Dativ. Детальніше: https://mein-deutschbuch.de/praepositionen-mit-dativ.html" },
  "273_38": { "F": "Майбутній час (Futur I) з дієсловом 'aussehen': 'wird nun anders aussehen' (тепер виглядатиме інакше)." },
  "273_39": { "C": "Стійкий вираз 'unter Druck geraten' (опинитися під тиском)." },
  "273_40": { "D": "Зворотне дієслово 'sich abgrenzen' (відмежуватися)." },
  "273_41": { "B": "Прислівник 'weltweit' (по всьому світу). Процеси матимуть світовий вплив." },
  "273_42": { "H": "Стійкий вираз 'dem Beispiel folgen' (наслідувати приклад/піти слідом)." }
};

const outPath = path.join(__dirname, '../src/data/tests/german_explanations.json');
let currentExps = {};
if (fs.existsSync(outPath)) {
  currentExps = JSON.parse(fs.readFileSync(outPath, 'utf8'));
}

currentExps = { ...currentExps, ...exps };
fs.writeFileSync(outPath, JSON.stringify(currentExps, null, 2));
console.log('Saved batch 16 (21 questions) to german_explanations.json');
