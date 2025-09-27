const express = require("express");
const chromium = require("chrome-aws-lambda");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/option-chain", async (req, res) => {
  const symbol = req.query.symbol || "NATIONALUM";
  let browser = null;

  try {
    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath || null,
      headless: chromium.headless,
    });

    const page = await browser.newPage();

    // Spoof user-agent to bypass NSE bot detection
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
    );

    await page.goto(`https://www.nseindia.com/option-chain?symbol=${symbol}`, {
      waitUntil: "networkidle2",
    });

    // Example scraping logic — replace with your actual selectors
    const data = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll(".opttbldata tr"));
      return rows.map(row => row.innerText);
    });

    res.json({ symbol, data });
  } catch (err) {
    console.error("❌ Scraping error:", err);
    res.status(500).json({ error: err.toString() });
  } finally {
    if (browser) await browser.close();
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
