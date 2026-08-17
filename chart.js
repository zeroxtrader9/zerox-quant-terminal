let currentSymbol = 'BINANCE:BTCUSDT';
let currentInterval = 1;

function updateChart() {
    const frame = document.getElementById('tv_frame');
    frame.src = `https://s.tradingview.com/widgetembed/?symbol=${encodeURIComponent(currentSymbol)}&interval=${currentInterval}&theme=dark&style=1&timezone=Etc%2FUTC&hideideas=1`;
    
    // Switch live WebSocket calculation
    if (typeof initLiveMarketSocket === 'function') {
        initLiveMarketSocket(currentSymbol, currentInterval + 'm');
    }
}

function switchMarket() {
    const selector = document.getElementById('assetSelector');
    currentSymbol = selector.value;
    updateChart();
}

function selectChip(sym, elem) {
    document.querySelectorAll('.chip-btn').forEach(btn => btn.classList.remove('active'));
    elem.classList.add('active');
    currentSymbol = sym;
    const selector = document.getElementById('assetSelector');
    if (selector) selector.value = sym;
    updateChart();
}

function setTimeframe(tf, elem) {
    document.querySelectorAll('.tf-btn').forEach(btn => btn.classList.remove('active'));
    elem.classList.add('active');
    currentInterval = tf;
    updateChart();
}