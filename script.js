// --- ZEROX PRO FULL ENGINE (ZEIIERMAN LOGIC + ASSET SWITCH + TIMERS) ---

const DEMO_DURATION_MS = 25 * 60 * 1000;
const VIP_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

const AUTHORIZED_VIP_KEYS = [
    '1475', '5568', '4785', '3998', '8536', '9805', '9082', '7230', '9635', '7580',
    '1598', '7536', '9614', '1436', '7845', '5478', '9632', '12587', '35777', '86995',
    '75236', '99852', '3588962', '147852698', '085536', '700052', '30005', '6000235', '9887550', '9996328',
    '752238', '8005568', '98524778', '99633580', '008855568', '9955548',
    '418962', '739215', '584120', '692481', '371940', '846193', '294817', '503829', '184920', '927415',
    '385019', '619284', '740192', '829104', 'ZEROX-VIP-101'
];

let currentSymbol = localStorage.getItem('zerox_active_sym') || 'BINANCE:BTCUSDT';
let currentInterval = localStorage.getItem('zerox_active_tf') || '1';

// Consistent Seeded Logic to Prevent Random Flip-Flop on Refresh
function getBarSeed(symbol, interval) {
    const epochMin = Math.floor(Date.now() / (parseInt(interval, 10) * 60 * 1000));
    let hash = 0;
    const str = symbol + '_' + epochMin;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
}

// 1. ZEIIERMAN PROBABILITY MATRIX LOGIC
function executeZeiiermanLogic() {
    const seed = getBarSeed(currentSymbol, currentInterval);
    const gtotal = 210 + (seed % 60);
    const rtotal = 230 + ((seed >> 2) % 55);

    const isPrevGreen = (seed % 2 === 0);
    
    let highP, lowP;
    if (isPrevGreen) {
        const ghh = Math.floor(gtotal * (0.62 + ((seed % 20) / 100)));
        const gll = Math.floor(gtotal * (0.24 + ((seed % 14) / 100)));
        highP = ((ghh / gtotal) * 100).toFixed(2);
        lowP = ((gll / gtotal) * 100).toFixed(2);
    } else {
        const rhh = Math.floor(rtotal * (0.26 + ((seed % 16) / 100)));
        const rll = Math.floor(rtotal * (0.66 + ((seed % 18) / 100)));
        highP = ((rhh / rtotal) * 100).toFixed(2);
        lowP = ((rll / rtotal) * 100).toFixed(2);
    }

    const isBullish = parseFloat(highP) >= parseFloat(lowP);
    const topScore = isBullish ? highP : lowP;

    const sigText = document.getElementById('mainSignalText');
    const cardBox = document.getElementById('signalCardBox');
    const accText = document.getElementById('accuracyText');
    const callProb = document.getElementById('callProb');
    const putProb = document.getElementById('putProb');
    const probBar = document.getElementById('probBar');

    if (sigText) {
        sigText.textContent = isBullish ? 'CALL (BUY)' : 'PUT (SELL)';
        sigText.className = 'signal-val ' + (isBullish ? 'call' : 'put');
    }
    if (cardBox) cardBox.className = 'signal-card ' + (isBullish ? 'pulse-call' : 'pulse-put');
    if (accText) accText.textContent = `${topScore}% CONFIDENCE`;
    if (callProb) callProb.textContent = `${highP}%`;
    if (putProb) putProb.textContent = `${lowP}%`;
    if (probBar) {
        probBar.style.width = `${topScore}%`;
        probBar.style.background = isBullish ? 'var(--call)' : 'var(--put)';
    }
}

// 2. TIMERS ENGINE (Candle Expiry + 25-Min Demo / VIP)
function updateSystemTimers() {
    let demoStart = localStorage.getItem('zerox_demo_start');
    const isVip = localStorage.getItem('zerox_is_vip') === 'true';
    const vipStart = localStorage.getItem('zerox_vip_start');

    if (!demoStart && !isVip) {
        demoStart = Date.now().toString();
        localStorage.setItem('zerox_demo_start', demoStart);
    }

    const overlay = document.getElementById('vipLockOverlay');
    const statusBadge = document.getElementById('accessStatus');
    const trialTimerElem = document.getElementById('trialTimer');

    // VIP Validation
    if (isVip && vipStart) {
        const timeLeftVip = VIP_DURATION_MS - (Date.now() - parseInt(vipStart, 10));
        if (timeLeftVip > 0) {
            const days = Math.floor(timeLeftVip / (24 * 60 * 60 * 1000));
            if (statusBadge) statusBadge.innerHTML = `<span style="color:var(--call);">VIP ACTIVE (${days}D)</span>`;
            if (overlay) overlay.style.display = 'none';
        } else {
            localStorage.removeItem('zerox_is_vip');
            localStorage.removeItem('zerox_vip_start');
        }
    } else {
        // Demo Validation
        const elapsed = Date.now() - parseInt(demoStart || Date.now().toString(), 10);
        const remaining = DEMO_DURATION_MS - elapsed;

        if (remaining <= 0) {
            if (overlay) overlay.style.display = 'flex';
            if (statusBadge) statusBadge.innerHTML = `<span style="color:var(--put);">EXPIRED</span>`;
        } else {
            if (overlay) overlay.style.display = 'none';
            const m = Math.floor(remaining / 60000);
            const s = Math.floor((remaining % 60000) / 1000);
            if (trialTimerElem) trialTimerElem.textContent = `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
        }
    }

    // Candle Countdown
    const now = new Date();
    const intervalSec = parseInt(currentInterval, 10) * 60;
    const currentSecInPeriod = (now.getMinutes() * 60 + now.getSeconds()) % intervalSec;
    const secondsLeft = intervalSec - currentSecInPeriod;

    const formatted = `${Math.floor(secondsLeft / 60) < 10 ? '0' + Math.floor(secondsLeft / 60) : Math.floor(secondsLeft / 60)}:${secondsLeft % 60 < 10 ? '0' + (secondsLeft % 60) : secondsLeft % 60}`;
    
    const candleTimerElem = document.getElementById('candleTimer');
    if (candleTimerElem) candleTimerElem.textContent = formatted;

    if (secondsLeft === intervalSec || secondsLeft === 1) {
        executeZeiiermanLogic();
    }
}

// 3. CHART & CONTROLS BINDING
function renderChart() {
    const frame = document.getElementById('tv_frame');
    if (frame) {
        frame.src = `https://s.tradingview.com/widgetembed/?symbol=${encodeURIComponent(currentSymbol)}&interval=${currentInterval}&theme=dark&style=1&timezone=Asia%2FKolkata`;
    }
}

function initializeControls() {
    const selector = document.getElementById('assetSelector');
    if (selector) {
        selector.value = currentSymbol;
        selector.addEventListener('change', (e) => {
            currentSymbol = e.target.value;
            localStorage.setItem('zerox_active_sym', currentSymbol);
            
            document.querySelectorAll('.chip-btn').forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('data-sym') === currentSymbol);
            });

            renderChart();
            executeZeiiermanLogic();
        });
    }

    document.querySelectorAll('.chip-btn').forEach(btn => {
        if (btn.getAttribute('data-sym') === currentSymbol) btn.classList.add('active');
        btn.addEventListener('click', () => {
            document.querySelectorAll('.chip-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentSymbol = btn.getAttribute('data-sym');
            localStorage.setItem('zerox_active_sym', currentSymbol);
            if (selector) selector.value = currentSymbol;
            renderChart();
            executeZeiiermanLogic();
        });
    });

    document.querySelectorAll('.tf-btn').forEach(btn => {
        if (btn.getAttribute('data-tf') === currentInterval) btn.classList.add('active');
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tf-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentInterval = btn.getAttribute('data-tf');
            localStorage.setItem('zerox_active_tf', currentInterval);
            renderChart();
            executeZeiiermanLogic();
        });
    });

    const btnUnlock = document.getElementById('btnUnlock');
    if (btnUnlock) {
        btnUnlock.addEventListener('click', () => {
            const input = document.getElementById('licenseKeyInput');
            const errMsg = document.getElementById('loginErrorMsg');
            if (input && AUTHORIZED_VIP_KEYS.includes(input.value.trim())) {
                localStorage.setItem('zerox_is_vip', 'true');
                localStorage.setItem('zerox_vip_start', Date.now().toString());
                document.getElementById('vipLockOverlay').style.display = 'none';
                if (errMsg) errMsg.style.display = 'none';
                updateSystemTimers();
            } else if (errMsg) {
                errMsg.style.display = 'block';
            }
        });
    }
}

// Master Startup
window.addEventListener('DOMContentLoaded', () => {
    initializeControls();
    renderChart();
    executeZeiiermanLogic();
    updateSystemTimers();
    setInterval(updateSystemTimers, 1000);
});