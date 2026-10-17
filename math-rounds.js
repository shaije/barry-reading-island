// Four exercises per island section. The total never exceeds ten.
const orangePairs = [
  [1, 1], [1, 2], [2, 2], [1, 3],
  [2, 3], [3, 3], [2, 4], [3, 4],
  [4, 4], [3, 5], [4, 5], [5, 5],
];

const sectionNames = ['מתחילים לספור', 'מחברים ביחד', 'אתגר התפוזים'];

function shuffled(values, random) {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function buildOrangeRun(random = Math.random) {
  let previousAnswerPosition = -1;
  return orangePairs.map(([first, second], index) => {
    const left = random() < 0.5 ? first : second;
    const right = left === first ? second : first;
    const total = left + right;
    const options = total === 10 ? [8, 9, 10] : [Math.max(1, total - 1), total, total + 1];
    let choices = shuffled(options, random);
    if (choices.indexOf(total) === previousAnswerPosition) {
      choices = choices.filter(value => value !== total);
      choices.splice((previousAnswerPosition + 1) % options.length, 0, total);
    }
    previousAnswerPosition = choices.indexOf(total);
    return { left, right, total, choices, section: Math.floor(index / 4) };
  });
}

const OrangeMath = { orangePairs, sectionNames, buildOrangeRun };
if (typeof module !== 'undefined') module.exports = OrangeMath;
