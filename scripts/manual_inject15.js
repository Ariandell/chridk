import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const exps = {
  "273_1": { "B": "Заголовок: 'Die teuren Geräte für einen Kranken' (Дорогі прилади для хворого). У тексті йдеться про продаж на 'Kaffeefahrt' (рекламна поїздка)." },
  "273_2": { "H": "Заголовок: 'Dienstbefugnisse überschritten?' (Перевищено службові повноваження?). Йдеться про поліцейську операцію." },
  "273_3": { "C": "Заголовок: 'Gefährlicher Spurwechsel' (Небезпечна зміна смуги). Текст про водіїв і маневри на дорозі." },
  "273_4": { "F": "Заголовок: 'Betrugsmasche im Netz' (Шахрайська схема в мережі). Жінка стала жертвою шахрайства через чат в інтернеті." },
  "273_5": { "A": "Заголовок: 'Verkaufte Klausurinhalte' (Продані теми іспитів). Скандал із продажем тем для юридичних іспитів." },
  "273_6": { "A": "Звинувачений заявляє, що 'не мав цього наміру' (Der Angeklagte hat es nicht vorgehabt)." },
  "273_7": { "C": "Ситуацію називають 'ганебним непорозумінням' (peinliches Missverständnis)." },
  "273_8": { "B": "Наслідок для нього: 'Його звільнили' (Er wurde gekündigt)." },
  "273_9": { "B": "У справі замішаний 'Екзаменатор' (Ein Examinator)." },
  "273_10": { "D": "Процес проходить 'частково таємно' (teils geheim)." },
  "273_11": { "G": "В оголошенні G шукають випускника з відмінними результатами, англійською та креативністю." },
  "273_12": { "H": "В оголошенні H шукають фахівця з інвестиційного права (Investmentrecht) та банків." },
  "273_13": { "E": "В оголошенні E шукають людину з комерційною освітою (kaufmännische Ausbildung)." },
  "273_14": { "C": "В оголошенні C шукають фахівця з питань захисту даних (datenschutzrechtliche Fragen)." },
  "273_15": { "B": "В оголошенні B потрібен юрист із досвідом у договірному праві (Vertragsrecht)." },
  "273_16": { "F": "В оголошенні F потрібні юристи для трудового права, нерухомості та IT (Arbeitsrecht, Immobilienrecht)." },
  "273_17": { "G": "Підрядне речення: 'які, як стверджується, готували теракт' (die einen Anschlag vorbereitet haben sollen)." },
  "273_18": { "A": "Подія 'відбулася в турецькій столиці Анкарі' (in der türkischen Hauptstadt Ankara ereignet)." },
  "273_19": { "B": "Пасивний стан (Perfekt Passiv): 'були знайдені ручні гранати' (Handgranaten gefunden worden). Детальніше: https://mein-deutschbuch.de/passiv-perfekt.html" },
  "273_20": { "E": "Причиною стала 'підказка від іншого підозрюваного, затриманого в Стамбулі' (ein Hinweis eines in Istanbul festgenommenen weiteren Verdächtigen)." },
  "273_21": { "H": "Пасивний стан (Präsens Passiv + Konjunktiv I): 'зараз допитується далі в Стамбулі' (werde derzeit weiter in Istanbul verhört). Детальніше: https://mein-deutschbuch.de/konjunktiv-1.html" }
};

const outPath = path.join(__dirname, '../src/data/tests/german_explanations.json');
let currentExps = {};
if (fs.existsSync(outPath)) {
  currentExps = JSON.parse(fs.readFileSync(outPath, 'utf8'));
}

currentExps = { ...currentExps, ...exps };
fs.writeFileSync(outPath, JSON.stringify(currentExps, null, 2));
console.log('Saved batch 15 (21 questions) to german_explanations.json');
