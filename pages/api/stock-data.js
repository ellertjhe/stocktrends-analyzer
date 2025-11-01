export default async function handler(req, res) {
  const { symbol, outputsize } = req.query;

  if (!symbol) {
    return res.status(400).json({ error: 'Symbol is required' });
  }

  try {
    // Using Alpha Vantage API (free tier)
    const apiKey = 'demo'; // Replace with real key later
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY&symbol=${symbol}&apikey=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data['Error Message']) {
      return res.status(404).json({ error: 'Stock not found' });
    }

    if (!data['Monthly Time Series']) {
      return res.status(500).json({ error: 'No data available' });
    }

    // Process and return the data
    const timeSeries = data['Monthly Time Series'];
    const processedData = Object.entries(timeSeries).map(([date, values]) => ({
      date,
      open: parseFloat(values['1. open']),
      high: parseFloat(values['2. high']),
      low: parseFloat(values['3. low']),
      close: parseFloat(values['4. close']),
    }));

    res.status(200).json({
      symbol,
      data: processedData.reverse(),
      meta: data['Meta Data'],
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stock data' });
  }
}