// --- AUTHORIZED VIP KEYS LIST ---
// Aap jo bhi keys batayenge wo yahan list me add ho jayengi
const AUTHORIZED_VIP_KEYS = [
    'ZEROX-VIP-101',
    'ZEROX-VIP-202',
    'ZEROX-VIP-303',
    'ZEROX-VIP-777',
    'ZEROX-PRO-30DAYS'
];

function attemptLogin() {
    const input = document.getElementById('licenseKeyInput').value.trim().toUpperCase();
    const errorMsg = document.getElementById('loginErrorMsg');

    if (AUTHORIZED_VIP_KEYS.includes(input)) {
        // 30 Days Expiry Clock Start
        localStorage.setItem('zerox_is_vip', 'true');
        localStorage.setItem('zerox_vip_start_time', Date.now().toString());
        
        document.getElementById('vipLockOverlay').style.display = 'none';
        document.getElementById('activeKeyStatus').textContent = 'VIP ACTIVE (30 DAYS)';
        document.getElementById('activeKeyStatus').style.color = '#00ff88';
        
        const timerElem = document.getElementById('timerDisplay');
        if (timerElem) {
            timerElem.textContent = '30D 00H LEFT';
            timerElem.style.color = '#00ff88';
        }
        if (errorMsg) errorMsg.style.display = 'none';
    } else {
        errorMsg.textContent = 'INVALID VIP KEY! Contact @zeroxwithai';
        errorMsg.style.display = 'block';
    }
}