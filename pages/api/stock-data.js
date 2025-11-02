export default async function handler(req, res) {
  let { symbol } = req.query;

  if (!symbol) {
    return res.status(400).json({ error: 'Symbol is required' });
  }

  try {
    const originalSymbol = symbol;
    symbol = symbol.toUpperCase().trim();

    console.log(`Searching for: ${symbol}`);

    const polygonKey = process.env.NEXT_PUBLIC_POLYGON_API_KEY;
    const alphaKey = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY;
    const finnhubKey = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;

    // STEP 1: Try Polygon.io first (US stocks, ETFs)
    if (polygonKey) {
      console.log(`1️⃣ Trying Polygon.io with: ${symbol}`);
      
      const url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/month/2020-01-01/2025-12-31?apiKey=${polygonKey}`;
      
      try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.results && data.results.length > 0) {
          console.log(`✅ Found on Polygon: ${symbol} (${data.results.length} months)`);
          
          // If Polygon returns less than 60 months (5 years), try Alpha Vantage for full history
          if (data.results.length < 60) {
            console.log(`⏭️ Skipping Polygon (only ${data.results.length} months), trying Alpha Vantage for full history...`);
            // Continue to Alpha Vantage instead of returning
          } else {
            const processedData = data.results
              .map((bar) => ({
                date: new Date(bar.t).toISOString().split('T')[0],
                open: bar.o,
                high: bar.h,
                low: bar.l,
                close: bar.c,
              }))
              .sort((a, b) => new Date(a.date) - new Date(b.date));

            return res.status(200).json({
              symbol,
              data: processedData,
              source: 'Polygon.io',
              count: processedData.length,
            });
          }
        }
      } catch (error) {
        console.log(`❌ Polygon error: ${error.message}`);
      }
    }

    // STEP 2: Try Alpha Vantage (stocks, forex, crypto) - full history
    if (alphaKey) {
      console.log(`2️⃣ Trying Alpha Vantage with: ${symbol}`);
      
      const url = `https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY&symbol=${symbol}&apikey=${alphaKey}`;
      
      try {
        const response = await fetch(url);
        const data = await response.json();

        console.log(`📊 Alpha Response Keys:`, Object.keys(data));
        console.log(`📊 Response Sample:`, JSON.stringify(data).substring(0, 300));

        if (data['Monthly Time Series'] && Object.keys(data['Monthly Time Series']).length > 0) {
          const monthCount = Object.keys(data['Monthly Time Series']).length;
          console.log(`✅ Found on Alpha Vantage: ${symbol} (${monthCount} months)`);
          
          const timeSeries = data['Monthly Time Series'];
          const processedData = Object.entries(timeSeries)
            .map(([date, values]) => ({
              date,
              open: parseFloat(values['1. open']),
              high: parseFloat(values['2. high']),
              low: parseFloat(values['3. low']),
              close: parseFloat(values['4. close']),
            }))
            .reverse();

          return res.status(200).json({
            symbol,
            data: processedData,
            source: 'Alpha Vantage',
            count: processedData.length,
          });
        }

        // Check for error message (rate limit, invalid symbol)
        if (data['Note']) {
          console.log(`⚠️ Alpha Vantage RATE LIMIT: ${data['Note']}`);
        }
        if (data['Error Message']) {
          console.log(`❌ Alpha Vantage ERROR: ${data['Error Message']}`);
        }
        
        console.log(`❌ No data from Alpha Vantage for ${symbol}`);
      } catch (error) {
        console.log(`❌ Alpha Vantage error: ${error.message}`);
      }
    }

    // STEP 3: Try Finnhub for Crypto (BTCUSD, ETHUSD, etc.)
    if (finnhubKey && (symbol.includes('USD') || symbol.includes('BTC') || symbol.includes('ETH'))) {
      console.log(`3️⃣ Trying Finnhub for crypto: ${symbol}`);
      
      const endDate = Math.floor(Date.now() / 1000);
      const startDate = endDate - (10 * 365 * 24 * 60 * 60); // 10 years back

      const url = `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=M&from=${startDate}&to=${endDate}&token=${finnhubKey}`;
      
      try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.t && data.t.length > 0) {
          console.log(`✅ Found on Finnhub: ${symbol} (${data.t.length} months)`);
          
          const processedData = data.t.map((timestamp, index) => ({
            date: new Date(timestamp * 1000).toISOString().split('T')[0],
            open: data.o[index],
            high: data.h[index],
            low: data.l[index],
            close: data.c[index],
          }));

          return res.status(200).json({
            symbol,
            data: processedData,
            source: 'Finnhub',
            count: processedData.length,
          });
        }
      } catch (error) {
        console.log(`❌ Finnhub error: ${error.message}`);
      }
    }

    // Not found
    console.log(`❌ Symbol not found on any API: ${symbol}`);
    return res.status(404).json({ 
      error: `Symbol '${originalSymbol}' not found on any API`,
      hint: 'Try: AAPL (stock), SPY (ETF), EURUSD (forex), BTCUSD (crypto)',
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
}