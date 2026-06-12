const fs = require('fs');
const path = require('path');

// Mapping broken URLs to their correct replacements based on the actual sitemap
const replacements = {
  'https://mein-deutschbuch.de/deklination-uebersicht.html': 'https://mein-deutschbuch.de/nomen-substantive.html',
  'https://mein-deutschbuch.de/adjektivdeklination.html': 'https://mein-deutschbuch.de/adjektive.html',
  'https://mein-deutschbuch.de/komparation.html': 'https://mein-deutschbuch.de/komparativ-superlativ.html',
  'https://mein-deutschbuch.de/nominalisierte-adjektive.html': 'https://mein-deutschbuch.de/adjektive-und-partizipien-als-nomen.html',
  'https://mein-deutschbuch.de/kardinalzahlen.html': 'https://mein-deutschbuch.de/zahlwoerter.html',
  'https://mein-deutschbuch.de/ordinalzahlen.html': 'https://mein-deutschbuch.de/zahlwoerter.html',
  'https://mein-deutschbuch.de/bruchzahlen.html': 'https://mein-deutschbuch.de/zahlwoerter.html',
  'https://mein-deutschbuch.de/pronomen.html': 'https://mein-deutschbuch.de/personalpronomen.html',
  'https://mein-deutschbuch.de/hilfsverben.html': 'https://mein-deutschbuch.de/verben.html',
  'https://mein-deutschbuch.de/verb-lassen.html': 'https://mein-deutschbuch.de/verben.html',
  'https://mein-deutschbuch.de/partizipien.html': 'https://mein-deutschbuch.de/partizipien-als-adjektive.html',
  'https://mein-deutschbuch.de/passiv-mit-modalverben.html': 'https://mein-deutschbuch.de/passiv-formen.html',
  'https://mein-deutschbuch.de/modalverben-im-perfekt.html': 'https://mein-deutschbuch.de/modalverben.html',
  'https://mein-deutschbuch.de/adverbien.html': 'https://mein-deutschbuch.de/adverbien-umstandswoerter.html',
  'https://mein-deutschbuch.de/pronominaladverbien.html': 'https://mein-deutschbuch.de/praepositionalergaenzung.html',
  'https://mein-deutschbuch.de/haben-sein-zu-infinitiv.html': 'https://mein-deutschbuch.de/infinitivkonstruktionen.html',
  'https://mein-deutschbuch.de/mehrteilige-konjunktionen.html': 'https://mein-deutschbuch.de/nebensaetze.html',
  'https://mein-deutschbuch.de/passiv.html': 'https://mein-deutschbuch.de/passiv-formen.html',
  'https://mein-deutschbuch.de/relativpronomen.html': 'https://mein-deutschbuch.de/nebensaetze.html',
  'https://mein-deutschbuch.de/interrogativpronomen.html': 'https://mein-deutschbuch.de/interrogativartikel.html',
};

const files = [
  path.join(__dirname, '../src/data/grammar.json'),
  path.join(__dirname, '../src/data/tests/evi_german.json'),
  path.join(__dirname, '../src/data/tests/german_explanations.json'),
];

let totalReplacements = 0;

files.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let fileReplacements = 0;
  
  for (const [broken, fixed] of Object.entries(replacements)) {
    const count = (content.split(broken).length - 1);
    if (count > 0) {
      content = content.split(broken).join(fixed);
      fileReplacements += count;
      console.log(`  ${path.basename(filePath)}: ${broken} → ${fixed} (${count}x)`);
    }
  }
  
  if (fileReplacements > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  ✅ Збережено ${path.basename(filePath)} (${fileReplacements} замін)\n`);
  } else {
    console.log(`  ℹ️  ${path.basename(filePath)}: немає зламаних лінків\n`);
  }
  
  totalReplacements += fileReplacements;
});

console.log(`\n========== ГОТОВО ==========`);
console.log(`Всього замінено: ${totalReplacements} лінків у ${files.length} файлах`);
