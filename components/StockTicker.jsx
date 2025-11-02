export default function StockTicker({ stockData }) {
  if (!stockData || !stockData.data || stockData.data.length === 0) {
    return null;
  }

  const data = stockData.data;
  const latestPrice = data[data.length - 1].close;
  const previousPrice = data[data.length - 2]?.close || data[0].open;
  const change = latestPrice - previousPrice;
  const changePercent = ((change / previousPrice) * 100).toFixed(2);
  const high = Math.max(...data.map(d => d.high));
  const low = Math.min(...data.map(d => d.low));

  const isPositive = change >= 0;

  return (
    <div className="bg-gray-900 text-white p-4 rounded-lg mb-6">
      <div className="flex items-center justify-between">
        {/* Left: Symbol and Name */}
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold">{stockData.symbol}</h1>
            <p className="text-sm text-gray-400">Stock • {stockData.source}</p>
          </div>

          {/* Price and Change */}
          <div className="flex items-center gap-4">
            <div>
              <p className="text-4xl font-bold">${latestPrice.toFixed(2)}</p>
              <p className={`text-lg font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {isPositive ? '+' : ''}{change.toFixed(2)} ({isPositive ? '+' : ''}{changePercent}%)
              </p>
            </div>

            {/* Buy/Sell Buttons */}
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded font-bold">
                SELL
              </button>
              <button className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded font-bold">
                BUY
              </button>
            </div>
          </div>
        </div>

        {/* Right: High/Low/Stats */}
        <div className="text-right">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-gray-400">HIGH</p>
              <p className="text-xl font-bold text-green-400">H{high.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">LOW</p>
              <p className="text-xl font-bold text-red-400">L{low.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">RANGE</p>
              <p className="text-xl font-bold text-blue-400">${(high - low).toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}