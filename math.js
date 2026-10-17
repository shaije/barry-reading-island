const panel = document.getElementById('panel');
const announcer = document.getElementById('announcer');
const soundButton = document.getElementById('sound-button');
const soundLabel = document.getElementById('sound-label');
const sceneBadge = document.getElementById('scene-badge');
const backButton = document.getElementById('back-button');
const boat = document.getElementById('boat');

const sounds = Object.fromEntries(
  ['math-intro', 'math-prompt', 'math-correct', 'math-try', 'math-done']
    .map(key => [key, `assets/${key}.m4a`]),
);

let state = 'start';
let rounds = [];
let roundIndex = 0;
let attempts = 0;
let muted = false;
let currentAudio = null;
let finishAudio = null;
let sequenceId = 0;

function stopAudio() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  if (finishAudio) { finishAudio(); finishAudio = null; }
}

function playClip(key) {
  stopAudio();
  if (muted || !sounds[key]) return Promise.resolve();
  const clip = new Audio(sounds[key]);
  currentAudio = clip;
  return new Promise(resolve => {
    const finish = () => {
      if (currentAudio === clip) currentAudio = null;
      if (finishAudio === finish) finishAudio = null;
      resolve();
    };
    finishAudio = finish;
    clip.onended = finish;
    clip.onerror = finish;
    clip.play().catch(finish);
  });
}

async function playSequence(keys) {
  const sequence = ++sequenceId;
  for (const key of keys) {
    if (sequence !== sequenceId || muted) return;
    await playClip(key);
  }
}

function announce(message) {
  announcer.textContent = '';
  window.setTimeout(() => { announcer.textContent = message; }, 25);
}

function orange(count, countable = false) {
  return Array.from({ length: count }, () => countable
    ? '<button class="orange countable" type="button" aria-label="תפוז לספירה" aria-pressed="false"></button>'
    : '<span class="orange" aria-hidden="true"></span>').join('');
}

function progress() {
  return `<div class="math-progress" aria-label="תרגיל ${roundIndex + 1} מתוך ${rounds.length}">${rounds.map((_, index) => `<span class="${index < roundIndex ? 'done' : index === roundIndex ? 'current' : ''}"></span>`).join('')}</div>`;
}

function renderStart() {
  state = 'start';
  backButton.hidden = true;
  sceneBadge.textContent = 'אי התפוזים';
  panel.innerHTML = `
    <p class="eyebrow">משחק חשבון קטן</p>
    <h1>כמה תפוזים יש ביחד?</h1>
    <p class="intro-copy">סופרים שתי קבוצות של תפוזים ובוחרים את הסל שבו כולם ביחד.</p>
    <div class="math-preview" aria-hidden="true"><span class="orange"></span><span class="orange"></span><span class="math-plus">+</span><span class="orange"></span></div>
    <button class="primary" id="start-button" type="button">בוא נשחק ←</button>
    <a class="math-other-link" href="homework.html">למשחק האותיות</a>
  `;
  document.getElementById('start-button').addEventListener('click', startGame);
}

function startGame() {
  sequenceId += 1;
  stopAudio();
  rounds = OrangeMath.buildOrangeRun();
  roundIndex = 0;
  renderRound();
  playSequence(['math-intro', 'math-prompt']);
}

function hearAgain() { playSequence(['math-prompt']); }

function renderRound() {
  state = 'round';
  attempts = 0;
  backButton.hidden = false;
  const round = rounds[roundIndex];
  const sectionName = OrangeMath.sectionNames[round.section];
  sceneBadge.textContent = sectionName;
  panel.innerHTML = `
    <p class="eyebrow">${sectionName}</p>
    <h2>כמה תפוזים יש ביחד?</h2>
    ${progress()}
    <div class="math-equation" aria-label="שתי קבוצות תפוזים">
      <div class="math-group" aria-label="קבוצה אחת"><div class="orange-grid">${orange(round.left, true)}</div></div>
      <span class="math-plus" aria-hidden="true">+</span>
      <div class="math-group" aria-label="קבוצה שנייה"><div class="orange-grid">${orange(round.right, true)}</div></div>
    </div>
    <p class="instruction">אפשר לגעת בכל תפוז שכבר ספרת. איזה סל מתאים?</p>
    <button class="hear-button" id="hear-button" type="button">שמע שוב</button>
    <div class="math-choices">${round.choices.map(value => `<button class="math-answer" type="button" data-total="${value}" aria-label="סל עם ${value} ${value === 1 ? 'תפוז' : 'תפוזים'}"><span class="orange-grid">${orange(value)}</span><span class="basket-rim" aria-hidden="true"></span></button>`).join('')}</div>
    <p class="feedback" id="feedback"></p>
  `;
  document.getElementById('hear-button').addEventListener('click', hearAgain);
  document.querySelectorAll('.countable').forEach(button => button.addEventListener('click', () => {
    button.setAttribute('aria-pressed', String(button.getAttribute('aria-pressed') !== 'true'));
  }));
  document.querySelectorAll('[data-total]').forEach(button => button.addEventListener('click', () => choose(button)));
  announce('כמה תפוזים יש ביחד?');
}

function feedback(message, error = false) {
  const element = document.getElementById('feedback');
  element.textContent = message;
  element.classList.toggle('error', error);
  announce(message);
}

function choose(button) {
  if (state !== 'round') return;
  const total = rounds[roundIndex].total;
  if (Number(button.dataset.total) === total) {
    state = 'success';
    document.querySelectorAll('[data-total]').forEach(card => { card.disabled = true; });
    button.classList.add('correct');
    feedback('נכון! כל התפוזים נכנסו לסל.');
    boat.classList.remove('celebrate');
    void boat.offsetWidth;
    boat.classList.add('celebrate');
    const next = document.createElement('button');
    next.className = 'primary next-button';
    next.type = 'button';
    next.textContent = roundIndex === rounds.length - 1 ? 'סיימתי את המסע ←' : 'ממשיכים ←';
    next.addEventListener('click', advance);
    document.getElementById('feedback').after(next);
    playSequence(['math-correct']);
    return;
  }
  attempts += 1;
  button.classList.add('wrong');
  const showHint = attempts >= 2;
  feedback(showHint ? 'הסל המואר מחכה לך.' : 'כמעט! נוגעים בתפוזים וסופרים שוב.', true);
  if (showHint) document.querySelector(`[data-total="${total}"]`).classList.add('hint');
  playSequence(['math-try']);
  window.setTimeout(() => button.classList.remove('wrong'), 650);
}

function advance() {
  if (state !== 'success') return;
  roundIndex += 1;
  if (roundIndex >= rounds.length) { renderDone(); return; }
  renderRound();
  hearAgain();
}

function renderDone() {
  state = 'done';
  backButton.hidden = false;
  sceneBadge.textContent = 'כל התפוזים נאספו!';
  panel.innerHTML = `
    <p class="eyebrow">כל הכבוד!</p>
    <h1>סיימת את מסע התפוזים!</h1>
    <div class="completion-stars" aria-hidden="true"><span>★</span><span>★</span><span>★</span></div>
    <p class="completion-copy">ספרת תפוזים וחיברת שתי קבוצות ביחד.</p>
    <button class="primary" id="again-button" type="button">משחקים שוב ←</button>
    <a class="math-other-link" href="homework.html">למשחק האותיות</a>
  `;
  document.getElementById('again-button').addEventListener('click', startGame);
  announce('סיימת את מסע התפוזים!');
  playSequence(['math-done']);
}

function goBack() {
  if (state === 'start') return;
  sequenceId += 1;
  stopAudio();
  if (state === 'done') roundIndex = rounds.length - 1;
  else if (roundIndex === 0) { renderStart(); return; }
  else roundIndex -= 1;
  renderRound();
  hearAgain();
}

backButton.addEventListener('click', goBack);
soundButton.addEventListener('click', () => {
  muted = !muted;
  sequenceId += 1;
  if (muted) stopAudio();
  soundLabel.textContent = muted ? 'קול כבוי' : 'קול פועל';
  soundButton.setAttribute('aria-label', muted ? 'הפעלת קול' : 'כיבוי קול');
  soundButton.title = muted ? 'הפעלת קול' : 'כיבוי קול';
  if (!muted && state === 'round') hearAgain();
});
renderStart();
