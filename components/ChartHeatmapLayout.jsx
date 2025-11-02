import StockChart from './StockChart';
import Heatmap from './Heatmap';

export default function ChartHeatmapLayout({ stockData, trendData, symbol }) {
  if (!stockData || !trendData) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Left Side - Chart */}
      <div className="card">
        <StockChart data={stockData.data} symbol={symbol} />
      </div>

      {/* Right Side - Heatmap */}
      <div className="card overflow-x-auto">
        <Heatmap data={trendData} symbol={symbol} />
      </div>
    </div>
  );
}