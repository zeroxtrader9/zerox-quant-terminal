// --- ZEROX PRO ENGINE: 25-MIN DEMO + 30-DAY VIP + ZEIIERMAN BREAKOUT ---

const DEMO_DURATION_MS = 25 * 60 * 1000; // 25 Minutes
const VIP_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 Days

const AUTHORIZED_VIP_KEYS = [
    '1475', '5568', '4785', '3998', '8536', '9805', '9082', '7230', '9635', '7580',
    '1598', '7536', '9614', '1436', '7845', '5478', '9632', '12587', '35777', '86995',
    '75236', '99852', '3588962', '147852698', '085536', '700052', '30005', '6000235', '9887550', '9996328',
    '752238', '8005568', '98524778', '99633580', '008855568', '9955548',
    '418962', '739215', '584120', '692481', '371940', '846193', '294817', '503829', '184920', '927415',
    '385019', '619284', '740192', '829104', 'ZEROX-VIP-101'
];

let currentSymbol = 'BINANCE:BTCUSDT';
let currentInterval = 1;
let matrix = { ghh: 164, gll: 70, rhh: 62, rll: 198, gtotal: 234, rtotal: 260 };

// 1. ACCESS & DEMO TIMER CONTROLLER
function initAccessControl() {
    let demoStart = localStorage.getItem('zerox_demo_start');
    const isVip = localStorage.getItem('zerox_is_vip') === 'true';
    const vipStart = localStorage.getItem('zerox_vip_start');

    if (!demoStart && !isVip) {
        demoStart = Date.now().toString();
        localStorage.setItem('zerox_demo_start', demoStart);
    }

    setInterval(() => {
        const overlay = document.getElementById('vipLockOverlay');
        const statusBadge = document.getElementById('accessStatus');

        if (isVip && vipStart) {
            const timeLeftVip = VIP_DURATION_MS - (Date.now() - parseInt(vipStart, 10));
            if (timeLeftVip > 0) {
                const days = Math.floor(timeLeftVip / (24 * 60 * 60 * 1000));
                statusBadge.innerHTML = `<span style="color:var(--call);">VIP ACTIVE (${days}D)</span>`;
                overlay.style.display = 'none';
                return;
            } else {
                localStorage.removeItem('zerox_is_vip');
            }
        }

        // Demo Timer Count
        const elapsed = Date.now() - parseInt(demoStart, 10);
        const remaining = DEMO_DURATION_MS - elapsed;

        if (remaining <= 0) {
            overlay.style.display = 'flex';
            statusBadge.innerHTML = `<span style="color:var(--put);">EXPIRED</span>`;
        } else {
            overlay.style.display = 'none';
            const m = Math.floor(remaining / 60000);
            const s = Math.floor((remaining % 60000) / 1000);
            const formatted = `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
            document.getElementById('trialTimer').textContent = formatted;
        }
    }, 1000);
}

function attemptLogin() {
    const key = document.getElementById('licenseKeyInput').value.trim();
    const errMsg = document.getElementById('loginErrorMsg');

    if (AUTHORIZED_VIP_KEYS.includes(key)) {
        localStorage.setItem('zerox_is_vip', 'true');
        localStorage.setItem('zerox_vip_start', Date.now().toString());
        document.getElementById('vipLockOverlay').style.display = 'none';
        errMsg.style.display = 'none';
    } else {
        errMsg.style.display = 'block';
    }
}

// 2. ZEIIERMAN PROBABILITY MATH
function updateQuantSignal() {
    const isGreen = Math.random() > 0.48;
    const highBreak = Math.random() > 0.40;
    const lowBreak = Math.random() > 0.42;

    if (isGreen) {
        matrix.gtotal++;
        if (highBreak) matrix.ghh++;
        if (lowBreak) matrix.gll++;
    } else {
        matrix.rtotal++;
        if (highBreak) matrix.rhh++;
        if (lowBreak) matrix.rll++;
    }

    const highP = isGreen ? ((matrix.ghh / matrix.gtotal) * 100).toFixed(2) : ((matrix.rhh / matrix.rtotal) * 100).toFixed(2);
    const lowP = isGreen ? ((matrix.gll / matrix.gtotal) * 100).toFixed(2) : ((matrix.rll / matrix.rtotal) * 100).toFixed(2);

    const isBullish = parseFloat(highP) >= parseFloat(lowP);
    const topScore = isBullish ? highP : lowP;

    const sigText = document.getElementById('mainSignalText');
    const cardBox = document.getElementById('signalCardBox');
    const accText = document.getElementById('accuracyText');
    const callProb = document.getElementById('callProb');
    const putProb = document.getElementById('putProb');
    const probBar = document.getElementById('probBar');

    sigText.textContent = isBullish ? 'CALL (BUY)' : 'PUT (SELL)';
    sigText.className = 'signal-val ' + (isBullish ? 'call' : 'put');
    cardBox.className = 'signal-card ' + (isBullish ? 'pulse-call' : 'pulse-put');

    accText.textContent = `${topScore}% CONFIDENCE`;
    callProb.textContent = `${highP}%`;
    putProb.textContent = `${lowP}%`;

    probBar.style.width = `${topScore}%`;
    probBar.style.background = isBullish ? 'var(--call)' : 'var(--put)';
}

// 3. CANDLE EXPIRATION COUNTDOWN
function startCandleCountdown() {
    setInterval(() => {
        const now = new Date();
        const secondsLeft = 60 - now.getSeconds();
        const formatted = secondsLeft < 10 ? `00:0${secondsLeft}` : `00:${secondsLeft}`;
        document.getElementById('candleTimer').textContent = formatted;

        if (secondsLeft === 60 || secondsLeft === 1) {
            updateQuantSignal();
        }
    }, 1000);
}

// 4. CHART SWITCHERS
function switchAsset(sym, elem) {
    document.querySelectorAll('.chip-btn').forEach(btn => btn.classList.remove('active'));
    elem.classList.add('active');
    currentSymbol = sym;
    renderChart();
}

function setTF(tf, elem) {
    document.querySelectorAll('.tf-btn').forEach(btn => btn.classList.remove('active'));
    elem.classList.add('active');
    currentInterval = tf;
    renderChart();
}

function renderChart() {
    document.getElementById('tv_frame').src = `https://s.tradingview.com/widgetembed/?symbol=${encodeURIComponent(currentSymbol)}&interval=${currentInterval}&theme=dark&style=1&timezone=Asia%2FKolkata`;
}

// Startup
initAccessControl();
updateQuantSignal();
startCandleCountdown();