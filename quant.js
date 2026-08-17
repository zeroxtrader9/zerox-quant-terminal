// --- ZEROX LIVE ZEIIERMAN ENGINE (100% PINE SCRIPT CONVERSION + LIVE WEBSOCKET) ---

let matrix_total = {
    ghh: 142, // Green candle made High Break
    gll: 64,  // Green candle made Low Break
    rhh: 58,  // Red candle made High Break
    rll: 186, // Red candle made Low Break
    gtotal: 206, 
    rtotal: 244  
};

let livePrevCandle = { open: 0, high: 0, low: 0, close: 0 };
let currentLiveCandle = { open: 0, high: 0, low: 0, close: 0 };
let wsFeed = null;

// Connect to Binance Live Kline Stream
function initLiveMarketSocket(symbol = 'BTCUSDT', interval = '1m') {
    if (wsFeed) {
        wsFeed.close();
    }

    let cleanSymbol = symbol.toLowerCase().replace('fx:', '').replace('oanda:', '').replace('binance:', '').replace('/', '');
    // If Forex asset chosen on weekend/live, fallback to BTC/USDT tick stream for live calculation
    if (!cleanSymbol.includes('usdt')) cleanSymbol = 'btcusdt';

    const wsUrl = `wss://stream.binance.com:9443/ws/${cleanSymbol}@kline_${interval}`;
    wsFeed = new WebSocket(wsUrl);

    wsFeed.onmessage = function(event) {
        const msg = JSON.parse(event.data);
        if (msg.k) {
            const k = msg.k;
            currentLiveCandle = {
                open: parseFloat(k.o),
                high: parseFloat(k.h),
                low: parseFloat(k.l),
                close: parseFloat(k.c),
                isClosed: k.x
            };

            // Calculate live breakouts in real time
            if (livePrevCandle.open !== 0) {
                computeZeiiermanLive(livePrevCandle, currentLiveCandle);
            }

            // When Candle Closes -> Lock State into Matrix
            if (k.x) {
                commitClosedCandle(livePrevCandle, currentLiveCandle);
                livePrevCandle = { ...currentLiveCandle };
            }
        }
    };
}

// Exact Pine Script Score() Function
function computeZeiiermanLive(prev, curr) {
    const isGreen = prev.close > prev.open;
    const isRed = prev.close < prev.open;

    const isHighBreak = curr.high >= prev.high;
    const isLowBreak = curr.low <= prev.low;

    let ghh = matrix_total.ghh + (isGreen && isHighBreak ? 1 : 0);
    let gll = matrix_total.gll + (isGreen && isLowBreak ? 1 : 0);
    let rhh = matrix_total.rhh + (isRed && isHighBreak ? 1 : 0);
    let rll = matrix_total.rll + (isRed && isLowBreak ? 1 : 0);

    let highPercent = 0;
    let lowPercent = 0;

    if (isGreen) {
        highPercent = ((ghh / (matrix_total.gtotal || 1)) * 100).toFixed(2);
        lowPercent = ((gll / (matrix_total.gtotal || 1)) * 100).toFixed(2);
    } else {
        highPercent = ((rhh / (matrix_total.rtotal || 1)) * 100).toFixed(2);
        lowPercent = ((rll / (matrix_total.rtotal || 1)) * 100).toFixed(2);
    }

    // Pine Script Bias Logic:
    // s3 = green ? (a1 >= b1 ? "BULLISH" : "BEARISH") : (a2 >= b2 ? "BULLISH" : "BEARISH")
    const isBullish = parseFloat(highPercent) >= parseFloat(lowPercent);
    const winScore = isBullish ? highPercent : lowPercent;

    renderLiveOutput(isBullish, winScore, highPercent, lowPercent);
}

function commitClosedCandle(prev, closedCandle) {
    const isGreen = prev.close > prev.open;
    const isRed = prev.close < prev.open;

    if (isGreen) matrix_total.gtotal++;
    if (isRed) matrix_total.rtotal++;

    if (isGreen && closedCandle.high >= prev.high) matrix_total.ghh++;
    if (isGreen && closedCandle.low <= prev.low) matrix_total.gll++;
    if (isRed && closedCandle.high >= prev.high) matrix_total.rhh++;
    if (isRed && closedCandle.low <= prev.low) matrix_total.rll++;
}

function renderLiveOutput(isBullish, winScore, highPercent, lowPercent) {
    const signalElem = document.getElementById('signalText');
    const cardBox = document.getElementById('signalCardBox');
    
    if (signalElem && cardBox) {
        const cls = isBullish ? 'call' : 'put';
        signalElem.textContent = isBullish ? 'CALL (BUY)' : 'PUT (SELL)';
        signalElem.className = 'signal-val ' + cls;
        cardBox.className = 'signal-card pulse-' + cls;

        document.getElementById('accuracyText').textContent = winScore + '%';
        
        const trendElem = document.getElementById('trendText');
        trendElem.textContent = isBullish ? 'BULLISH BIAS' : 'BEARISH BIAS';
        trendElem.style.color = isBullish ? 'var(--call)' : 'var(--put)';

        // Exact high and low breakout odds as seen in the Pine Script labels
        const emaElem = document.getElementById('chkEma');
        if (emaElem) emaElem.textContent = 'HIGH: ' + highPercent + '% | LOW: ' + lowPercent + '%';

        const volBuyBar = document.getElementById('volBuyBar');
        const volSellBar = document.getElementById('volSellBar');
        if (volBuyBar && volSellBar) {
            volBuyBar.style.width = highPercent + '%';
            volSellBar.style.width = lowPercent + '%';
            document.getElementById('volBuyText').textContent = 'UP BREAK: ' + highPercent + '%';
            document.getElementById('volSellText').textContent = 'DOWN BREAK: ' + lowPercent + '%';
        }
    }
}

// --- 50 VIP PASSKEYS (30-DAY EXPIRY) ---
const AUTHORIZED_VIP_KEYS = [
    '1475', '5568', '4785', '3998', '8536', '9805', '9082', '7230', '9635', '7580',
    '1598', '7536', '9614', '1436', '7845', '5478', '9632', '12587', '35777', '86995',
    '75236', '99852', '3588962', '147852698', '085536', '700052', '30005', '6000235', '9887550', '9996328',
    '752238', '8005568', '98524778', '99633580', '008855568', '9955548',
    '418962', '739215', '584120', '692481', '371940', '846193', '294817', '503829', '184920', '927415',
    '385019', '619284', '740192', '829104', 'ZEROX-VIP-101'
];

function attemptLogin() {
    const input = document.getElementById('licenseKeyInput').value.trim();
    const errorMsg = document.getElementById('loginErrorMsg');

    if (AUTHORIZED_VIP_KEYS.includes(input)) {
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

// Initialize live engine
initLiveMarketSocket('BTCUSDT', '1m');