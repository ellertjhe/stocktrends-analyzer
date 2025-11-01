export default async function handler(req, res) {
  const { symbol } = req.query;

  if (!symbol) {
    return res.status(400).json({ error: 'Symbol is required' });
  }

  try {
    console.log(`Fetching ${symbol}...`);

    const apiKey = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY;
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY&symbol=${symbol}&apikey=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data['Error Message']) {
      return res.status(404).json({ error: `Stock '${symbol}' not found` });
    }

    if (!data['Monthly Time Series']) {
      return res.status(500).json({ error: 'No data available' });
    }

    const timeSeries = data['Monthly Time Series'];
    const processedData = Object.entries(timeSeries).map(([date, values]) => ({
      date,
      open: parseFloat(values['1. open']),
      high: parseFloat(values['2. high']),
      low: parseFloat(values['3. low']),
      close: parseFloat(values['4. close']),
    }));

    const sortedData = processedData.reverse();

    res.status(200).json({
      symbol,
      data: sortedData,
      dataPoints: sortedData.length,
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
}