// ═══════════════════════════════════════════════
//  Dotadle — Game Logic (Protected Scope)
// ═══════════════════════════════════════════════

(() => {

// Anti-cheat warning for sneaky devs opening F12 console
console.log(
  '%c🛑 DOTADLE ANTI-CHEAT 🛑\n%cLooking for the answer? Nice try! True Dota players guess fair 🎮',
  'color: #f87171; font-size: 18px; font-weight: bold;',
  'color: #c8aa6e; font-size: 13px;'
);

const IMG_BASE   = "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/";
const ABILITY_BASE = "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/";

// ─── State ───────────────────────────────────────
let state = {
  mode: 'classic',          // classic | splash | ability | emoji | lore | quote
  targetHero: null,
  guesses: [],
  maxGuesses: 8,
  solved: false,
  gaveUp: false,
  unlimited: true,          // always unlimited
  challengeMode: false,
  abilityIndex: 0,
  revealedLoreLines: 1,
};

// ─── i18n ─────────────────────────────────────────
const LANG = { current: 'en' };
const T = {
  en: {
    title: 'DOTADLE',
    subtitle: 'Guess the Dota 2 Hero',
    classic: 'Classic', splash: 'Splash', ability: 'Ability',
    emoji: 'Emoji', lore: 'Lore', quote: 'Quote',
    placeholder: 'Type a hero name...',
    guess: 'Guess',
    giveup: 'Give Up',
    newgame: 'New Hero',
    challenge: '⚔️ Challenge Friend',
    share: '📋 Share Result',
    copied: 'Copied!',
    solved: '🎉 Correct!',
    gaveup: '😔 The hero was:',
    tries: 'tries',
    try: 'try',
    attribute: 'Attribute', attack: 'Attack',
    roles: 'Roles', complexity: 'Complexity',
    legs: 'Legs', gender: 'Gender',
    clue: 'Clue',
    challengeTitle: '⚔️ Challenge Mode',
    challengeDesc: 'Share this link with a friend. They must guess the same hero!',
    challengeActive: '🔗 Challenge active — Same hero as your friend!',
    dailyActive: '📅 Today\'s Daily Hero Challenge — Same hero for all players today!',
    higher: '↑ Higher', lower: '↓ Lower',
    male: 'Male', female: 'Female', other: 'Other',
    melee: 'Melee', ranged: 'Ranged',
    splash_hint: 'Identify the hero from their portrait',
    ability_hint: 'Which hero has this ability?',
    emoji_hint: 'Which hero do these emojis represent?',
    lore_hint: 'Identify the hero from their lore',
    quote_hint: 'Which hero said this?',
    played: 'Played', winrate: 'Win Rate',
    curr_streak: 'Current Streak', max_streak: 'Best Streak',
    guess_dist: 'Guess Distribution',
  },
  tr: {
    title: 'DOTADLE',
    subtitle: 'Dota 2 Heroyu Tahmin Et',
    classic: 'Klasik', splash: 'Portre', ability: 'Yetenek',
    emoji: 'Emoji', lore: 'Lore', quote: 'Alıntı',
    placeholder: 'Hero adı yaz...',
    guess: 'Tahmin Et',
    giveup: 'Pes Et',
    newgame: 'Yeni Hero',
    challenge: '⚔️ Arkadaşa Meydan Oku',
    share: '📋 Paylaş',
    copied: 'Kopyalandı!',
    solved: '🎉 Doğru!',
    gaveup: '😔 Hero şuydu:',
    tries: 'denemede',
    try: 'denemede',
    attribute: 'Özellik', attack: 'Saldırı',
    roles: 'Roller', complexity: 'Zorluk',
    legs: 'Bacak', gender: 'Cinsiyet',
    clue: 'İpucu',
    challengeTitle: '⚔️ Meydan Okuma',
    challengeDesc: 'Bu linki arkadaşına gönder. Aynı hero\'yu tahmin etmeye çalışsın!',
    challengeActive: '🔗 Meydan okuma aktif — Arkadaşınla aynı hero!',
    dailyActive: '📅 Günün Hero\'su Modu — Bugün dünya genelindeki herkes aynı hero\'yu oynuyor!',
    higher: '↑ Daha Yüksek', lower: '↓ Daha Düşük',
    male: 'Erkek', female: 'Kadın', other: 'Diğer',
    melee: 'Yakın', ranged: 'Uzak',
    splash_hint: 'Portreye bakarak hero\'yu bul',
    ability_hint: 'Bu yeteneğe sahip hero kim?',
    emoji_hint: 'Bu emojiler hangi hero\'yu temsil ediyor?',
    lore_hint: 'Lore\'dan hero\'yu tahmin et',
    quote_hint: 'Bu sözü kim söyledi?',
    played: 'Oynanan', winrate: 'Kazanma %',
    curr_streak: 'Seri', max_streak: 'En İyi Seri',
    guess_dist: 'Tahmin Dağılımı',
  }
};
const t = (key) => T[LANG.current][key] || key;

// ─── Hero Image Helpers ───────────────────────────
const HERO_IMG_MAP = {
  wraith_king: 'skeleton_king',
  windranger: 'windrunner',
  timbersaw: 'shredder',
  necrophos: 'necrolyte',
  natures_prophet: 'furion',
  outworld_destroyer: 'obsidian_destroyer',
  zeus: 'zuus',
  doom: 'doom_bringer',
  shadow_fiend: 'nevermore',
  queen_of_pain: 'queenofpain',
  clockwerk: 'rattletrap',
  underlord: 'abyssal_underlord',
  vengefulspirit: 'vengefulspirit',
};
const heroImg = (id) => `${IMG_BASE}${HERO_IMG_MAP[id] || id}.png`;
const abilityImg = (id) => `${ABILITY_BASE}${id}.png`;

// ─── Legs Map & Helper ─────────────────────────────
const LEGS_MAP = {
  broodmother: 8,
  centaur: 4, leshrac: 4, enchantress: 4, obsidian_destroyer: 4,
  weaver: 6, nyx_assassin: 6, techies: 6,
  slardar: 0, naga_siren: 0, medusa: 0, morphling: 0, enigma: 0, wisp: 0, io: 0, viper: 0, venomancer: 0, ancient_apparition: 0, razor: 0, death_prophet: 0, nevermore: 0, shadow_demon: 0,
};
function getHeroLegs(hero) {
  if (hero.legs !== undefined) return hero.legs;
  if (LEGS_MAP[hero.id] !== undefined) return LEGS_MAP[hero.id];
  return 2;
}

// ─── Daily Hero Seed ──────────────────────────────
function getDailyHero() {
  const today = new Date().toISOString().slice(0, 10);
  let hash = 0;
  for (let i = 0; i < today.length; i++) hash = today.charCodeAt(i) + ((hash << 5) - hash);
  const index = Math.abs(hash) % HEROES_UNIQUE.length;
  return HEROES_UNIQUE[index];
}

// ─── Encode/Decode for Challenge Mode ────────────
function encodeHeroId(id) {
  return btoa(id).split('').reverse().join('').replace(/=/g, '_');
}
function decodeHeroId(encoded) {
  try {
    const b64 = encoded.replace(/_/g, '=').split('').reverse().join('');
    return atob(b64);
  } catch { return null; }
}

// ─── Played History Queue (No Repeats) ─────────────
function getPlayedHistory() {
  try {
    return JSON.parse(localStorage.getItem('dotadle_history') || '[]');
  } catch { return []; }
}

function recordPlayedHero(id) {
  const history = getPlayedHistory();
  if (!history.includes(id)) {
    history.push(id);
    if (history.length >= HEROES_UNIQUE.length - 1) {
      localStorage.setItem('dotadle_history', JSON.stringify([id]));
    } else {
      localStorage.setItem('dotadle_history', JSON.stringify(history));
    }
  }
}

// ─── Pick Random Hero (Non-Repeating) ──────────────
function pickRandomHero(excludeId = null) {
  const history = getPlayedHistory();
  let pool = HEROES_UNIQUE.filter(h => h.id !== excludeId && !history.includes(h.id));
  if (pool.length === 0) {
    // If all 120 heroes played, reset pool
    pool = HEROES_UNIQUE.filter(h => h.id !== excludeId);
    localStorage.removeItem('dotadle_history');
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

// ─── Comparison Logic ─────────────────────────────
function compareRoles(guessRoles, answerRoles) {
  const common = guessRoles.filter(r => answerRoles.includes(r)).length;
  if (common === 0) return { result: 'wrong', text: guessRoles.join(', ') };
  if (common === answerRoles.length && guessRoles.length === answerRoles.length) return { result: 'exact', text: guessRoles.join(', ') };
  return { result: 'partial', text: guessRoles.join(', ') };
}

function compareNum(guessVal, answerVal, tolerance = 0) {
  if (guessVal === answerVal) return { result: 'exact', arrow: null };
  if (Math.abs(guessVal - answerVal) <= tolerance) return { result: 'partial', arrow: guessVal < answerVal ? 'up' : 'down' };
  return { result: 'wrong', arrow: guessVal < answerVal ? 'up' : 'down' };
}

function compareHeroes(guess, answer) {
  const complexCmp = compareNum(guess.complexity, answer.complexity, 0);
  const guessLegs = getHeroLegs(guess);
  const answerLegs = getHeroLegs(answer);
  const legsCmp = compareNum(guessLegs, answerLegs, 0);

  return {
    attribute: { result: guess.attribute === answer.attribute ? 'exact' : 'wrong', text: guess.attribute },
    attack:    { result: guess.attack === answer.attack ? 'exact' : 'wrong', text: guess.attack },
    roles:     compareRoles(guess.roles, answer.roles),
    complexity:{ result: complexCmp.result, text: guess.complexity, arrow: complexCmp.arrow },
    legs:      { result: legsCmp.result, text: guessLegs, arrow: legsCmp.arrow },
    gender:    { result: guess.gender === answer.gender ? 'exact' : 'wrong', text: guess.gender },
  };
}

// ─── Render Guess Row (Classic) ───────────────────
function renderGuessRow(guess, comparison, isAnswer = false) {
  const cells = [
    { label: 'name', value: guess.name, result: isAnswer ? 'exact' : 'wrong', img: heroImg(guess.id) },
    { label: t('attribute'), value: comparison.attribute.text, result: comparison.attribute.result },
    { label: t('attack'),    value: comparison.attack.text,    result: comparison.attack.result },
    { label: t('roles'),     value: comparison.roles.text,     result: comparison.roles.result },
    { label: t('complexity'),value: '★'.repeat(Number(comparison.complexity.text) || 1), result: comparison.complexity.result, arrow: comparison.complexity.arrow },
    { label: t('legs'),      value: comparison.legs.text,      result: comparison.legs.result, arrow: comparison.legs.arrow },
    { label: t('gender'),    value: guess.gender,              result: comparison.gender.result },
  ];

  const row = document.createElement('div');
  row.className = 'guess-row';

  cells.forEach((cell, i) => {
    const div = document.createElement('div');
    div.className = `guess-cell result-${cell.result}`;
    div.style.animationDelay = `${i * 80}ms`;
    div.classList.add('flip-in');

    if (cell.img) {
      const img = document.createElement('img');
      img.src = cell.img;
      img.className = 'hero-mini-img';
      img.onerror = () => img.style.display = 'none';
      div.appendChild(img);
    }

    const span = document.createElement('span');
    span.className = 'cell-value';
    span.textContent = cell.value;
    div.appendChild(span);

    if (cell.arrow) {
      const arrow = document.createElement('span');
      arrow.className = `cell-arrow arrow-${cell.arrow}`;
      arrow.textContent = cell.arrow === 'up' ? '↑' : '↓';
      div.appendChild(arrow);
    }

    const label = document.createElement('span');
    label.className = 'cell-label';
    label.textContent = cell.label;
    div.appendChild(label);

    row.appendChild(div);
  });

  return row;
}

// ─── Render Column Headers ─────────────────────────
function renderHeaders() {
  const headers = ['Hero', t('attribute'), t('attack'), t('roles'), t('complexity'), t('legs'), t('gender')];
  const row = document.createElement('div');
  row.className = 'guess-row headers';
  headers.forEach(h => {
    const div = document.createElement('div');
    div.className = 'guess-cell header-cell';
    div.textContent = h;
    row.appendChild(div);
  });
  return row;
}

// ─── Submit Guess ──────────────────────────────────
function submitGuess(heroId) {
  const guess = HEROES_UNIQUE.find(h => h.id === heroId);
  if (!guess) return;
  if (state.guesses.find(g => g.id === heroId)) {
    showToast('Already guessed!');
    return;
  }
  if (state.solved || state.gaveUp) return;

  state.guesses.push(guess);
  const comparison = compareHeroes(guess, state.targetHero);
  const grid = document.getElementById('guess-grid');

  if (grid.children.length === 0) {
    grid.appendChild(renderHeaders());
  }
  grid.appendChild(renderGuessRow(guess, comparison));

  if (guess.id === state.targetHero.id) {
    state.solved = true;
    recordResult(true, state.guesses.length);
    setTimeout(() => showResult(true), 400);
  } else if (state.guesses.length >= state.maxGuesses) {
    state.gaveUp = true;
    recordResult(false, state.guesses.length);
    setTimeout(() => showResult(false), 400);
  }

  clearInput();
  updateProgress();
  renderModeClue();
}

// ─── Give Up ──────────────────────────────────────
function giveUp() {
  if (state.solved || state.gaveUp) return;
  state.gaveUp = true;
  recordResult(false, state.guesses.length);
  showResult(false);
}

// ─── Show Result (3D Hero Card) ───────────────────
function showResult(won) {
  const panel = document.getElementById('result-panel');
  panel.innerHTML = '';
  panel.classList.add('visible');

  const hero = state.targetHero;
  const legs = getHeroLegs(hero);
  const tries = state.guesses.length;

  const card = document.createElement('div');
  card.className = 'result-hero-card';

  card.innerHTML = `
    <div class="result-card-inner">
      <div class="result-badge-header">
        ${won ? `<span class="result-win">🎉 ${t('solved')} (${tries} ${tries === 1 ? t('try') : t('tries')})</span>` : `<span class="result-lose">😔 ${t('gaveup')}</span>`}
      </div>
      <div class="result-avatar-wrapper">
        <img src="${heroImg(hero.id)}" class="result-hero-img" onerror="this.style.display='none'">
        <span class="hero-attr-badge attr-${hero.attribute.toLowerCase()}">${hero.attribute}</span>
      </div>
      <h2 class="result-hero-title">${hero.name}</h2>
      <div class="result-tags">
        <span class="tag-pill">${hero.attack}</span>
        <span class="tag-pill">${hero.roles.join(', ')}</span>
        <span class="tag-pill">★ ${hero.complexity}</span>
        <span class="tag-pill">🦵 ${legs} ${t('legs')}</span>
      </div>
      <p class="result-lore">"${hero.lore}"</p>
    </div>
  `;

  panel.appendChild(card);

  const btns = document.createElement('div');
  btns.className = 'result-buttons';

  const shareBtn = document.createElement('button');
  shareBtn.className = 'btn btn-secondary';
  shareBtn.textContent = t('share');
  shareBtn.onclick = shareResult;
  btns.appendChild(shareBtn);

  const newBtn = document.createElement('button');
  newBtn.className = 'btn btn-primary';
  newBtn.textContent = t('newgame');
  newBtn.onclick = startNewGame;
  btns.appendChild(newBtn);

  panel.appendChild(btns);

  // 3D Tilt Effect
  panel.onmousemove = (e) => {
    const rect = panel.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    panel.style.transform = `perspective(1000px) rotateX(${-y / 15}deg) rotateY(${x / 15}deg) scale(1.02)`;
  };

  panel.onmouseleave = () => {
    panel.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
  };
}

// ─── Share Result ─────────────────────────────────
function shareResult() {
  const hero = state.targetHero;
  const won = state.solved;
  const tries = state.guesses.length;
  const maxG = state.maxGuesses;

  const emojis = state.guesses.map(g => {
    const cmp = compareHeroes(g, hero);
    const cells = [cmp.attribute, cmp.attack, cmp.roles, cmp.complexity, cmp.year, cmp.gender];
    return cells.map(c => c.result === 'exact' ? '🟩' : c.result === 'partial' ? '🟨' : '🟥').join('');
  }).join('\n');

  const text = `DOTADLE ${won ? tries : 'X'}/${maxG}\n${emojis}\nhttps://dotadle.com`;
  navigator.clipboard.writeText(text).then(() => showToast(t('copied')));
}

// ─── Challenge Mode ────────────────────────────────
function createChallenge() {
  const encoded = encodeHeroId(state.targetHero.id);
  const url = `${window.location.origin}${window.location.pathname}?c=${encoded}`;
  navigator.clipboard.writeText(url).then(() => {
    showToast(t('copied'));
    document.getElementById('challenge-banner').textContent = `🔗 Link copied! Share: ${url}`;
    document.getElementById('challenge-banner').classList.add('visible');
  });
}

function checkChallengeParam() {
  const params = new URLSearchParams(window.location.search);
  const c = params.get('c');
  if (c) {
    const id = decodeHeroId(c);
    const hero = id ? HEROES_UNIQUE.find(h => h.id === id) : null;
    if (hero) {
      state.targetHero = hero;
      state.challengeMode = true;
      document.getElementById('challenge-banner').textContent = t('challengeActive');
      document.getElementById('challenge-banner').classList.add('visible');
      return true;
    }
  }
  return false;
}

function getSplashCrop(heroId, guessCount) {
  let hash = 0;
  for (let i = 0; i < heroId.length; i++) {
    hash = heroId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const originX = 25 + (Math.abs(hash) % 50);       // 25% to 75%
  const originY = 25 + (Math.abs(hash >> 3) % 50);  // 25% to 75%

  const maxProgressGuesses = 7;
  const progress = Math.min(guessCount / maxProgressGuesses, 1);
  const scale = (4.5 - (progress * 3.5)).toFixed(2);  // 4.5x zoom down to 1.0x
  const blur = Math.max(0, 1.5 - (progress * 1.5)).toFixed(1); // Subtle 1.5px down to 0px

  return { originX, originY, scale, blur };
}

// ─── Canvas Anti-Cheat Splash Drawer (LoLdle Implementation) ───
function renderSplashCanvas(hero, guessCount) {
  const canvas = document.getElementById('splash-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  const width = 360;
  const height = 220;
  canvas.width = width;
  canvas.height = height;

  const crop = getSplashCrop(hero.id, guessCount);
  const img = new Image();
  img.src = heroImg(hero.id);
  
  img.onload = () => {
    ctx.clearRect(0, 0, width, height);
    
    const scale = parseFloat(crop.scale);
    const cropW = img.width / scale;
    const cropH = img.height / scale;
    const cropX = (img.width - cropW) * (crop.originX / 100);
    const cropY = (img.height - cropH) * (crop.originY / 100);

    ctx.save();
    if (parseFloat(crop.blur) > 0) {
      ctx.filter = `blur(${crop.blur}px) saturate(1.2)`;
    } else {
      ctx.filter = `saturate(1.2)`;
    }

    ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, width, height);
    ctx.restore();
  };
}

// ─── Mode Rendering ───────────────────────────────
function renderModeClue() {
  const clueBox = document.getElementById('mode-clue');
  clueBox.innerHTML = '';

  const hero = state.targetHero;
  const mode = state.mode;

  if (mode === 'classic') {
    clueBox.innerHTML = `<p class="clue-hint">${t('placeholder')}</p>`;
    return;
  }

  if (mode === 'splash') {
    const wrapper = document.createElement('div');
    wrapper.className = 'splash-wrapper';
    wrapper.innerHTML = `
      <div class="splash-reveal" oncontextmenu="return false;">
        <canvas id="splash-canvas" width="360" height="220" class="canvas-crop" oncontextmenu="return false;"></canvas>
      </div>
      <p class="clue-hint">${t('splash_hint')}</p>`;
    clueBox.appendChild(wrapper);
    setTimeout(() => renderSplashCanvas(hero, state.guesses.length), 20);
    return;
  }

  if (mode === 'ability') {
    const abilityId = hero.abilities[state.abilityIndex % hero.abilities.length];
    const wrongCount = state.guesses.length;
    // Reveal more abilities as guesses increase
    const shown = Math.min(wrongCount + 1, hero.abilities.length);
    const grid = document.createElement('div');
    grid.className = 'ability-grid';
    for (let i = 0; i < shown; i++) {
      const img = document.createElement('img');
      img.src = abilityImg(hero.abilities[i]);
      img.className = 'ability-icon';
      img.onerror = () => img.style.opacity = '0.2';
      grid.appendChild(img);
    }
    clueBox.appendChild(grid);
    const hint = document.createElement('p');
    hint.className = 'clue-hint';
    hint.textContent = t('ability_hint');
    clueBox.appendChild(hint);
    return;
  }

  if (mode === 'emoji') {
    const total = 3;
    const revealed = Math.min(state.guesses.length + 1, hero.emojis.length);
    const displayList = [];
    for (let i = 0; i < total; i++) {
      displayList.push(i < revealed && hero.emojis[i] ? hero.emojis[i] : '❓');
    }
    const emojiEl = document.createElement('div');
    emojiEl.className = 'emoji-display';
    emojiEl.textContent = displayList.join('  ');
    clueBox.appendChild(emojiEl);
    const hint = document.createElement('p');
    hint.className = 'clue-hint';
    hint.textContent = t('emoji_hint');
    clueBox.appendChild(hint);
    return;
  }

  if (mode === 'lore') {
    const sentences = hero.lore.split(/(?<=\.)\s+/);
    const revealed = Math.min(state.guesses.length + 1, sentences.length);
    const loreEl = document.createElement('div');
    loreEl.className = 'lore-display';
    for (let i = 0; i < revealed; i++) {
      const p = document.createElement('p');
      p.textContent = sentences[i];
      loreEl.appendChild(p);
    }
    clueBox.appendChild(loreEl);
    const hint = document.createElement('p');
    hint.className = 'clue-hint';
    hint.textContent = t('lore_hint');
    clueBox.appendChild(hint);
    return;
  }

  if (mode === 'quote') {
    const quoteEl = document.createElement('div');
    quoteEl.className = 'quote-display';
    quoteEl.innerHTML = `<span class="quote-mark">"</span>${hero.quote}<span class="quote-mark">"</span>`;
    clueBox.appendChild(quoteEl);
    const hint = document.createElement('p');
    hint.className = 'clue-hint';
    hint.textContent = t('quote_hint');
    clueBox.appendChild(hint);
    return;
  }
}

// ─── Autocomplete Search ──────────────────────────
let dropdownOpen = false;

function initSearch() {
  const input = document.getElementById('hero-input');
  const dropdown = document.getElementById('hero-dropdown');

  input.addEventListener('input', () => {
    const q = input.value.toLowerCase().trim();
    if (!q) { dropdown.innerHTML = ''; dropdown.classList.remove('open'); return; }

    const matches = HEROES_UNIQUE
      .filter(h => {
        const qL = q.toLowerCase();
        const nameMatch = h.name.toLowerCase().includes(qL);
        const aliasMatch = h.aliases && h.aliases.some(a => a.toLowerCase().includes(qL));
        return nameMatch || aliasMatch;
      })
      .slice(0, 8);

    dropdown.innerHTML = '';
    if (matches.length === 0) { dropdown.classList.remove('open'); return; }

    matches.forEach(h => {
      const item = document.createElement('div');
      item.className = 'dropdown-item';
      item.innerHTML = `
        <img src="${heroImg(h.id)}" class="dropdown-hero-img" onerror="this.style.display='none'">
        <span>${h.name}</span>`;
      item.addEventListener('mousedown', (e) => {
        e.preventDefault();
        selectHero(h.id, h.name);
      });
      dropdown.appendChild(item);
    });
    dropdown.classList.add('open');
  });

  input.addEventListener('keydown', (e) => {
    const items = dropdown.querySelectorAll('.dropdown-item');
    const active = dropdown.querySelector('.dropdown-item.active');
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = active ? active.nextElementSibling || items[0] : items[0];
      if (active) active.classList.remove('active');
      if (next) next.classList.add('active');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = active ? active.previousElementSibling || items[items.length - 1] : items[items.length - 1];
      if (active) active.classList.remove('active');
      if (prev) prev.classList.add('active');
    } else if (e.key === 'Enter') {
      const activeItem = dropdown.querySelector('.dropdown-item.active');
      if (activeItem) {
        activeItem.dispatchEvent(new Event('mousedown'));
      } else {
        const q = input.value.toLowerCase().trim();
        if (!q) return;
        const matches = HEROES_UNIQUE.filter(h => h.name.toLowerCase().includes(q));
        if (matches.length > 0) {
          selectHero(matches[0].id, matches[0].name);
        }
      }
    } else if (e.key === 'Escape') {
      dropdown.classList.remove('open');
    }
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('#search-wrapper')) {
      dropdown.classList.remove('open');
    }
  });
}

function selectHero(id, name) {
  const input = document.getElementById('hero-input');
  const dropdown = document.getElementById('hero-dropdown');
  input.value = name;
  dropdown.classList.remove('open');
  dropdown.innerHTML = '';
  submitGuess(id);
}

function clearInput() {
  const input = document.getElementById('hero-input');
  if (input) input.value = '';
}

// ─── Progress Bar ─────────────────────────────────
function updateProgress() {
  const bar = document.getElementById('progress-bar');
  const label = document.getElementById('progress-label');
  if (!bar) return;
  const current = state.guesses.length;
  const max = state.maxGuesses;
  const pct = (current / max) * 100;
  bar.style.width = pct + '%';
  if (label) {
    const isTr = LANG.current === 'tr';
    label.textContent = current === 0
      ? (isTr ? '🎯 8 Hak' : '🎯 8 Tries Left')
      : `🎯 ${isTr ? 'Tahmin' : 'Guess'} ${current} / ${max}`;
  }
}

// ─── Toast ─────────────────────────────────────────
function showToast(msg) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

// ─── New Game / Reset ─────────────────────────────
function startNewGame(keepMode = false) {
  const prevId = state.targetHero?.id;
  state.targetHero = pickRandomHero(prevId);
  state.guesses = [];
  state.solved = false;
  state.gaveUp = false;
  state.abilityIndex = Math.floor(Math.random() * 4);
  state.revealedLoreLines = 1;
  state.challengeMode = false;

  // Clear URL param
  if (window.location.search) {
    window.history.replaceState({}, '', window.location.pathname);
  }

  document.getElementById('guess-grid').innerHTML = '';
  document.getElementById('result-panel').innerHTML = '';
  document.getElementById('result-panel').classList.remove('visible');
  document.getElementById('challenge-banner').classList.remove('visible');

  renderModeClue();
  updateProgress();
  clearInput();
  document.getElementById('hero-input')?.focus();
}

// ─── Switch Mode ──────────────────────────────────
function switchMode(newMode) {
  state.mode = newMode;
  state.guesses = [];
  state.solved = false;
  state.gaveUp = false;
  if (!state.challengeMode) {
    state.targetHero = pickRandomHero();
    recordPlayedHero(state.targetHero.id);
  }

  document.getElementById('guess-grid').innerHTML = '';
  document.getElementById('result-panel').innerHTML = '';
  document.getElementById('result-panel').classList.remove('visible');

  document.querySelectorAll('.mode-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.mode === newMode);
  });

  renderModeClue();
  updateProgress();
  clearInput();
}

// ─── Voice Audio Playback ──────────────────────────
function playHeroQuote(quoteText, btnEl) {
  if (!('speechSynthesis' in window)) {
    showToast('Speech synthesis not supported');
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(quoteText);
  utterance.rate = 0.9;
  utterance.pitch = 0.95;
  utterance.lang = 'en-US';

  if (btnEl) {
    btnEl.classList.add('playing');
    btnEl.textContent = t('playing_voice');
  }

  utterance.onend = () => {
    if (btnEl) {
      btnEl.classList.remove('playing');
      btnEl.textContent = t('play_voice');
    }
  };

  utterance.onerror = () => {
    if (btnEl) {
      btnEl.classList.remove('playing');
      btnEl.textContent = t('play_voice');
    }
  };

  window.speechSynthesis.speak(utterance);
}

// ─── Stats Management ──────────────────────────────
function getStats() {
  const defaultStats = { played: 0, wins: 0, currentStreak: 0, maxStreak: 0, dist: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, fail: 0 } };
  try {
    const data = localStorage.getItem('dotadle_stats');
    return data ? JSON.parse(data) : defaultStats;
  } catch { return defaultStats; }
}

function saveStats(stats) {
  try { localStorage.setItem('dotadle_stats', JSON.stringify(stats)); } catch {}
}

function recordResult(won, numGuesses) {
  const stats = getStats();
  stats.played += 1;
  if (won) {
    stats.wins += 1;
    stats.currentStreak += 1;
    if (stats.currentStreak > stats.maxStreak) stats.maxStreak = stats.currentStreak;
    if (numGuesses >= 1 && numGuesses <= 8) {
      stats.dist[numGuesses] = (stats.dist[numGuesses] || 0) + 1;
    }
  } else {
    stats.currentStreak = 0;
    stats.dist.fail = (stats.dist.fail || 0) + 1;
  }
  saveStats(stats);
}

function renderStatsModal() {
  const stats = getStats();
  document.getElementById('stat-played').textContent = stats.played;
  const winPct = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;
  document.getElementById('stat-winpct').textContent = winPct + '%';
  document.getElementById('stat-streak').textContent = stats.currentStreak;
  document.getElementById('stat-maxstreak').textContent = stats.maxStreak;

  const container = document.getElementById('guess-dist-container');
  container.innerHTML = '';

  const maxVal = Math.max(...Object.values(stats.dist || {}), 1);
  for (let i = 1; i <= 8; i++) {
    const count = (stats.dist && stats.dist[i]) || 0;
    const pct = Math.max((count / maxVal) * 100, 8);
    const row = document.createElement('div');
    row.className = 'dist-bar-row';
    row.innerHTML = `
      <span class="dist-bar-label">${i}</span>
      <div class="dist-bar-track">
        <div class="dist-bar-fill ${count > 0 ? 'highlight' : ''}" style="width:${pct}%">${count}</div>
      </div>`;
    container.appendChild(row);
  }

  const failCount = (stats.dist && stats.dist.fail) || 0;
  const failPct = Math.max((failCount / maxVal) * 100, 8);
  const failRow = document.createElement('div');
  failRow.className = 'dist-bar-row';
  failRow.innerHTML = `
    <span class="dist-bar-label">X</span>
    <div class="dist-bar-track">
      <div class="dist-bar-fill" style="width:${failPct}%; background:#ef4444; color:#fff;">${failCount}</div>
    </div>`;
  container.appendChild(failRow);

  document.getElementById('stats-modal').classList.add('open');
}

function closeStatsModal() {
  document.getElementById('stats-modal').classList.remove('open');
}

function resetStats() {
  if (confirm('Reset all statistics? / Tüm istatistikler sıfırlansın mı?')) {
    localStorage.removeItem('dotadle_stats');
    renderStatsModal();
    showToast('Stats reset!');
  }
}

function startDailyGame() {
  state.targetHero = getDailyHero();
  state.guesses = [];
  state.solved = false;
  state.gaveUp = false;
  state.challengeMode = false;
  state.isDaily = true;

  document.getElementById('guess-grid').innerHTML = '';
  document.getElementById('result-panel').innerHTML = '';
  document.getElementById('result-panel').classList.remove('visible');

  const banner = document.getElementById('challenge-banner');
  banner.textContent = t('dailyActive');
  banner.classList.add('visible');

  renderModeClue();
  updateProgress();
  clearInput();
  showToast('📅 Today\'s Hero Loaded!');
}

// ─── Language Toggle ─────────────────────────────
function toggleLang() {
  LANG.current = LANG.current === 'en' ? 'tr' : 'en';
  document.getElementById('lang-btn').textContent = LANG.current === 'en' ? '🌐 TR' : '🌐 EN';
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  renderModeClue();
}

// ─── Init ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const hasChallenge = checkChallengeParam();
  if (!hasChallenge) {
    state.targetHero = pickRandomHero();
  }

  document.querySelectorAll('.mode-tab').forEach(tab => {
    tab.addEventListener('click', () => switchMode(tab.dataset.mode));
  });

  document.getElementById('giveup-btn')?.addEventListener('click', giveUp);
  document.getElementById('daily-btn')?.addEventListener('click', startDailyGame);
  document.getElementById('newgame-btn')?.addEventListener('click', startNewGame);
  document.getElementById('challenge-btn')?.addEventListener('click', createChallenge);
  document.getElementById('lang-btn')?.addEventListener('click', toggleLang);

  // Stats Modal listeners
  document.getElementById('stats-btn')?.addEventListener('click', renderStatsModal);
  document.getElementById('open-stats-btn')?.addEventListener('click', renderStatsModal);
  document.getElementById('close-stats-btn')?.addEventListener('click', closeStatsModal);
  document.getElementById('reset-stats-btn')?.addEventListener('click', resetStats);

  document.getElementById('stats-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'stats-modal') closeStatsModal();
  });

  initSearch();
  renderModeClue();
  updateProgress();

  document.getElementById('hero-input')?.focus();
});

})();
