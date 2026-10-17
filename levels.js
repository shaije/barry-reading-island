// Every occurrence on the worksheet is intentional, including repeated answers.
const worksheetRows = [
  { choices: ['תַ', 'תָ', 'מַ'], items: ['תַ', 'תָ', 'תַ', 'תָ'] },
  { choices: ['מַ', 'מָ', 'ם'], items: ['מַ', 'מָ', 'ם', 'מָ'] },
  { choices: ['תַם', 'רָם', 'מַר'], items: ['תַם', 'רָם', 'מַר'] },
  { choices: ['מָ', 'תַם', 'מַ', 'רָם'], items: ['מָ', 'תַם', 'מַ', 'תַם'] },
  { choices: ['רָם', 'תַם', 'מַר'], items: ['רָם', 'רָם', 'תַם'] },
  { choices: ['תָמָר', 'מַר', 'רָם', 'תַם'], items: ['תָמָר', 'מַר', 'רָם', 'תַם'] },
];

const marks = ['תַ', 'תָ', 'מַ', 'מָ', 'ם'];
const words = ['תַם', 'רָם', 'מַר', 'תָמָר'];
const levels = {
  easy: { label: 'קל', hintAfter: 2 },
  medium: { label: 'בינוני', hintAfter: 2 },
  hard: { label: 'קשה', hintAfter: 3 },
};

function shuffle(values, random) {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function permutations(items) {
  const result = [];
  const visit = (path, remaining) => {
    if (!remaining.length) { result.push(path); return; }
    for (const value of new Set(remaining)) {
      const index = remaining.indexOf(value);
      visit([...path, value], remaining.filter((_, i) => i !== index));
    }
  };
  visit([], items);
  return result;
}

function chooseItemOrder(items, level, random) {
  if (level === 'easy') return [...items];
  const original = items.join('|');
  let candidates = permutations(items).filter(order => order.join('|') !== original);
  if (level === 'hard') {
    const repeatedNeighbors = order => order.reduce((count, value, i) => count + (i > 0 && value === order[i - 1] ? 1 : 0), 0);
    const fewest = Math.min(...candidates.map(repeatedNeighbors));
    candidates = candidates.filter(order => repeatedNeighbors(order) === fewest);
  }
  return [...candidates[Math.floor(random() * candidates.length)]];
}

function chooseCards(cards, answer, previousAnswerPosition, random) {
  let order = shuffle(cards, random);
  if (order.indexOf(answer) === previousAnswerPosition) {
    const nextPosition = (previousAnswerPosition + 1) % cards.length;
    order = [...order.filter(card => card !== answer)];
    order.splice(nextPosition, 0, answer);
  }
  return order;
}

function buildRun(level, random = Math.random) {
  if (!levels[level]) throw new Error(`Unknown level: ${level}`);
  return worksheetRows.map(row => {
    const items = chooseItemOrder(row.items, level, random);
    let previousAnswerPosition = -1;
    const choicesByItem = items.map(answer => {
      const cards = level === 'hard' ? (marks.includes(answer) ? marks : words) : row.choices;
      const choices = level === 'easy' ? [...cards] : chooseCards(cards, answer, previousAnswerPosition, random);
      previousAnswerPosition = choices.indexOf(answer);
      return choices;
    });
    return { items, choicesByItem };
  });
}

const ReadingLevels = { worksheetRows, levels, buildRun };
if (typeof module !== 'undefined') module.exports = ReadingLevels;
