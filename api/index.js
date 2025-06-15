// index.js - LINE webhook proxy server for Vercel

const crypto = require("crypto");
const fetch = require("node-fetch");

module.exports = async (req, res) => {
  // Step 1: Validate method
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  // Step 2: Validate LINE signature
  const body = await getRawBody(req);
  const signature = req.headers["x-line-signature"];
  const secret = process.env.LINE_CHANNEL_SECRET;
  const hash = crypto.createHmac("sha256", secret).update(body).digest("base64");

  if (hash !== signature) {
    return res.status(401).send("Unauthorized - Invalid signature");
  }

  // Step 3: Immediately respond to LINE
  res.status(200).send("OK");

  // Step 4: Forward webhook to Apps Script
  try {
    await fetch("https://script.google.com/macros/s/AKfycbyLLrH6EuC6uNid5Ye_pNYV0JkLmwEN3voZEqyLWY5Akvlgxmw_4bX7mgw4AuocyMxS/exec", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: `payload=${encodeURIComponent(body)}`
    });
  } catch (err) {
    console.error("Forwarding failed", err);
  }
};

function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", chunk => (data += chunk));
    req.on("end", () => resolve(data));
    req.on("error", err => reject(err));
  });
}
