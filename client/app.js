// Инициализация Telegram Mini App
let tg = window.Telegram.WebApp;
tg.expand();

// Проверка подписки на канал через ваш сервер
(async function checkSub() {
  try {
    const userId = tg.initDataUnsafe.user.id;
    const resp = await fetch('https://YOUR_SERVER_DOMAIN/check-subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    const { subscribed } = await resp.json();
    if (!subscribed) {
      showSubscribeOverlay();
    }
  } catch (e) {
    console.error('Ошибка проверки подписки:', e);
  }
})();

function showSubscribeOverlay() {
  const overlay = document.createElement('div');
  overlay.id = 'subscribe-overlay';
  overlay.innerHTML = `
    <div class="overlay-content">
      <img src="error.png" alt="Ошибка подписки">
      <p>Для того чтобы пользоваться потом, подпишитесь на канал <b>@GammaDLC</b></p>
    </div>`;
  document.body.appendChild(overlay);
}

// Инициализация игровых переменных
let gameState = {
    score: 0,
    clickValue: 1,
    passiveIncome: 0,
    multiplier: 1,
    upgradesPrices: { click: 50, passive: 100, multiplier: 500 },
    upgradesLevels: { click: 0, passive: 0, multiplier: 0 }
};
loadGameState();

// DOM элементы
const scoreElement = document.getElementById('score');
const perClickElement = document.getElementById('per-click');
const passiveElement = document.getElementById('passive');
const clickValueElement = document.getElementById('click-value');
const clickUpgradePriceElement = document.getElementById('click-upgrade-price');
const passiveUpgradePriceElement = document.getElementById('passive-upgrade-price');
const multiplierUpgradePriceElement = document.getElementById('multiplier-upgrade-price');
const gButton = document.getElementById('g-button');
const clickEffect = document.getElementById('click-effect');

updateUI();

// Слушатели
gButton.addEventListener('click', handleClick);
document.getElementById('buy-click-upgrade').addEventListener('click', buyClickUpgrade);
document.getElementById('buy-passive-upgrade').addEventListener('click', buyPassiveUpgrade);
document.getElementById('buy-multiplier-upgrade').addEventListener('click', buyMultiplierUpgrade);

setInterval(passiveIncome, 1000);
setInterval(saveGameState, 10000);

function handleClick() {
    addScore(gameState.clickValue * gameState.multiplier);
    gButton.classList.add('bounce');
    setTimeout(() => gButton.classList.remove('bounce'), 300);
    showClickEffect();
    updateUI();
}

function addScore(value) {
    gameState.score += value;
    updateUI();
}

function passiveIncome() {
    if (gameState.passiveIncome > 0)
        addScore(gameState.passiveIncome * gameState.multiplier);
}

function buyClickUpgrade() {
    const price = gameState.upgradesPrices.click;
    if (gameState.score >= price) {
        gameState.score -= price;
        gameState.clickValue += 1;
        gameState.upgradesLevels.click += 1;
        gameState.upgradesPrices.click = Math.floor(price * 1.5);
        updateUI(); saveGameState();
    }
}

function buyPassiveUpgrade() {
    const price = gameState.upgradesPrices.passive;
    if (gameState.score >= price) {
        gameState.score -= price;
        gameState.passiveIncome += 1;
        gameState.upgradesLevels.passive += 1;
        gameState.upgradesPrices.passive = Math.floor(price * 1.5);
        updateUI(); saveGameState();
    }
}

function buyMultiplierUpgrade() {
    const price = gameState.upgradesPrices.multiplier;
    if (gameState.score >= price) {
        gameState.score -= price;
        gameState.multiplier *= 2;
        gameState.upgradesLevels.multiplier += 1;
        gameState.upgradesPrices.multiplier = Math.floor(price * 2.5);
        updateUI(); saveGameState();
    }
}

function updateUI() {
    scoreElement.textContent = formatNumber(Math.floor(gameState.score));
    perClickElement.textContent = formatNumber(gameState.clickValue * gameState.multiplier);
    passiveElement.textContent = formatNumber(gameState.passiveIncome * gameState.multiplier);
    clickValueElement.textContent = formatNumber(gameState.clickValue * gameState.multiplier);
    clickUpgradePriceElement.textContent = formatNumber(gameState.upgradesPrices.click);
    passiveUpgradePriceElement.textContent = formatNumber(gameState.upgradesPrices.passive);
    multiplierUpgradePriceElement.textContent = formatNumber(gameState.upgradesPrices.multiplier);
    document.getElementById('buy-click-upgrade').disabled = gameState.score < gameState.upgradesPrices.click;
    document.getElementById('buy-passive-upgrade').disabled = gameState.score < gameState.upgradesPrices.passive;
    document.getElementById('buy-multiplier-upgrade').disabled = gameState.score < gameState.upgradesPrices.multiplier;
}

function showClickEffect() {
    const xOffset = Math.random() * 60 - 30;
    const yOffset = Math.random() * 20 - 40;
    clickEffect.style.left = `calc(50% + ${xOffset}px)`;
    clickEffect.style.top = `calc(50% + ${yOffset}px)`;
    clickEffect.querySelector('#click-value').textContent = formatNumber(gameState.clickValue * gameState.multiplier);
    clickEffect.classList.add('show');
    setTimeout(() => clickEffect.classList.remove('show'), 800);
}

function formatNumber(num) {
    if (num < 1000) return num;
    if (num < 1e6) return (num/1e3).toFixed(1)+'K';
    if (num < 1e9) return (num/1e6).toFixed(1)+'M';
    return (num/1e9).toFixed(1)+'B';
}

function saveGameState() {
    try {
        const data = JSON.stringify(gameState);
        localStorage.setItem('gClickerGameState', data);
        if (tg.initDataUnsafe.user) {
            tg.CloudStorage.setItem(`user_${tg.initDataUnsafe.user.id}_gameState`, data);
        }
    } catch(e) { console.error(e); }
}

function loadGameState() {
    try {
        const saved = localStorage.getItem('gClickerGameState');
        if (saved) gameState = {...gameState, ...JSON.parse(saved)};
        if (tg.initDataUnsafe.user) {
            tg.CloudStorage.getItem(`user_${tg.initDataUnsafe.user.id}_gameState`, (err,val) => {
                if (!err && val) {
                    gameState = {...gameState, ...JSON.parse(val)};
                    updateUI();
                }
            });
        }
    } catch(e){ console.error(e); }
}
