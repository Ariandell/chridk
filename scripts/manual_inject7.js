import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const exps = {
  "480_1": { "G": "Правильний заголовок: 'Seit wann gibt es Videospiele?' (З якого часу існують відеоігри?). Текст розповідає про історію створення відеоігор." },
  "480_2": { "B": "Заголовок: 'Wie haben Videospiele die Welt erobert?' (Як відеоігри підкорили світ?). Текст описує їхню популяризацію." },
  "480_3": { "E": "Заголовок: 'Wie wirken auf uns Videospiele?' (Як відеоігри впливають на нас?). Йдеться про психологічний або емоційний вплив." },
  "480_4": { "C": "Заголовок: 'Wie wird man vom Spielen abhängig?' (Як стають залежними від ігор?). Описується механізм ігрової залежності." },
  "480_5": { "D": "Заголовок: 'Lässt sich mit Videospielen verdienen?' (Чи можна заробляти на відеоіграх?). Йдеться про кіберспорт та монетизацію." },
  "480_6": { "B": "Він обрав цей заклад завдяки його гарному іміджу (dank dem guten Image dieser Fachhochschule)." },
  "480_7": { "B": "Він опанував німецьку ще у своєму рідному місті (in seiner Heimatstadt beherrscht), тому не мав проблем з мовою." },
  "480_8": { "A": "Навчальний матеріал в RWTH (технічний університет) виявився для нього справді складним (richtig kompliziert)." },
  "480_9": { "B": "Він підробляє тим, що дає додаткові уроки з математики студентам, яким це потрібно (gibt Mathe-Nachhilfe)." },
  "480_10": { "C": "Його план — працювати над своєю бакалаврською роботою в Японії (an seiner Bachelorarbeit in Japan zu arbeiten)." },
  "480_11": { "D": "Апартаменти 'Aparthotel Boardinghouse Rosenstraße' знаходяться в центрі (im Herzen der Stadt) і мають все необхідне для короткого візиту." },
  "480_12": { "H": "Квартира-лофт (Gäste-Wohnung mit Loftcharakter) підходить для тривалого перебування в центрі з послугами прибирання." },
  "480_13": { "F": "Оголошення про пошук квартири на Балтійському морі (Ostsee) для сім'ї без домашніх тварин (Keine Haustiere)." },
  "480_14": { "B": "Оголошення про пошук будинку на Майорці (Mallorca) для відпустки на тривалий час." },
  "480_15": { "G": "Великий будинок 'Herrenhaus Sieber' ідеально підходить для великої компанії з дітьми та друзями (Freizeitangebote)." },
  "480_16": { "C": "Квартира 'Wohnen im Grünen' дозволяє насолодитися природою, але при цьому бути близько до міста." },
  "480_17": { "D": "Він скаржиться, що його телефон ніколи не дзвонить (dass sein Telefon nie klingelt)." },
  "480_18": { "G": "Але виявляється, що вона просто помилилася номером (sie hat sich nur verwählt)." },
  "480_19": { "B": "Підрядне речення з відносним займенником: 'das er ... gegründet hat' (яке він заснував)." },
  "480_20": { "F": "Він здобув освіту баритона (und machte eine Ausbildung zum Bariton-Sänger)." },
  "480_21": { "H": "Причина (weil): тому що три члени сектету були євреями." },
  "480_22": { "E": "Питальне підрядне речення: 'welche Lieder ... singen soll' (які пісні йому слід співати)." },
  "480_23": { "E": "Стійкий вираз 'einen Fehler machen' (зробити помилку)." },
  "480_24": { "C": "Інгредієнти (Zutaten). У супермаркеті продукти лежать як інгредієнти для страв." },
  "480_25": { "G": "Продукти не просто розкладені, а впорядковані (geordnet) за рецептами." },
  "480_26": { "D": "Сполучник порівняння 'wie' (як). Наприклад: як гарнір." },
  "480_27": { "F": "Гарнір (Beilage). Це те, що подається до основної страви." },
  "480_28": { "D": "Подорож на автомобілі (Autoreise)." },
  "480_29": { "A": "Ціни на бензин стають вищими (höher). Ступінь порівняння прикметників: https://mein-deutschbuch.de/komparation.html" },
  "480_30": { "F": "Дієслово 'sparen' (економити). Водії хочуть зекономити на паливі." },
  "480_31": { "B": "Сполучник 'wie' (як)." },
  "480_32": { "C": "Функція (Funktion). Додатки мають функцію показувати найдешевші заправки." }
};

const outPath = path.join(__dirname, '../src/data/tests/german_explanations.json');
let currentExps = {};
if (fs.existsSync(outPath)) {
  currentExps = JSON.parse(fs.readFileSync(outPath, 'utf8'));
}

currentExps = { ...currentExps, ...exps };
fs.writeFileSync(outPath, JSON.stringify(currentExps, null, 2));
console.log('Saved batch 7 (32 questions) to german_explanations.json');
