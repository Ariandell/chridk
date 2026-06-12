const fs = require('fs');
const path = require('path');

const explanationsPath = path.join(__dirname, '../src/data/tests/german_explanations.json');
const eviPath = path.join(__dirname, '../src/data/tests/evi_german.json');

const explanationsData = JSON.parse(fs.readFileSync(explanationsPath, 'utf8'));
const eviData = JSON.parse(fs.readFileSync(eviPath, 'utf8'));

let movedLinksCount = 0;

eviData.sessions.forEach(session => {
  session.questions.forEach(q => {
    const qExps = explanationsData[q.id];
    if (!qExps) return;

    let foundLink = null;

    // Шукаємо лінк у всіх відповідях
    for (const key of Object.keys(qExps)) {
      const match = qExps[key].match(/\n\nДетальніше про це правило: \[(.*?)\]\((.*?)\)/);
      if (match) {
        foundLink = `\n\n💡 Підказка: Детальніше про граматику для цього завдання: [${match[1]}](${match[2]})`;
        // Видаляємо лінк з відповіді
        qExps[key] = qExps[key].replace(match[0], '');
      }
    }

    // Якщо знайшли лінк, додаємо його до тексту питання
    if (foundLink) {
      if (!q.text.includes('💡 Підказка')) {
        q.text += foundLink;
        movedLinksCount++;
      }
    }
  });
});

fs.writeFileSync(explanationsPath, JSON.stringify(explanationsData, null, 2), 'utf8');
fs.writeFileSync(eviPath, JSON.stringify(eviData, null, 2), 'utf8');

console.log(`Успішно переміщено ${movedLinksCount} лінків з відповідей до питань!`);
