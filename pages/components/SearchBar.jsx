import { useState, useEffect } from 'react';
import { Search, TrendingUp, TrendingDown } from 'lucide-react';

// Sample stock database - in production, use real API
const STOCKS_DATABASE = [
  { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', country: '🇺🇸' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ', country: '🇺🇸' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ', country: '🇺🇸' },
  { symbol: 'TSLA', name: 'Tesla Inc.', exchange: 'NASDAQ', country: '🇺🇸' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ', country: '🇺🇸' },
  { symbol: 'GOOG', name: 'Alphabet Inc. (Class C)', exchange: 'NASDAQ', country: '🇺🇸' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', exchange: 'NASDAQ', country: '🇺🇸' },
  { symbol: 'META', name: 'Meta Platforms Inc.', exchange: 'NASDAQ', country: '🇺🇸' },
  { symbol: 'AMD', name: 'Advanced Micro Devices', exchange: 'NASDAQ', country: '🇺🇸' },
  { symbol: 'INTC', name: 'Intel Corporation', exchange: 'NASDAQ', country: '🇺🇸' },
  { symbol: 'NFLX', name: 'Netflix Inc.', exchange: 'NASDAQ', country: '🇺🇸' },
  { symbol: 'ADBE', name: 'Adobe Inc.', exchange: 'NASDAQ', country: '🇺🇸' },
  { symbol: 'PYPL', name: 'PayPal Holdings', exchange: 'NASDAQ', country: '🇺🇸' },
  { symbol: 'UBER', name: 'Uber Technologies', exchange: 'NYSE', country: '🇺🇸' },
  { symbol: 'LYFT', name: 'Lyft Inc.', exchange: 'NASDAQ', country: '🇺🇸' },
  { symbol: 'SPOT', name: 'Spotify Technology', exchange: 'NYSE', country: '🇸🇪' },
  { symbol: 'TLRY', name: 'Tilray Brands', exchange: 'NASDAQ', country: '🇨🇦' },
  { symbol: 'GM', name: 'General Motors', exchange: 'NYSE', country: '🇺🇸' },
  { symbol: 'F', name: 'Ford Motor Company', exchange: 'NYSE', country: '🇺🇸' },
  { symbol: 'GE', name: 'General Electric', exchange: 'NYSE', country: '🇺🇸' },
  { symbol: 'JPM', name: 'JPMorgan Chase', exchange: 'NYSE', country: '🇺🇸' },
  { symbol: 'BAC', name: 'Bank of America', exchange: 'NYSE', country: '🇺🇸' },
  { symbol: 'WFC', name: 'Wells Fargo', exchange: 'NYSE', country: '🇺🇸' },
  { symbol: 'GS', name: 'Goldman Sachs Group', exchange: 'NYSE', country: '🇺🇸' },
  { symbol: 'MS', name: 'Morgan Stanley', exchange: 'NYSE', country: '🇺🇸' },
  { symbol: 'SPY', name: 'S&P 500 ETF', exchange: 'ARCA', country: '🇺🇸' },
  { symbol: 'QQQ', name: 'Nasdaq 100 ETF', exchange: 'ARCA', country: '🇺🇸' },
  { symbol: 'IWM', name: 'Russell 2000 ETF', exchange: 'ARCA', country: '🇺🇸' },
  { symbol: 'EEM', name: 'Emerging Markets ETF', exchange: 'ARCA', country: '🇺🇸' },
  { symbol: 'EWJ', name: 'iShares MSCI Japan ETF', exchange: 'ARCA', country: '🇺🇸' },
  { symbol: 'FXI', name: 'iShares China Large-Cap ETF', exchange: 'ARCA', country: '🇺🇸' },
  { symbol: 'VTSAX', name: 'Vanguard Total Stock Market', exchange: 'MUTUAL', country: '🇺🇸' },
  { symbol: 'BRK.B', name: 'Berkshire Hathaway B', exchange: 'NYSE', country: '🇺🇸' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', exchange: 'NYSE', country: '🇺🇸' },
  { symbol: 'PG', name: 'Procter & Gamble', exchange: 'NYSE', country: '🇺🇸' },
  { symbol: 'KO', name: 'The Coca-Cola Company', exchange: 'NYSE', country: '🇺🇸' },
  { symbol: 'PEP', name: 'PepsiCo Inc.', exchange: 'NASDAQ', country: '🇺🇸' },
  { symbol: 'MCD', name: 'McDonald\'s Corporation', exchange: 'NYSE', country: '🇺🇸' },
  { symbol: 'CMCSA', name: 'Comcast Corporation', exchange: 'NASDAQ', country: '🇺🇸' },
  { symbol: 'DIS', name: 'The Walt Disney Company', exchange: 'NYSE', country: '🇺🇸' },
  { symbol: 'AMGX', name: 'Amgen Inc.', exchange: 'NASDAQ', country: '🇺🇸' },
];

export default function SearchBar({ onSearch, symbol, setSymbol }) {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // Filter stocks based on input
  const handleInputChange = (e) => {
    const value = e.target.value.toUpperCase();
    setSymbol(value);
    setHighlightedIndex(-1);

    if (value.length > 0) {
      const filtered = STOCKS_DATABASE.filter(
        (stock) =>
          stock.symbol.includes(value) ||
          stock.name.toUpperCase().includes(value)
      ).slice(0, 10); // Show max 10 suggestions

      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') {
        onSearch(e);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          selectStock(suggestions[highlightedIndex]);
        } else if (symbol.length > 0) {
          onSearch(e);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
      default:
        break;
    }
  };

  // Select a stock from suggestions
  const selectStock = (stock) => {
    setSymbol(stock.symbol);
    setSuggestions([]);
    setShowSuggestions(false);
    setHighlightedIndex(-1);

    // Trigger search
    setTimeout(() => {
      const event = new Event('submit', { bubbles: true });
      onSearch(event);
    }, 0);
  };

  return (
    <div className="relative w-full">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={symbol}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => symbol.length > 0 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Search ticker (e.g., AAPL, NVDA, TSLA)"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white text-gray-800"
            autoComplete="off"
          />

          {/* Autocomplete Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
              {suggestions.map((stock, index) => (
                <div
                  key={stock.symbol}
                  onClick={() => selectStock(stock)}
                  className={`px-4 py-3 cursor-pointer transition-colors ${
                    index === highlightedIndex
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-800 hover:bg-gray-100'
                  } border-b border-gray-200 last:border-b-0`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="font-bold text-lg">{stock.symbol}</div>
                      <div className="text-sm opacity-75">{stock.name}</div>
                    </div>
                    <div className="text-xs text-right">
                      <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded">
                        {stock.exchange}
                      </span>
                      <span className="ml-2">{stock.country}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No results message */}
          {showSuggestions && symbol.length > 0 && suggestions.length === 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-gray-500 z-50">
              No stocks found for "{symbol}"
            </div>
          )}
        </div>

        <button
          onClick={onSearch}
          className="btn btn-primary flex items-center gap-2 px-6 py-3 rounded-lg font-semibold"
        >
          <Search size={20} />
          Search
        </button>
      </div>

      {/* Helpful hint */}
      {!showSuggestions && symbol.length === 0 && (
        <div className="text-xs text-gray-500 mt-2">
          💡 Try: AAPL, MSFT, NVDA, TSLA, SPY, or any stock ticker
        </div>
      )}
    </div>
  );
}