import React from 'react';

export default function Heatmap({ data, symbol }) {
  if (!data || data.length === 0) {
    return null;
  }

  // Organize data by year and period
  const organizeData = () => {
    const organized = {};
    const years = new Set();
    const periods = new Set();

    data.forEach((item) => {
      // Parse period (format: YYYY-MM or YYYY-Q1 or YYYY or YYYY-W1, etc.)
      const parts = item.period.split('-');
      const year = parts[0];
      const periodPart = parts[1];
      
      years.add(year);
      
      // Extract period number and type
      let periodNum = 0;
      let periodType = 'month';

      if (!periodPart) {
        // Yearly - use 0 as indicator
        periodNum = 0;
        periodType = 'yearly';
      } else if (periodPart.startsWith('Q')) {
        // Quarterly
        periodNum = parseInt(periodPart.substring(1));
        periodType = 'quarterly';
      } else if (periodPart.startsWith('W')) {
        // Weekly
        periodNum = parseInt(periodPart.substring(1));
        periodType = 'weekly';
      } else {
        // Monthly
        periodNum = parseInt(periodPart);
        periodType = 'monthly';
      }
      
      periods.add(periodNum);
      
      if (!organized[periodNum]) {
        organized[periodNum] = {};
      }
      organized[periodNum][year] = item;
    });

    return {
      organized,
      years: Array.from(years).sort(),
      periods: Array.from(periods).sort((a, b) => a - b),
    };
  };

  const { organized, years, periods } = organizeData();

  // Get color based on percentage change
  const getColor = (percentChange) => {
    if (!percentChange && percentChange !== 0) return 'bg-gray-100';
    const value = parseFloat(percentChange);
    if (value >= 10) return 'bg-green-700';
    if (value >= 5) return 'bg-green-600';
    if (value >= 0) return 'bg-green-400';
    if (value >= -5) return 'bg-red-400';
    if (value >= -10) return 'bg-red-600';
    return 'bg-red-700';
  };

  const getTextColor = () => {
    return 'text-white';
  };

  const getTotalColor = (percentChange) => {
    if (!percentChange && percentChange !== 0) return 'bg-yellow-100';
    const value = parseFloat(percentChange);
    if (value >= 10) return 'bg-green-200';
    if (value >= 5) return 'bg-green-100';
    if (value >= 0) return 'bg-green-50';
    if (value >= -5) return 'bg-red-50';
    if (value >= -10) return 'bg-red-100';
    return 'bg-red-200';
  };

  const getTotalTextColor = (percentChange) => {
    if (!percentChange && percentChange !== 0) return 'text-gray-800';
    const value = parseFloat(percentChange);
    if (value >= 0) return 'text-green-700';
    return 'text-red-700';
  };

  // Determine timeframe from first data point
  let timeframe = 'monthly';
  if (data[0]?.period.split('-').length === 1) {
    timeframe = 'yearly';
  } else if (data[0]?.period.includes('Q')) {
    timeframe = 'quarterly';
  } else if (data[0]?.period.includes('W')) {
    timeframe = 'weekly';
  }

  const getPeriodName = (periodNum, timeframe) => {
    if (timeframe === 'yearly') {
      return 'Year';
    }
    if (timeframe === 'quarterly') {
      return `Q${periodNum}`;
    }
    if (timeframe === 'weekly') {
      return `W${periodNum}`;
    }
    const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return monthNames[periodNum] || periodNum;
  };

  return (
    <div className="w-full overflow-x-auto">
      <h2 className="text-2xl font-bold mb-6">{symbol} - {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)} % Change Heatmap</h2>
      
      {/* Heatmap Grid Table */}
      <div className="inline-block border-2 border-gray-400 rounded-lg overflow-hidden">
        {/* Header Row (Years) */}
        <div className="flex">
          {/* Empty cell for row labels */}
          <div className="w-20 h-16 bg-gray-300 border border-gray-400 flex items-center justify-center font-bold text-sm">
            {timeframe === 'quarterly' ? 'Quarter' : timeframe === 'weekly' ? 'Week' : timeframe === 'yearly' ? 'Year' : 'Month'}
          </div>
          
          {/* Year headers */}
          {years.map((year) => (
            <div
              key={year}
              className="w-28 h-16 bg-gray-300 border border-gray-400 flex items-center justify-center font-bold text-base"
            >
              {year}
            </div>
          ))}
        </div>

        {/* Data Rows (Months/Quarters/Weeks/Years) */}
        {periods.map((period) => (
          <div key={period} className="flex">
            {/* Period label */}
            <div className="w-20 h-28 bg-gray-200 border border-gray-400 flex items-center justify-center font-bold text-sm">
              {getPeriodName(period, timeframe)}
            </div>

            {/* Data cells */}
            {years.map((year) => {
              const item = organized[period]?.[year];
              return (
                <div
                  key={`${year}-${period}`}
                  className={`w-28 h-28 ${getColor(item?.changePercent)} ${getTextColor()} border border-gray-400 flex flex-col items-center justify-center font-bold cursor-pointer hover:opacity-75 transition group relative`}
                  title={item ? `${item.period}: ${item.changePercent}%` : 'No data'}
                >
                  {item ? (
                    <>
                      <div className="text-lg font-bold">{item.changePercent}%</div>
                      <div className="text-xs">${item.change.toFixed(2)}</div>
                      
                      {/* Tooltip on hover */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-black text-white text-xs rounded py-2 px-3 z-10 w-max whitespace-nowrap">
                        <div>Open: ${item.open.toFixed(2)}</div>
                        <div>Close: ${item.close.toFixed(2)}</div>
                        <div>Change: ${item.change.toFixed(2)}</div>
                      </div>
                    </>
                  ) : (
                    <span className="text-xs text-gray-400">-</span>
                  )}
                </div>
              );
            })}
          </div>
        ))}

        {/* Total Row */}
        <div className="flex border-t-4 border-gray-400">
          {/* Label */}
          <div className="w-20 h-28 bg-yellow-200 border border-gray-400 flex items-center justify-center font-bold text-sm">
            Total
          </div>

          {/* Year totals */}
          {years.map((year) => {
            let totalPercent = 0;
            let totalDollar = 0;
            let count = 0;

            periods.forEach((period) => {
              const item = organized[period]?.[year];
              if (item) {
                totalPercent += item.changePercent;
                totalDollar += item.change;
                count += 1;
              }
            });

            const avgPercent = count > 0 ? (totalPercent / count).toFixed(2) : 0;
            const totalDollarFormatted = totalDollar.toFixed(2);

            return (
              <div
                key={`total-${year}`}
                className={`w-28 h-28 ${getTotalColor(avgPercent)} ${getTotalTextColor(avgPercent)} border-2 border-yellow-400 flex flex-col items-center justify-center font-bold cursor-pointer hover:opacity-75 transition group relative`}
                title={`${year} Total`}
              >
                <div className="text-lg font-bold">{avgPercent}%</div>
                <div className="text-xs">${totalDollarFormatted}</div>

                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-black text-white text-xs rounded py-2 px-3 z-10 w-max whitespace-nowrap">
                  <div>Year: {year}</div>
                  <div>Avg %: {avgPercent}%</div>
                  <div>Total $: ${totalDollarFormatted}</div>
                  <div>Periods: {count}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-8 flex gap-3 items-center text-sm flex-wrap">
        <span className="font-bold text-base">Legend:</span>
        <div className="flex items-center gap-2">
          <div className="bg-green-700 w-8 h-8 rounded"></div>
          <span>&ge;10% (Strong Gain)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-green-600 w-8 h-8 rounded"></div>
          <span>5-10% (Gain)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-green-400 w-8 h-8 rounded"></div>
          <span>0-5% (Slight Gain)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-red-400 w-8 h-8 rounded"></div>
          <span>-5-0% (Slight Loss)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-red-600 w-8 h-8 rounded"></div>
          <span>-10--5% (Loss)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-red-700 w-8 h-8 rounded"></div>
          <span>&le;-10% (Strong Loss)</span>
        </div>
      </div>
    </div>
  );
}