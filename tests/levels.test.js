const assert = require('node:assert/strict');
const { worksheetRows, buildRun } = require('../levels.js');

function seeded(seed) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 2 ** 32;
  };
}

function counts(values) {
  return [...values].sort().join('|');
}

for (const level of ['easy', 'medium', 'hard']) {
  for (let seed = 0; seed < 100; seed++) {
    const run = buildRun(level, seeded(seed));
    assert.equal(run.length, 6);
    assert.equal(run.reduce((total, row) => total + row.items.length, 0), 22);
    run.forEach((row, rowIndex) => {
      const original = worksheetRows[rowIndex];
      assert.equal(counts(row.items), counts(original.items), `${level}: row ${rowIndex + 1} lost a repeated item`);
      if (level === 'easy') assert.deepEqual(row.items, original.items);
      else assert.notDeepEqual(row.items, original.items, `${level}: row ${rowIndex + 1} did not change`);
      if (level === 'hard') {
        assert.equal(row.items.some((item, i) => i > 0 && item === row.items[i - 1]), false);
      }
      row.items.forEach((answer, itemIndex) => {
        const cards = row.choicesByItem[itemIndex];
        assert.equal(cards.filter(card => card === answer).length, 1);
        assert.equal(new Set(cards).size, cards.length);
        const hardChoices = ['תַ', 'תָ', 'מַ', 'מָ', 'ם'].includes(answer) ? 5 : 4;
        assert.equal(cards.length, level === 'hard' ? hardChoices : original.choices.length);
        if (level === 'easy') assert.deepEqual(cards, original.choices);
        if (level !== 'easy' && itemIndex > 0) {
          assert.notEqual(cards.indexOf(answer), row.choicesByItem[itemIndex - 1].indexOf(row.items[itemIndex - 1]));
        }
      });
    });
  }
}
console.log('All 3 levels preserve 22 items and valid choices across 100 runs each.');
