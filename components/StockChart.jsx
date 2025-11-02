import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState } from 'react';

export default function StockChart({ data, symbol }) {
  const [chartType, setChartType] = useState('line');

  if (!data || data.length === 0) {
    return null;
  }

  const chartData = data.map((item) => ({
    date: item.date,
    close: item.close,
    high: item.high,
    low: item.low,
  }));

  const prices = data.map(d => d.close);
  const minPrice = Math.min(...prices) * 0.95;
  const maxPrice = Math.max(...prices) * 1.05;

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return `${d.getDate()} ${d.toLocaleString('en-US', { month: 'short' })}`;
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800">{symbol} - Price Chart</h3>
        
        {/* Chart Type Selector */}
        <div className="flex gap-2">
          <button
            onClick={() => setChartType('line')}
            className={`px-3 py-1 rounded text-sm font-semibold transition ${
              chartType === 'line' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Line
          </button>
          <button
            onClick={() => setChartType('area')}
            className={`px-3 py-1 rounded text-sm font-semibold transition ${
              chartType === 'area' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Area
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`px-3 py-1 rounded text-sm font-semibold transition ${
              chartType === 'bar' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Bar
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        {chartType === 'line' && (
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              interval={Math.floor(chartData.length / 6)}
              tickFormatter={formatDate}
            />
            <YAxis 
              domain={[minPrice, maxPrice]}
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              formatter={(value) => `$${value.toFixed(2)}`}
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
              labelFormatter={formatDate}
            />
            
            <Line 
              type="monotone" 
              dataKey="close" 
              stroke="#2563eb" 
              dot={false}
              strokeWidth={2}
            />
          </LineChart>
        )}

        {chartType === 'area' && (
          <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              interval={Math.floor(chartData.length / 6)}
              tickFormatter={formatDate}
            />
            <YAxis 
              domain={[minPrice, maxPrice]}
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              formatter={(value) => `$${value.toFixed(2)}`}
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
              labelFormatter={formatDate}
            />
            
            <Area 
              type="monotone" 
              dataKey="close" 
              fill="#2563eb" 
              stroke="#2563eb"
              fillOpacity={0.3}
            />
          </AreaChart>
        )}

        {chartType === 'bar' && (
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              interval={Math.floor(chartData.length / 6)}
              tickFormatter={formatDate}
            />
            <YAxis 
              domain={[minPrice, maxPrice]}
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              formatter={(value) => `$${value.toFixed(2)}`}
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
              labelFormatter={formatDate}
            />
            
            <Bar 
              dataKey="close" 
              fill="#2563eb"
              isAnimationActive={false}
            />
          </BarChart>
        )}
      </ResponsiveContainer>

      {/* Stats Below Chart */}
      <div className="grid grid-cols-4 gap-2 mt-4">
        <div className="bg-blue-50 p-2 rounded text-center">
          <p className="text-xs text-gray-600">Latest</p>
          <p className="text-sm font-bold text-blue-600">${data[data.length - 1].close.toFixed(2)}</p>
        </div>
        <div className="bg-green-50 p-2 rounded text-center">
          <p className="text-xs text-gray-600">High</p>
          <p className="text-sm font-bold text-green-600">${Math.max(...prices).toFixed(2)}</p>
        </div>
        <div className="bg-red-50 p-2 rounded text-center">
          <p className="text-xs text-gray-600">Low</p>
          <p className="text-sm font-bold text-red-600">${Math.min(...prices).toFixed(2)}</p>
        </div>
        <div className="bg-purple-50 p-2 rounded text-center">
          <p className="text-xs text-gray-600">Change</p>
          <p className={`text-sm font-bold ${((data[data.length - 1].close - data[0].open) / data[0].open * 100) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {(((data[data.length - 1].close - data[0].open) / data[0].open) * 100).toFixed(2)}%
          </p>
        </div>
      </div>
    </div>
  );
}