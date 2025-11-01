import { useState, useEffect } from 'react';
import { Download, TrendingUp, TrendingDown } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import Heatmap from '../components/Heatmap';

export default function Home() {
  const [symbol, setSymbol] = useState('NVDA');
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('monthly');
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
 
  // Group data by timeframe
  const groupByTimeframe = () => {
    if (!stockData) return [];

    const grouped = {};

    stockData.data.forEach((item) => {
      const date = new Date(item.date);
      let key = '';

      if (timeframe === 'weekly') {
        const week = Math.ceil(date.getDate() / 7);
        key = `${date.getFullYear()}-W${week}`;
      } else if (timeframe === 'monthly') {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      } else if (timeframe === 'quarterly') {
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        key = `${date.getFullYear()}-Q${quarter}`;
      } else if (timeframe === 'yearly') {
        key = `${date.getFullYear()}`;
      }

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
    let filtered = data;

    if (dateRange === '1y') {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      filtered = filtered.filter((item) => new Date(item.period) >= oneYearAgo);
    } else if (dateRange === '3y') {
      const threeYearsAgo = new Date();
      threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
      filtered = filtered.filter((item) => new Date(item.period) >= threeYearsAgo);
    } else if (dateRange === '5y') {
      const fiveYearsAgo = new Date();
      fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
      filtered = filtered.filter((item) => new Date(item.period) >= fiveYearsAgo);
    } else if (dateRange === '10y') {
      const tenYearsAgo = new Date();
      tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
      filtered = filtered.filter((item) => new Date(item.period) >= tenYearsAgo);
    }

    return filtered;
  };

  const trendData = filterByDateRange(groupByTimeframe());

  // Calculate insights
  const calculateInsights = () => {
    if (!trendData || trendData.length === 0) return null;

    const bullish = trendData.filter((d) => d.changePercent > 0).length;
    const bearish = trendData.filter((d) => d.changePercent < 0).length;
    const avgReturn = (trendData.reduce((sum, d) => sum + d.changePercent, 0) / trendData.length).toFixed(2);
    const best = trendData.reduce((max, d) => (d.changePercent > max.changePercent ? d : max));
    const worst = trendData.reduce((min, d) => (d.changePercent < min.changePercent ? d : min));
    const totalReturn = (
      ((trendData[trendData.length - 1].close - trendData[0].open) / trendData[0].open) *
      100
    ).toFixed(2);

    return {
      bullish,
      bearish,
      avgReturn,
      best,
      worst,
      totalReturn,
    };
  };

  const insights = calculateInsights();

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (symbol.trim()) {
      fetchStockData(symbol.toUpperCase());
    }
  };

  // Initialize on mount
  useEffect(() => {
    fetchStockData(symbol);
  }, []);

  return (
    <div className="container">
      {/* Header */}
      <div className="card mt-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">📈 Stock Trends Analyzer</h1>
        <p className="text-gray-600 mb-6">Customizable stock performance analysis with flexible timeframes</p>

        {/* Search Bar with Autocomplete */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <SearchBar 
            onSearch={handleSearch} 
            symbol={symbol} 
            setSymbol={setSymbol}
          />
        </form>

        {/* Controls */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Timeframe Selector */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">Timeframe</label>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              {/*<option value="weekly">Weekly</option>*/}
              <option value="monthly">Monthly</option>
              {/*<option value="quarterly">Quarterly</option>*/}
              <option value="yearly">Yearly</option>
            </select>
          </div>

          {/* Date Range Selector */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">Period</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="1y">Last 1 Year</option>
              <option value="3y">Last 3 Years</option>
              <option value="5y">Last 5 Years</option>
              <option value="10y">Last 10 Years</option>
              <option value="all">All Data</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && <div className="card error">{error}</div>}

      {/* Loading State */}
      {loading && <div className="card loading">Loading stock data...</div>}

      {/* Main Content */}
      {!loading && stockData && (
        <>
          {/* HEATMAP AT TOP */}
          <div className="card">
            <Heatmap data={trendData} symbol={symbol} />
          </div>

          {/* Insights Card */}
          {insights && (
            <div className="card">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">📊 Insights & Statistics</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-green-100 to-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Bullish Periods</p>
                  <p className="text-2xl font-bold text-green-600">{insights.bullish}</p>
                </div>
                <div className="bg-gradient-to-br from-red-100 to-red-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Bearish Periods</p>
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

          {/* DETAILED TABLE AT BOTTOM */}
          <div className="card">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">📋 Detailed Monthly Data - {symbol}</h2>
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Period</th>
                    <th>Opening</th>
                    <th>Closing</th>
                    <th>Change ($)</th>
                    <th>Change (%)</th>
                    <th>Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {trendData.map((item, idx) => (
                    <tr key={idx}>
                      <td className="font-semibold">{item.period}</td>
                      <td>${item.open.toFixed(2)}</td>
                      <td>${item.close.toFixed(2)}</td>
                      <td className={item.change >= 0 ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                        ${item.change.toFixed(2)}
                      </td>
                      <td>
                        <span className={item.changePercent >= 0 ? 'bullish' : 'bearish'}>
                          {item.changePercent >= 0 ? '🟢' : '🔴'} {item.changePercent}%
                        </span>
                      </td>
                      <td>{item.changePercent >= 0 ? 'BULLISH' : 'BEARISH'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer */}
          <div className="card text-center text-gray-600">
            <p className="mb-2">📱 Stock Trends Analyzer v1.2</p>
            <p className="text-sm">Made with ❤️ | Now with Heatmap Visualization!</p>
            <p className="text-xs mt-2">Real-time data from Alpha Vantage API</p>
          </div>
        </>
      )}

      {/* Ad Space Placeholder */}
      <div className="card text-center text-gray-400 py-8">
        <p>💰 Ad Space (Google AdSense will go here)</p>
      </div>
    </div>
  );
}