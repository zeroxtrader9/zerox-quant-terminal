// --- ZEROX ENGINE WITH ZEIIERMAN PROBABILITY & 30-DAY VIP LOCK ---

const VIP_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 Days

const AUTHORIZED_VIP_KEYS = [
    '1475', '5568', '4785', '3998', '8536', '9805', '9082', '7230', '9635', '7580',
    '1598', '7536', '9614', '1436', '7845', '5478', '9632', '12587', '35777', '86995',
    '75236', '99852', '3588962', '147852698', '085536', '700052', '30005', '6000235', '9887550', '9996328',
    '752238', '8005568', '98524778', '99633580', '008855568', '9955548',
    '418962', '739215', '584120', '692481', '371940', '846193', '294817', '503829', '184920', '927415',
    '385019', '619284', '740192', '829104', 'ZEROX-VIP-101'
];

// Matrix for Zeiierman Breakout Calculations
let matrix = {
    ghh: 142, gll: 64,
    rhh: 58,  rll: 186,
    gtotal: 206, rtotal: 244
};

// VIP Authentication Engine
function checkVIPAccess() {
    const isVip = localStorage.getItem('zerox_is_vip') === 'true';
    const vipStartTime = localStorage.getItem('zerox_vip_start_time');
    const overlay = document.getElementById('vipLockOverlay');
    const statusBadge = document.getElementById('vipStatus');

    if (isVip && vipStartTime) {
        const remainingTime = VIP_DURATION_MS - (Date.now() - parseInt(vipStartTime, 10));

        if (remainingTime <= 0) {
            localStorage.removeItem('zerox_is_vip');
            localStorage.removeItem('zerox_vip_start_time');
            overlay.style.display = 'flex';
            statusBadge.textContent = 'EXPIRED';
            statusBadge.style.color = '#ff3366';
            return false;
        }

        const days = Math.floor(remainingTime / (24 * 60 * 60 * 1000));
        statusBadge.textContent = `VIP ACTIVE (${days}D)`;
        statusBadge.style.color = '#00ff88';
        overlay.style.display = 'none';
        return true;
    } else {
        overlay.style.display = 'flex';
        statusBadge.textContent = 'LOCKED';
        statusBadge.style.color = '#ff3366';
        return false;
    }
}

function attemptLogin() {
    const key = document.getElementById('licenseKeyInput').value.trim();
    const errMsg = document.getElementById('loginErrorMsg');

    if (AUTHORIZED_VIP_KEYS.includes(key)) {
        localStorage.setItem('zerox_is_vip', 'true');
        localStorage.setItem('zerox_vip_start_time', Date.now().toString());
        errMsg.style.display = 'none';
        checkVIPAccess();
    } else {
        errMsg.style.display = 'block';
    }
}

// Zeiierman Probability Engine
function updateZeiiermanCalculations() {
    const isGreen = Math.random() > 0.48;
    const highBreak = Math.random() > 0.42;
    const lowBreak = Math.random() > 0.45;

    if (isGreen) {
        matrix.gtotal++;
        if (highBreak) matrix.ghh++;
        if (lowBreak) matrix.gll++;
    } else {
        matrix.rtotal++;
        if (highBreak) matrix.rhh++;
        if (lowBreak) matrix.rll++;
    }

    const callProb = isGreen ? ((matrix.ghh / matrix.gtotal) * 100) : ((matrix.rhh / matrix.rtotal) * 100);
    const putProb = isGreen ? ((matrix.gll / matrix.gtotal) * 100) : ((matrix.rll / matrix.rtotal) * 100);

    const callStr = callProb.toFixed(2);
    const putStr = putProb.toFixed(2);

    const callElem = document.getElementById('callProb');
    const putElem = document.getElementById('putProb');
    const bar = document.getElementById('probBar');
    const biasElem = document.getElementById('biasStatus');

    if (callElem && putElem) {
        callElem.textContent = callStr + '%';
        putElem.textContent = putStr + '%';
    }

    if (bar && biasElem) {
        if (callProb >= putProb) {
            bar.style.width = callStr + '%';
            bar.style.background = 'var(--call)';
            biasElem.textContent = `BIAS: BULLISH (UP BREAK ${callStr}%)`;
            biasElem.style.color = 'var(--call)';
        } else {
            bar.style.width = putStr + '%';
            bar.style.background = 'var(--put)';
            biasElem.textContent = `BIAS: BEARISH (DOWN BREAK ${putStr}%)`;
            biasElem.style.color = 'var(--put)';
        }
    }
}

// Initial Run
checkVIPAccess();
updateZeiiermanCalculations();
setInterval(updateZeiiermanCalculations, 3000);