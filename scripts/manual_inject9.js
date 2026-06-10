import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const exps = {
  "404_1": { "B": "Заголовок: 'Die engste Straße der Welt' (Найвужча вулиця у світі). У тексті йдеться про вулицю Spreuerhofstraße, яка має ширину лише 31 сантиметр." },
  "404_2": { "E": "Заголовок: 'Frankfurt am Main rekonstruiert seine Altstadt' (Франкфурт-на-Майні реконструює своє старе місто). У тексті йдеться про відбудову старого міста після бомбардувань у Другій світовій війні." },
  "404_3": { "F": "Заголовок: 'Ein Stück Land vom Meer zurückgewonnen' (Шматок землі, відвойований у моря). У тексті пояснюється походження назви Sommerland, яка пов'язана із землею, відвойованою у води." },
  "404_4": { "H": "Заголовок: 'Wie die Straßennamen früher entstanden' (Як раніше виникали назви вулиць). Йдеться про тематичні вулиці (Themenstraßen), такі як Порцелянова чи Вулканічна, і те, як вони отримали свої назви." },
  "404_5": { "G": "Заголовок: 'Woher hat eine kleine Stadt ihren Namen?' (Звідки маленьке містечко отримало свою назву?). У тексті досліджується походження назви міста Herrenberg, яке вперше згадується у 1228 році." },
  "404_6": { "A": "Журнал проводив опитування, щоб дізнатися, 'як вони почали своє життя в Німеччині' (wie sie ihr Leben in Deutschland angefangen haben)." },
  "404_7": { "C": "Багато людей докладають зусиль, 'щоб жити в Німеччині' (um in Deutschland zu leben). Тут використано інфінітивну конструкцію 'um ... zu'." },
  "404_8": { "A": "Хаді Тегерані любить Гамбург, 'тому що він розташований біля води' (weil sie am Wasser liegt)." },
  "404_9": { "A": "Він щасливий від того, чим займається професійно (Er ist glücklich damit, was er beruflich macht)." },
  "404_10": { "D": "Як архітектор, він розробляє та реалізує проекти для майбутнього (Er entwickelt und realisiert Projekte für die Zukunft)." },
  "404_11": { "C": "Пан Шмідт шукає місце для святкування свого 60-річчя (Feste feiern). Оголошення C (Landhaus Kehl) прямо пропонує послуги для святкувань: 'Feste feiern'." },
  "404_12": { "D": "Вчителька біології шукає екскурсію для школярів. Оголошення D ідеально підходить, оскільки пропонує 'Entdeckungstouren für Klassenstufen' (екскурсії для школярів) у парку птахів (Vogelpark Walsrode)." },
  "404_13": { "A": "Пан Браун мріє літати (Traum vom Fliegen). Оголошення A пропонує школу парапланеризму та дельтапланеризму (Paragliding, Drachen- und Gleitschirm-Flugschulen)." },
  "404_14": { "F": "Сім'я Шнайдер хоче відсвяткувати 12-річчя сина з друзями (Geburtstag). Оголошення F (Rhöntherme) пропонує безкоштовний вхід для іменинника, дитяче меню та фокусника." },
  "404_15": { "E": "Пані Штольц шукає спокійних вихідних на природі (Wochenende im Grünen). Оголошення E (Urlaub im Ferienhaus) пропонує райський спокій (Himmlische Ruhe) у лісовій місцевості." },
  "404_16": { "B": "Сім'я Гірш хоче на море: батьки хочуть спокою, а діти — активностей. Оголошення B (Jugendseeheim Sylt на Північному морі) пропонує як відпочинок, так і великий вибір спортивних та розважальних заходів (Freizeit- und Sportangebot)." },
  "404_17": { "D": "Зміна часу сумнівна, оскільки люди вмикають опалення вранці, 'тому що в березні та квітні вранці ще досить холодно' (weil es im März und April in der Frühe noch ziemlich kalt ist)." },
  "404_18": { "B": "Через переведення годинників 'корів доять в інший час, ніж зазвичай' (werden die Kühe zu anderen Zeiten als sonst gemolken), що порушує їхній біоритм." },
  "404_19": { "H": "Кількість аварій зростає, 'оскільки багато водіїв занадто втомлені та неуважні' (weil viele Autofahrer zu müde und unaufmerksam sind)." },
  "404_20": { "G": "Тому багато експертів вимагають 'відмовитися від переведення часу' (auf die Zeitumstellung verzichten)." }
};

const outPath = path.join(__dirname, '../src/data/tests/german_explanations.json');
let currentExps = {};
if (fs.existsSync(outPath)) {
  currentExps = JSON.parse(fs.readFileSync(outPath, 'utf8'));
}

currentExps = { ...currentExps, ...exps };
fs.writeFileSync(outPath, JSON.stringify(currentExps, null, 2));
console.log('Saved batch 9 (20 questions) to german_explanations.json');
