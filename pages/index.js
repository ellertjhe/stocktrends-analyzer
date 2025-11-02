import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import StockChart from '../components/StockChart';
import Heatmap from '../components/Heatmap';
import StockTicker from '../components/StockTicker';

export default function Home() {
  const [symbol, setSymbol] = useState('NVDA');
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('5y');

  async function fetchStockData(ticker) {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/stock-data?symbol=${ticker}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch stock data');
      }

      if (!data.data || data.data.length === 0) {
        setError('No data available for this stock');
        setLoading(false);
        return;
      }

      setStockData(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch stock data. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // Group data by month for heatmap
  const groupByMonth = () => {
    if (!stockData) return [];

    const grouped = {};

    stockData.data.forEach((item) => {
      const date = new Date(item.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(item);
    });

    return Object.entries(grouped).map(([period, items]) => {
      const firstItem = items[0];
      const lastItem = items[items.length - 1];
      const change = lastItem.close - firstItem.open;
      const changePercent = ((change / firstItem.open) * 100).toFixed(2);

      return {
        period,
        open: firstItem.open,
        close: lastItem.close,
        change,
        changePercent: parseFloat(changePercent),
      };
    });
  };

  // Filter by date range
  const filterByDateRange = (data) => {
    if (!data || data.length === 0) return data;
    
    console.log('Filtering data. DateRange:', dateRange);
    console.log('Sample period:', data[0]?.period);
    
    let filtered = data;

    if (dateRange === 'all') {
      return filtered;
    }

    const now = new Date();
    let cutoffDate = new Date();

    if (dateRange === '1y') {
      cutoffDate.setFullYear(cutoffDate.getFullYear() - 1);
    } else if (dateRange === '3y') {
      cutoffDate.setFullYear(cutoffDate.getFullYear() - 3);
    } else if (dateRange === '5y') {
      cutoffDate.setFullYear(cutoffDate.getFullYear() - 5);
    } else if (dateRange === '10y') {
      cutoffDate.setFullYear(cutoffDate.getFullYear() - 10);
    }

    console.log('Cutoff date:', cutoffDate);

    filtered = data.filter((item) => {
      try {
        const [year, month] = item.period.split('-');
        const itemDate = new Date(year, parseInt(month) - 1, 1);
        const passes = itemDate >= cutoffDate;
        return passes;
      } catch (error) {
        console.error('Error parsing period:', item.period, error);
        return true;
      }
    });

    console.log('Filtered count:', filtered.length);
    return filtered;
  };

  const trendData = filterByDateRange(groupByMonth());

  // Calculate insights
  const calculateInsights = () => {
    if (!trendData || trendData.length === 0) return null;

    const bullish = trendData.filter((d) => d.changePercent > 0).length;
    const bearish = trendData.filter((d) => d.changePercent < 0).length;
    const avgReturn = (trendData.reduce((sum, d) => sum + d.changePercent, 0) / trendData.length).toFixed(2);
    const best = trendData.reduce((max, d) => (d.changePercent > max.changePercent ? d : max));
    const worst = trendData.reduce((min, d) => (d.changePercent < min.changePercent ? d : min));
    const totalReturn = (
      ((trendData[trendData.length - 1].close - trendData[0].open) / trendData[0].open) * 100
    ).toFixed(2);

    return { bullish, bearish, avgReturn, best, worst, totalReturn };
  };

  const insights = calculateInsights();

  const handleSearch = (e) => {
    e.preventDefault();
    if (symbol.trim()) {
      fetchStockData(symbol.toUpperCase());
    }
  };

  useEffect(() => {
    fetchStockData(symbol);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">📈 Stock Trends Analyzer</h1>
        <p className="text-gray-600">Professional stock analysis with real-time data</p>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <SearchBar 
            onSearch={handleSearch} 
            symbol={symbol} 
            setSymbol={setSymbol}
          />
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-semibold"
          >
            <Search size={20} />
            Search
          </button>
        </form>

        {/* Date Range Filter */}
        <div className="flex gap-4">
          <label className="text-sm font-semibold text-gray-700">Period:</label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="1y">Last 1 Year</option>
            <option value="3y">Last 3 Years</option>
            <option value="5y">Last 5 Years</option>
            <option value="10y">Last 10 Years</option>
            <option value="all">All Data</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded">
          <p className="text-blue-700">Loading data...</p>
        </div>
      )}

      {/* Data Loaded State */}
      {!loading && stockData && (
        <>
          {/* Stock Ticker Header */}
          <StockTicker stockData={stockData} />

          {/* Chart */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <StockChart data={stockData.data} symbol={stockData.symbol} />
          </div>

          {/* Heatmap */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 overflow-x-auto">
            <Heatmap data={trendData} symbol={stockData.symbol} />
          </div>

          {/* Insights Section */}
          {insights && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">📊 Insights & Statistics</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-green-100 to-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Bullish</p>
                  <p className="text-2xl font-bold text-green-600">{insights.bullish}</p>
                </div>
                <div className="bg-gradient-to-br from-red-100 to-red-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Bearish</p>
                  <p className="text-2xl font-bold text-red-600">{insights.bearish}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-100 to-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Avg Return</p>
                  <p className="text-2xl font-bold text-blue-600">{insights.avgReturn}%</p>
                </div>
                <div className="bg-gradient-to-br from-purple-100 to-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total Return</p>
                  <p className="text-2xl font-bold text-purple-600">{insights.totalReturn}%</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-l-4 border-green-500 pl-4">
                  <p className="text-sm text-gray-600">Best Period</p>
                  <p className="font-bold text-green-600">
                    {insights.best.period}: +{insights.best.changePercent}%
                  </p>
                </div>
                <div className="border-l-4 border-red-500 pl-4">
                  <p className="text-sm text-gray-600">Worst Period</p>
                  <p className="font-bold text-red-600">{insights.worst.period}: {insights.worst.changePercent}%</p>
                </div>
              </div>
            </div>
          )}

          {/* Detailed Table */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">📋 Monthly Data</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-2 px-2 font-bold">Month</th>
                    <th className="text-right py-2 px-2 font-bold">Open</th>
                    <th className="text-right py-2 px-2 font-bold">Close</th>
                    <th className="text-right py-2 px-2 font-bold">Change $</th>
                    <th className="text-right py-2 px-2 font-bold">Change %</th>
                    <th className="text-center py-2 px-2 font-bold">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {trendData.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-2 px-2 font-semibold">{item.period}</td>
                      <td className="text-right py-2 px-2">${item.open.toFixed(2)}</td>
                      <td className="text-right py-2 px-2">${item.close.toFixed(2)}</td>
                      <td className={`text-right py-2 px-2 font-bold ${item.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${item.change.toFixed(2)}
                      </td>
                      <td className="text-right py-2 px-2">
                        <span className={`font-bold ${item.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {item.changePercent >= 0 ? '+' : ''}{item.changePercent}%
                        </span>
                      </td>
                      <td className="text-center py-2 px-2">
                        {item.changePercent >= 0 ? '🟢 UP' : '🔴 DOWN'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Footer */}
      <div className="text-center text-gray-500 text-sm mt-8">
        <p>📱 Stock Trends Analyzer v3.0</p>
        <p>Made with ❤️ • Powered by Polygon.io, Alpha Vantage, Finnhub</p>
      </div>
    </div>
  );
}