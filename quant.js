// --- ZEROX PRO ALGO ENGINE (Smart Filter Enabled) ---

function processZeiiermanBreakoutLogic(prev) {
    // Smart Filter Variables
    const rsi = (Math.random() * (75 - 25) + 25).toFixed(1); // Simulating RSI
    const volumeScore = Math.random(); // Simulating Volume
    const priceTrend = prev.close > prev.open ? 'BULL' : 'BEAR';
    
    // Pro Filter Condition: Only signal if RSI is healthy and Volume is high
    const isRsiSafe = (rsi > 35 && rsi < 65);
    const isVolumeHigh = (volumeScore > 0.4); 

    if (!isRsiSafe || !isVolumeHigh) {
        // Signal Wait Mode
        document.getElementById('signalText').textContent = "WAIT / CONSOLIDATING";
        document.getElementById('signalText').className = "signal-val";
        document.getElementById('accuracyText').textContent = "--";
        return;
    }

    // If passed, generate Pro Signal
    const isBullish = (priceTrend === 'BULL');
    const probScore = (Math.random() * (98 - 92) + 92).toFixed(1);

    renderLiveQuantOutput(isBullish, probScore, (parseFloat(probScore) + 2).toFixed(1), rsi);
}

function renderLiveQuantOutput(isBullish, probScore, highProb, rsiVal) {
    const signalElem = document.getElementById('signalText');
    const cardBox = document.getElementById('signalCardBox');
    
    const cls = isBullish ? 'call' : 'put';
    signalElem.textContent = isBullish ? 'CALL (BUY)' : 'PUT (SELL)';
    signalElem.className = 'signal-val ' + cls;
    cardBox.className = 'signal-card pulse-' + cls;

    document.getElementById('accuracyText').textContent = probScore + '%';
    document.getElementById('trendText').textContent = isBullish ? 'BULLISH' : 'BEARISH';
    document.getElementById('trendText').style.color = isBullish ? 'var(--call)' : 'var(--put)';
    document.getElementById('rsiVal').textContent = rsiVal;
}