const assert = require('node:assert/strict');
const { orangePairs, buildOrangeRun } = require('../math-rounds.js');

function seeded(seed) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 2 ** 32;
  };
}

for (let seed = 0; seed < 100; seed++) {
  const rounds = buildOrangeRun(seeded(seed));
  assert.equal(rounds.length, 12);
  rounds.forEach((round, index) => {
    assert.deepEqual([round.left, round.right].sort(), [...orangePairs[index]].sort());
    assert.equal(round.left + round.right, round.total);
    assert.ok(round.total >= 2 && round.total <= 10);
    assert.equal(round.section, Math.floor(index / 4));
    assert.equal(round.choices.length, 3);
    assert.equal(new Set(round.choices).size, 3);
    assert.equal(round.choices.filter(value => value === round.total).length, 1);
    assert.ok(round.choices.every(value => value >= 1 && value <= 10));
    if (index > 0) {
      assert.notEqual(round.choices.indexOf(round.total), rounds[index - 1].choices.indexOf(rounds[index - 1].total));
    }
  });
}
console.log('All 12 orange sums and distractors are valid across 100 runs.');
