let lastCandleSlot = 0;

// --- PERMANENT 25-MIN DEMO TRACKER ---
const DEMO_DURATION_MS = 25 * 60 * 1000;

function checkDemoExpiryStatus() {
    if (localStorage.getItem('zerox_is_vip') === 'true') {
        const activeStatus = document.getElementById('activeKeyStatus');
        const timerElem = document.getElementById('timerDisplay');
        if (activeStatus) {
            activeStatus.textContent = 'STATUS: VIP LIFETIME';
            activeStatus.style.color = '#00ff88';
        }
        if (timerElem) {
            timerElem.textContent = 'UNLIMITED';
            timerElem.style.color = '#00ff88';
        }
        return false;
    }

    let firstVisitTime = localStorage.getItem('zerox_first_visit_timestamp');
    const now = Date.now();

    if (!firstVisitTime) {
        localStorage.setItem('zerox_first_visit_timestamp', now.toString());
        firstVisitTime = now;
    } else {
        firstVisitTime = parseInt(firstVisitTime, 10);
    }

    const elapsedMs = now - firstVisitTime;
    const remainingMs = DEMO_DURATION_MS - elapsedMs;

    if (remainingMs <= 0) {
        const lockOverlay = document.getElementById('vipLockOverlay');
        const timerElem = document.getElementById('timerDisplay');
        const welcomeScreen = document.getElementById('welcomeScreen');

        if (timerElem) timerElem.textContent = '00:00';
        if (welcomeScreen) welcomeScreen.style.display = 'none';
        if (lockOverlay) lockOverlay.style.display = 'flex';
        return true;
    }

    const totalSecsLeft = Math.floor(remainingMs / 1000);
    const m = Math.floor(totalSecsLeft / 60);
    const s = totalSecsLeft % 60;
    const timerElem = document.getElementById('timerDisplay');
    if (timerElem) {
        timerElem.textContent = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
    }
    return false;
}

setInterval(checkDemoExpiryStatus, 1000);

// --- CANDLE SYNC ENGINE (1M, 5M, 15M) ---
function runCandleEngine() {
    const now = Date.now();
    const intervalMs = currentInterval * 60 * 1000;
    
    // Remaining time in current selected candle (1M, 5M, or 15M)
    const msRemaining = intervalMs - (now % intervalMs);
    const totalSecsLeft = Math.ceil(msRemaining / 1000);

    const mins = Math.floor(totalSecsLeft / 60);
    const secs = totalSecsLeft % 60;

    const candleDisplay = document.getElementById('candleTimerDisplay');
    const progressBar = document.getElementById('candleProgressBar');

    if (candleDisplay && progressBar) {
        candleDisplay.textContent = (mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs;
        progressBar.style.width = ((msRemaining / intervalMs) * 100) + '%';

        if (totalSecsLeft <= 5) {
            candleDisplay.classList.add('closing');
        } else {
            candleDisplay.classList.remove('closing');
        }
    }

    // Exact Candle Expiry Trigger (Only triggers when the current candle period finishes)
    const currentSlot = Math.floor(now / intervalMs);
    if (lastCandleSlot !== 0 && lastCandleSlot !== currentSlot) {
        if (typeof generateQuantSignal === 'function') {
            generateQuantSignal();
        }
    }
    lastCandleSlot = currentSlot;

    requestAnimationFrame(runCandleEngine);
}

// --- WELCOME BOOT ANIMATION ---
(function runWelcomeSequence() {
    const isExpired = checkDemoExpiryStatus();
    const welcomeScreen = document.getElementById('welcomeScreen');
    
    if (isExpired) {
        if (welcomeScreen) welcomeScreen.style.display = 'none';
        return;
    }

    const progressBar = document.getElementById('welcomeProgress');
    const statusText = document.getElementById('welcomeStatusText');

    if (!welcomeScreen) return;

    let progress = 0;
    const stages = [
        { at: 20, text: 'DECRYPTING PROBABILITY MATRIX...' },
        { at: 50, text: 'CONNECTING WEBSOCKET TICK FEED...' },
        { at: 80, text: 'SYNCING ATOMIC CANDLE CLOCK...' },
        { at: 100, text: 'ACCESS GRANTED // TERMINAL READY' }
    ];

    const interval = setInterval(() => {
        progress += 2;
        if (progressBar) progressBar.style.width = progress + '%';

        const stage = stages.find(s => s.at === progress);
        if (stage && statusText) {
            statusText.textContent = stage.text;
        }

        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                welcomeScreen.style.opacity = '0';
                welcomeScreen.style.visibility = 'hidden';
            }, 400);
        }
    }, 30);
})();

requestAnimationFrame(runCandleEngine);