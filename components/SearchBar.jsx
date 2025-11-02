import { useState, useRef } from 'react';
import { Search } from 'lucide-react';

export default function SearchBar({ onSearch, symbol, setSymbol }) {
  const [showHelper, setShowHelper] = useState(false);
  const inputRef = useRef(null);

  const handleInputChange = (e) => {
    const value = e.target.value.toUpperCase();
    setSymbol(value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSearch(e);
      setShowHelper(false);
    }
  };

  return (
    <div className="relative flex-1">
      <input
        ref={inputRef}
        type="text"
        value={symbol}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setShowHelper(true)}
        onBlur={() => setTimeout(() => setShowHelper(false), 200)}
        placeholder="Search any symbol (popular or unpopular)..."
        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
      />

      {showHelper ? (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg mt-2 shadow-lg z-50 p-4 text-sm max-h-64 overflow-y-auto">
          <div className="font-bold text-gray-800 mb-3">✨ Powered by Polygon.io</div>
          
          <div className="space-y-3 text-gray-700">
            <div>
              <span className="font-semibold text-blue-600">📊 Popular US Stocks:</span>
              <div className="text-xs text-gray-600 mt-1">AAPL, MSFT, NVDA, TSLA, META, GOOGL, AMZN, NFLX, UBER, AMD, JPM, BAC, XOM</div>
            </div>
            <div>
              <span className="font-semibold text-purple-600">📈 ETFs:</span>
              <div className="text-xs text-gray-600 mt-1">SPY, QQQ, IWM, EEM, GLD, TLT, AGG, XLK, XLV, XLF</div>
            </div>
            <div>
              <span className="font-semibold text-green-600">💱 Forex:</span>
              <div className="text-xs text-gray-600 mt-1">EURUSD, GBPUSD, USDJPY, USDCAD, AUDUSD, NZDUSD</div>
            </div>
            <div>
              <span className="font-semibold text-orange-600">₿ Crypto:</span>
              <div className="text-xs text-gray-600 mt-1">BTCUSD, ETHUSD, DOGEUSD, LINKUSD, SOLUSD, ADAUSD, X:BTCUSD</div>
            </div>
            <div className="border-t pt-2 mt-2">
              <span className="font-semibold text-red-600">⭐ Any Symbol:</span>
              <div className="text-xs text-gray-600 mt-1">Type ANY symbol - popular or unpopular - and we'll search Polygon.io for it!</div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}