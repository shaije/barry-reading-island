const panel = document.getElementById('panel');
const announcer = document.getElementById('announcer');
const soundButton = document.getElementById('sound-button');
const soundLabel = document.getElementById('sound-label');
const sceneBadge = document.getElementById('scene-badge');
const backButton = document.getElementById('back-button');
const boat = document.getElementById('boat');

let difficulty = 'medium';
let rows = ReadingLevels.buildRun(difficulty);

const prompts = {
  'תַ': { label: 'ת עם פתח', audio: 'ta-patach', kind: 'mark' },
  'תָ': { label: 'ת עם קמץ', audio: 'ta-qamats', kind: 'mark' },
  'מַ': { label: 'מ עם פתח', audio: 'ma-patach', kind: 'mark' },
  'מָ': { label: 'מ עם קמץ', audio: 'ma-qamats', kind: 'mark' },
  'ם': { label: 'מם סופית', audio: 'mem-final', kind: 'mark' },
  'תַם': { label: 'המילה ששמעת', audio: 'tam-patach', kind: 'word' },
  'רָם': { label: 'המילה ששמעת', audio: 'ram', kind: 'word' },
  'מַר': { label: 'המילה ששמעת', audio: 'mar', kind: 'word' },
  'תָמָר': { label: 'המילה ששמעת', audio: 'tamar', kind: 'word' },
};

const sounds = Object.fromEntries([
  'homework-intro', 'homework-row-done', 'homework-done',
  'ta-patach', 'ta-qamats', 'ma-patach', 'ma-qamats', 'mem-final', 'tam-patach',
  'ram', 'mar', 'tamar', 'correct', 'try-again',
].map(key => [key, `assets/${key}.m4a`]));

let state = 'start';
let rowIndex = 0;
let itemIndex = 0;
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

function currentItem() { return rows[rowIndex].items[itemIndex]; }
function currentPrompt() { return prompts[currentItem()]; }
function hearAgain() { playSequence([currentPrompt().audio]); }
function setSail(value) { boat.querySelector('.boat-sail').textContent = value; }

function renderStart() {
  state = 'start';
  backButton.hidden = true;
  sceneBadge.textContent = 'אי שיעורי הבית';
  setSail('ת');
  panel.innerHTML = `
    <p class="eyebrow">המשחק של דף ״סיפור לשבת״</p>
    <h1>שש שורות, מסע אחד</h1>
    <p class="intro-copy">בכל שורה נציל את כל הצלילים והמילים. בוחרים את רמת האתגר ויוצאים לדרך.</p>
    <div class="mark-lesson" aria-label="פתח וקמץ">
      <div class="mark-card"><strong>תַ</strong><span>פתח: קו קטן</span></div>
      <div class="mark-card"><strong>תָ</strong><span>קמץ: קו עם רגל</span></div>
    </div>
    <div class="sheet-summary"><span>6 שורות</span><span>22 צלילים ומילים</span><span>ת · מ · ר · ם</span></div>
    <p class="level-heading">איזו רמה מתאימה לך?</p>
    <div class="level-choices" role="group" aria-label="בחירת רמת קושי">
      <button class="level-card" type="button" data-level="easy" aria-pressed="${difficulty === 'easy'}"><strong>קל</strong><span>לפי סדר הדף</span></button>
      <button class="level-card" type="button" data-level="medium" aria-pressed="${difficulty === 'medium'}"><strong>בינוני</strong><span>סדר מפתיע בכל שורה</span></button>
      <button class="level-card" type="button" data-level="hard" aria-pressed="${difficulty === 'hard'}"><strong>קשה</strong><span>יותר כרטיסים דומים</span></button>
    </div>
    <button class="primary" id="start-button" type="button">מתחילים במשימה ←</button>
    <a class="other-game-link" href="math.html">למשחק התפוזים בחשבון</a>
  `;
  document.querySelectorAll('[data-level]').forEach(button => button.addEventListener('click', () => {
    difficulty = button.dataset.level;
    document.querySelectorAll('[data-level]').forEach(card => card.setAttribute('aria-pressed', String(card === button)));
  }));
  document.getElementById('start-button').addEventListener('click', startGame);
}

async function startGame() {
  rows = ReadingLevels.buildRun(difficulty);
  rowIndex = 0;
  itemIndex = 0;
  renderRound();
  await playSequence(['homework-intro', currentPrompt().audio]);
}

function routeProgress() {
  return `<div class="sheet-progress">
    <div class="sheet-progress-label">שורה ${rowIndex + 1} מתוך ${rows.length} · צליל או מילה ${itemIndex + 1} מתוך ${rows[rowIndex].items.length}</div>
    <div class="route-rows" aria-label="התקדמות בשורות">${rows.map((_, index) => `<span class="route-row ${index < rowIndex ? 'done' : index === rowIndex ? 'current' : ''}"></span>`).join('')}</div>
  </div>`;
}

function rowSteps() {
  return `<div class="row-steps" aria-label="התקדמות בשורה">${rows[rowIndex].items.map((value, index) => `<span class="row-step ${index < itemIndex ? 'done' : index === itemIndex ? 'current' : ''}">${index < itemIndex ? value : index === itemIndex ? '★' : '•'}</span>`).join('')}</div>`;
}

function renderRound() {
  state = 'round';
  backButton.hidden = false;
  attempts = 0;
  const item = currentItem();
  const prompt = currentPrompt();
  sceneBadge.textContent = `שורה ${rowIndex + 1} מתוך 6`;
  const heading = prompt.kind === 'mark' ? `מצא: ${prompt.label}` : 'איזו מילה שמעת?';
  const instruction = prompt.kind === 'mark' ? 'מסתכלים על האות ועל הסימן שמתחתיה.' : 'מקשיבים למילה ובוחרים את הכרטיס שלה.';
  const choiceValues = rows[rowIndex].choicesByItem[itemIndex];
  const choices = choiceValues.map(value => `<button class="letter-card" type="button" data-choice="${value}" aria-label="${value}"><span class="choice-letter">${value}</span></button>`).join('');
  panel.innerHTML = `
    <p class="eyebrow">רמת ${ReadingLevels.levels[difficulty].label} · קוראים צעד אחרי צעד</p>
    <h2>${heading}</h2>
    ${routeProgress()}
    ${rowSteps()}
    <p class="instruction">${instruction}</p>
    <button class="hear-button" id="hear-button" type="button">שמע שוב</button>
    <div class="choices ${choiceValues.length >= 4 ? 'four' : ''}">${choices}</div>
    <p class="feedback" id="feedback"></p>
    ${item === 'ם' ? '<p class="tiny-note">מ בסוף מילה נראית כך: ם</p>' : ''}
  `;
  document.getElementById('hear-button').addEventListener('click', hearAgain);
  document.querySelectorAll('[data-choice]').forEach(button => button.addEventListener('click', () => choose(button)));
  announce(heading);
}

function setFeedback(message, error = false) {
  const feedback = document.getElementById('feedback');
  if (feedback) {
    feedback.textContent = message;
    feedback.classList.toggle('error', error);
  }
  announce(message);
}

function choose(button) {
  if (state !== 'round') return;
  const answer = currentItem();
  if (button.dataset.choice === answer) {
    state = 'success';
    document.querySelectorAll('[data-choice]').forEach(card => { card.disabled = true; });
    button.classList.add('correct');
    setFeedback(`נכון! ${answer}`);
    setSail(['ת', 'מ', 'ר', 'ם'][rowIndex % 4]);
    boat.classList.remove('celebrate');
    void boat.offsetWidth;
    boat.classList.add('celebrate');
    const next = document.createElement('button');
    next.className = 'primary next-button';
    next.type = 'button';
    next.textContent = 'ממשיכים ←';
    next.addEventListener('click', advance);
    document.getElementById('feedback').after(next);
    playSequence(['correct']);
    return;
  }
  attempts += 1;
  button.classList.add('wrong');
  const showHint = attempts >= ReadingLevels.levels[difficulty].hintAfter;
  setFeedback(showHint ? 'חפש את הכרטיס המואר.' : 'כמעט. לחץ על שמע שוב ונסה שנית.', true);
  playSequence(['try-again']);
  if (showHint) {
    document.querySelectorAll('[data-choice]').forEach(card => card.classList.toggle('hint', card.dataset.choice === answer));
  }
  window.setTimeout(() => button.classList.remove('wrong'), 650);
}

function advance() {
  if (state !== 'success') return;
  itemIndex += 1;
  if (itemIndex >= rows[rowIndex].items.length) { renderRowDone(); return; }
  renderRound();
  hearAgain();
}

function renderRowDone() {
  state = 'rowDone';
  backButton.hidden = false;
  sceneBadge.textContent = `שורה ${rowIndex + 1} הושלמה`;
  const last = rowIndex === rows.length - 1;
  panel.innerHTML = `
    <p class="eyebrow">כל הכבוד!</p>
    <h2>סיימת את שורה ${rowIndex + 1}</h2>
    <div class="row-complete-word">${rows[rowIndex].items.join(' · ')}</div>
    <p class="instruction">כל הצלילים והמילים בשורה הושלמו.</p>
    <button class="primary" id="row-next" type="button">${last ? 'סיימתי את כל הדף ←' : 'לשורה הבאה ←'}</button>
  `;
  document.getElementById('row-next').addEventListener('click', () => {
    if (last) { renderDone(); return; }
    rowIndex += 1;
    itemIndex = 0;
    renderRound();
    hearAgain();
  });
  announce(`סיימת את שורה ${rowIndex + 1}`);
  playSequence(['homework-row-done']);
}

function renderDone() {
  state = 'done';
  backButton.hidden = false;
  sceneBadge.textContent = 'כל הדף הושלם!';
  setSail('ת');
  panel.innerHTML = `
    <p class="eyebrow">שש שורות הושלמו</p>
    <h1>בארי, סיימת את כל הדף!</h1>
    <div class="completion-stars" aria-hidden="true"><span>★</span><span>★</span><span>★</span></div>
    <p class="completion-copy">קראת את כל 22 הצלילים והמילים ברמת ${ReadingLevels.levels[difficulty].label}, כולל החזרות שבדף.</p>
    <button class="primary" id="again-button" type="button">משחקים שוב ברמת ${ReadingLevels.levels[difficulty].label} ←</button>
    <button class="choose-level-button" id="choose-level-button" type="button">בוחרים רמה אחרת</button>
    <a class="other-game-link" href="math.html">למשחק התפוזים בחשבון</a>
  `;
  document.getElementById('again-button').addEventListener('click', startGame);
  document.getElementById('choose-level-button').addEventListener('click', renderStart);
  announce('בארי, סיימת את כל הדף!');
  playSequence(['homework-done']);
}

function goBack() {
  if (state === 'start') return;
  sequenceId += 1;
  stopAudio();
  if (state === 'done') {
    rowIndex = rows.length - 1;
    itemIndex = rows[rowIndex].items.length - 1;
  } else if (state === 'rowDone') {
    itemIndex = rows[rowIndex].items.length - 1;
  } else if (itemIndex > 0) {
    itemIndex -= 1;
  } else if (rowIndex > 0) {
    rowIndex -= 1;
    itemIndex = rows[rowIndex].items.length - 1;
  } else {
    renderStart();
    return;
  }
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
