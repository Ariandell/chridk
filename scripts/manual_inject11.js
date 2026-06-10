import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const exps = {
  "364_1": { "D": "Заголовок: 'Mehr als Wald' (Більше ніж ліс). У тексті пояснюється, що назва 'Франконський ліс' не зовсім відповідає дійсності, адже лише трохи більше 50 відсотків території складають ліси." },
  "364_2": { "F": "Заголовок: 'Spaß im Schnee' (Веселощі в снігу). У тексті описується санна траса (Rodelbahn) завдовжки 6,5 км, яка дарує зимові розваги." },
  "364_3": { "H": "Заголовок: 'Neuer Service für Skifahrer' (Новий сервіс для лижників). У тексті йдеться про ідеальну погоду для лижного туру та нові послуги для любителів зимового спорту." },
  "364_4": { "A": "Заголовок: 'Die Welt des Moors entdecken' (Відкрити світ боліт). У тексті йдеться про біосферний заповідник, значна частина якого є болотом (Moor), де земля рухається під ногами." },
  "364_5": { "C": "Заголовок: 'Magische Kristallwelt' (Магічний світ кристалів). У тексті описується містичний зимовий пейзаж у Breitachklamm, схожий на світ магії." },
  "364_6": { "D": "Письменник спілкувався з містянами у громадських місцях: 'Er unterhielt sich mit den Stadtbürgern an öffentlichen Orten'." },
  "364_7": { "C": "На конкурс він відправив свою раніше написану коротку історію: 'Er hat zum Wettbewerb seine früher geschriebene Kurzgeschichte geschickt'." },
  "364_8": { "C": "Їхнім завданням було допомагати людям у письмовому спілкуванні: 'Sie sollten Menschen bei der schriftlichen Kommunikation unterstützen'." },
  "364_9": { "B": "У різних містах вони працюють над своїми завданнями різний час: 'In verschiedenen Orten arbeiten sie an ihren Aufgaben unterschiedlich lang'." },
  "364_10": { "D": "Вони повинні фіксувати нові явища в образі міста: 'neue Erscheinungen im Stadtbild fixieren'." },
  "364_11": { "F": "Пані Оффенбах шукає няню для сина на вихідні зранку (am Wochenende vormittags). Оголошення F ідеально підходить, оскільки там вказано робочий час 'Samstag — Sonntag von 7.00 bis 15.00 Uhr'." },
  "364_12": { "H": "Пані Хайнеманн хоче піти на концерт класичної музики. В оголошенні H пропонуються квитки на Філармонічний концерт (твори Бетховена, Мендельсона)." },
  "364_13": { "C": "Пан Бауманн, який працює повний день (ganztags arbeitet), хоче навчитися грати на гітарі. В оголошенні C вказано 'Gitarrenunterricht ... Ideal auch für Berufstätige' (ідеально для працюючих)." },
  "364_14": { "E": "Пан Шиллінг шукає літній табір для сина (3 клас) з корисними заняттями. Оголошення E пропонує 'Ferienbetreuung' (нагляд під час канікул), де діти навчаються, грають, малюють і майструють." },
  "364_15": { "D": "Пан Маттер організовує велику садову вечірку і шукає музикантів різних жанрів. В оголошенні D квартет пропонує 'Von Klassik bis Moderne' (від класики до модерну) на свята." },
  "364_16": { "A": "Пані Адлер шукає роботу, пов'язану з дітьми. В оголошенні A шукають помічників для організації дитячих свят ('Organisation der Kinderfeste', 'Spaß am Umgang mit Kindern')." },
  "364_17": { "C": "Підрядне речення, яке доповнює думку про популярність ринків: 'kommen auch hier von Jahr zu Jahr immer mehr Besucher auf die Märkte' (сюди з кожним роком приходить все більше відвідувачів)." },
  "364_18": { "E": "Після згадки про популярність у різних країнах: 'besonders populär sind sie in Großbritannien' (особливо популярні вони у Великобританії)." },
  "364_19": { "H": "Описується успіх: 'die deutschen Weihnachtsmärkte zu großen Publikumserfolgen geworden' (німецькі різдвяні ярмарки стали великим успіхом у публіки)." },
  "364_20": { "B": "Йдеться про пиття глінтвейну (Glühwein), що зазвичай заборонено на вулицях, але 'auf dem Weihnachtsmarkt ist das ausnahmsweise erlaubt' (на різдвяному ярмарку це як виняток дозволено)." },
  "364_21": { "D": "Уточнення про місто Бірмінгем: 'der zweitgrößten Stadt Großbritanniens' (другого за величиною міста Великобританії)." }
};

const outPath = path.join(__dirname, '../src/data/tests/german_explanations.json');
let currentExps = {};
if (fs.existsSync(outPath)) {
  currentExps = JSON.parse(fs.readFileSync(outPath, 'utf8'));
}

currentExps = { ...currentExps, ...exps };
fs.writeFileSync(outPath, JSON.stringify(currentExps, null, 2));
console.log('Saved batch 11 (21 questions) to german_explanations.json');
