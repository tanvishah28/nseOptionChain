const express = require('express');
const puppeteer = require('puppeteer');
const axios = require('axios');
const app = express();
const PORT = 3000;

app.get('/option-chain', async (req, res) => {
  const symbol = req.query.symbol || 'NATIONALUM';
  const apiUrl = `https://www.nseindia.com/api/option-chain-equities?symbol=${symbol}`;

  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36');
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' });

    // Visit NSE homepage to get cookies
    await page.goto('https://www.nseindia.com', { waitUntil: 'networkidle2' });

    // Extract cookies
    const cookies = await page.cookies();
    const cookieString = cookies.map(c => `${c.name}=${c.value}`).join('; ');

    await browser.close();

    // Use Axios to fetch the API with cookies
    const response = await axios.get(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json',
        'Referer': 'https://www.nseindia.com/option-chain',
        'Cookie': cookieString
      }
    });

    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}/option-chain?symbol=NATIONALUM`);
});
