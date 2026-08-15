let lastCandleSlot = 0;

const DEMO_DURATION_MS = 25 * 60 * 1000;
const VIP_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

function checkTerminalAccessStatus() {
    const now = Date.now();
    const isVip = localStorage.getItem('zerox_is_vip') === 'true';
    const vipActivationTime = localStorage.getItem('zerox_vip_start_time');
    const lockOverlay = document.getElementById('vipLockOverlay');
    const timerElem = document.getElementById('timerDisplay');
    const activeStatus = document.getElementById('activeKeyStatus');

    if (isVip && vipActivationTime) {
        const vipElapsed = now - parseInt(vipActivationTime, 10);
        const vipRemaining = VIP_DURATION_MS - vipElapsed;

        if (vipRemaining <= 0) {
            localStorage.removeItem('zerox_is_vip');
            localStorage.removeItem('zerox_vip_start_time');
            if (lockOverlay) lockOverlay.style.display = 'flex';
            if (activeStatus) {
                activeStatus.textContent = 'VIP EXPIRED';
                activeStatus.style.color = '#ff3366';
            }
            if (timerElem) timerElem.textContent = 'EXPIRED';
            return true;
        } else {
            const daysLeft = Math.floor(vipRemaining / (24 * 60 * 60 * 1000));
            const hoursLeft = Math.floor((vipRemaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
            if (activeStatus) {
                activeStatus.textContent = 'VIP ACTIVE (' + daysLeft + 'D ' + hoursLeft + 'H)';
                activeStatus.style.color = '#00ff88';
            }
            if (timerElem) {
                timerElem.textContent = daysLeft + 'D ' + hoursLeft + 'H LEFT';
                timerElem.style.color = '#00ff88';
            }
            if (lockOverlay) lockOverlay.style.display = 'none';
            return false;
        }
    }

    let firstVisitTime = localStorage.getItem('zerox_first_visit_timestamp');
    if (!firstVisitTime) {
        localStorage.setItem('zerox_first_visit_timestamp', now.toString());
        firstVisitTime = now;
    } else {
        firstVisitTime = parseInt(firstVisitTime, 10);
    }

    const elapsedMs = now - firstVisitTime;
    const remainingMs = DEMO_DURATION_MS - elapsedMs;

    if (remainingMs <= 0) {
        if (timerElem) timerElem.textContent = '00:00';
        if (lockOverlay) lockOverlay.style.display = 'flex';
        return true;
    }

    const totalSecsLeft = Math.floor(remainingMs / 1000);
    const m = Math.floor(totalSecsLeft / 60);
    const s = totalSecsLeft % 60;
    if (timerElem) {
        timerElem.textContent = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
    }
    return false;
}

setInterval(checkTerminalAccessStatus, 1000);

function runCandleEngine() {
    const now = Date.now();
    const intervalMs = currentInterval * 60 * 1000;
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

    const currentSlot = Math.floor(now / intervalMs);
    if (lastCandleSlot !== 0 && lastCandleSlot !== currentSlot) {
        if (typeof generateQuantSignal === 'function') generateQuantSignal();
    }
    lastCandleSlot = currentSlot;

    requestAnimationFrame(runCandleEngine);
}

(function runWelcomeSequence() {
    const isExpired = checkTerminalAccessStatus();
    const welcomeScreen = document.getElementById('welcomeScreen');
    if (isExpired && welcomeScreen) {
        welcomeScreen.style.display = 'none';
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
        if (stage && statusText) statusText.textContent = stage.text;

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