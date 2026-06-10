import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const exps = {
  "632_12": {
    "C": "У тексті далі перелічуються причини (Gründe): «Erstens... Zweitens... Und der dritte Grund...».",
    "A": "gebacken (спечений) - не підходить за змістом і граматикою.",
    "B": "nach (після/в) - прийменник, не підходить.",
    "D": "reisen (подорожувати) - дієслово.",
    "E": "zu (до) - прийменник.",
    "F": "Getreide (зерно) - не підходить за контекстом.",
    "G": "gegessen (з'їдений).",
    "H": "machen (робити)."
  },
  "632_13": {
    "F": "Далі перелічуються жито, полба, пшениця, ячмінь (Roggen, Dinkel, Weizen...). Це все види зернових культур (Getreide).",
    "A": "gebacken",
    "B": "nach",
    "C": "Gründe",
    "D": "reisen",
    "E": "zu",
    "G": "gegessen",
    "H": "machen"
  },
  "632_14": {
    "H": "Стійкий вираз «eine Wanderung machen» (здійснювати мандрівку). Тут у формі інфінітива з часткою zu: «eine Wanderung zu machen».",
    "A": "gebacken",
    "B": "nach",
    "C": "Gründe",
    "D": "reisen (reisen - це дієслово, не можна сказати Wanderung reisen)",
    "E": "zu",
    "F": "Getreide",
    "G": "gegessen"
  },
  "632_15": {
    "B": "Стійкий вираз «nach Hause bringen» (приносити додому).",
    "A": "gebacken",
    "C": "Gründe",
    "D": "reisen",
    "E": "zu Hause - означає вдома, а тут рух (куди?) - nach Hause.",
    "F": "Getreide",
    "G": "gegessen",
    "H": "machen"
  },
  "632_16": {
    "G": "Пасивний стан (Passiv): «wird viel Brot gegessen» (їдять багато хліба). Дієслово werden + Partizip II.",
    "A": "gebacken (могло б підійти, але далі йде перелік: на сніданок, на вечерю, отже його їдять).",
    "B": "nach",
    "C": "Gründe",
    "D": "reisen",
    "E": "zu",
    "F": "Getreide",
    "H": "machen"
  },
  "632_17": {
    "D": "З контексту зрозуміло, що феєрверки красиві, але небезпечні (gefährlich), тому їх продаж суворо обмежений за віком і часом.",
    "A": "nützlich (корисні) - не підходить.",
    "B": "vor (перед)",
    "C": "Geld (гроші)",
    "E": "Feuer (вогонь)",
    "F": "ignorieren",
    "G": "am",
    "H": "finden"
  },
  "632_18": {
    "B": "Прийменник часу: «drei Tage vor Silvester» (за три дні до Нового року).",
    "A": "nützlich",
    "C": "Geld",
    "D": "gefährlich",
    "E": "Feuer",
    "F": "ignorieren",
    "G": "am (в/на - am Silvester означало б 'на Новий рік', але тут 'за 3 дні до')",
    "H": "finden"
  },
  "632_19": {
    "F": "Люди ігнорують (ignorieren) правила і запускають ракети раніше дозволеного часу.",
    "A": "nützlich",
    "B": "vor",
    "C": "Geld",
    "D": "gefährlich",
    "E": "Feuer",
    "G": "am",
    "H": "finden"
  },
  "632_20": {
    "H": "Багато людей вважають (finden): феєрверк дорогий і створює багато сміття.",
    "A": "nützlich",
    "B": "vor",
    "C": "Geld",
    "D": "gefährlich",
    "E": "Feuer",
    "F": "ignorieren",
    "G": "am"
  },
  "632_22": {
    "A": "Дієслово helfen вимагає прийменника bei + Dativ: «beim Kauf helfen» (допомагати при покупці).",
    "B": "zum - неправильний прийменник для helfen.",
    "C": "am - не підходить.",
    "D": "im - не підходить."
  },
  "632_23": {
    "B": "Вказівний займенник «solcher» (такий). У родовому відмінку (Genitiv) середнього роду: «eines solchen Autos».",
    "A": "solches - називний/знахідний.",
    "C": "solchem - давальний.",
    "D": "solche - жіночий або множина."
  },
  "632_24": {
    "C": "Пасивний стан у минулому часі (Präteritum Passiv): «wurden nicht mehr Elektroautos verkauft» (не було продано більше електроавтомобілів). Множина, тому wurden.",
    "A": "wird - теперішній час, однина.",
    "B": "würden - кон'юнктив (умовний спосіб).",
    "D": "wurde - минулий час, однина."
  },
  "632_25": {
    "A": "Прийменник als у значенні «як»: «4000 Euro als Geschenk» (4000 євро як подарунок).",
    "B": "mit - з.",
    "C": "für - для.",
    "D": "zu - до."
  },
  "632_26": {
    "B": "Стійке керування: «Kosten für etwas» (витрати на щось). Kosten für die Batterien.",
    "A": "über - про/над.",
    "C": "in - в.",
    "D": "durch - через."
  },
  "632_27": {
    "A": "Родовий відмінок (Genitiv) множини від die Elektroautos -> «der Elektroautos» (запас ходу електроавтомобілів).",
    "B": "die - називний/знахідний.",
    "C": "den - давальний множини.",
    "D": "dem - давальний однини чоловічого/середнього."
  },
  "632_28": {
    "A": "Модальне дієслово (muss) вимагає інфінітива в кінці речення: «aufladen» (заряджати).",
    "B": "aufgeladen - Partizip II (використовується в минулому часі або пасиві).",
    "C": "laden auf - змінюваний порядок (для головного речення без модального).",
    "D": "aufladet - особова форма."
  },
  "632_29": {
    "C": "За змістом підходить модальне дієслово sollen (повинні, слід): «Autofahrer sollen deshalb öfter Pausen machen» (Водіям слід робити паузи частіше).",
    "A": "dürfen (мати дозвіл) - не підходить за змістом.",
    "B": "können (могти) - граматично можливо, але sollen краще передає рекомендацію/необхідність через малий запас ходу.",
    "D": "möchten (хотіли б) - водії навряд чи цього хочуть."
  },
  "632_30": {
    "C": "Відносний займенник (Relativpronomen) у давальному відмінку множини (Dativ Plural): «an denen» (на яких).",
    "A": "den - артикль/займенник знахідного відмінку.",
    "B": "der - однина жіночий рід (Dativ) або множина (Genitiv).",
    "D": "deren - родовий відмінок."
  }
};

const outPath = path.join(__dirname, '../src/data/tests/german_explanations.json');
let currentExps = {};
if (fs.existsSync(outPath)) {
  currentExps = JSON.parse(fs.readFileSync(outPath, 'utf8'));
}

currentExps = { ...currentExps, ...exps };
fs.writeFileSync(outPath, JSON.stringify(currentExps, null, 2));
console.log('Saved batch 3 (18 questions) to german_explanations.json');
