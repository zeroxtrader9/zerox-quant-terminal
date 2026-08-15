let currentInterval = 1;

function setTimeframe(tf, btn) {
    currentInterval = parseInt(tf);
    document.querySelectorAll('.tf-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    switchMarket();
}

function selectChip(symbol, btn) {
    document.getElementById('assetSelector').value = symbol;
    document.querySelectorAll('.chip-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    switchMarket();
}

function switchMarket() {
    const symbol = document.getElementById('assetSelector').value;
    const frame = document.getElementById('tv_frame');
    if (frame) {
        frame.src = 'https://s.tradingview.com/widgetembed/?symbol=' + encodeURIComponent(symbol) + '&interval=' + currentInterval + '&theme=dark&style=1&timezone=Etc%2FUTC&hideideas=1';
    }

    if (typeof connectLiveMarketAPI === 'function') {
        connectLiveMarketAPI(symbol);
    }
}