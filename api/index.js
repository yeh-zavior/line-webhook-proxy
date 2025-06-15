// index.js - LINE webhook proxy server for Vercel

const crypto = require("crypto");
const fetch = require("node-fetch");

module.exports = async (req, res) => {
  try {
    // Step 1: Validate method
    if (req.method !== "POST") {
      return res.status(405).send("Method Not Allowed");
    }

    // Step 2: Validate LINE signature
    const body = await getRawBody(req);
    const signature = req.headers["x-line-signature"];
    if (!signature) {
      console.error("Missing x-line-signature header");
      return res.status(400).send("Missing signature header");
    }

    const secret = process.env.LINE_CHANNEL_SECRET;
    if (!secret) {
      console.error("LINE_CHANNEL_SECRET is not set");
      return res.status(500).send("Server configuration error");
    }

    const hash = crypto.createHmac("sha256", secret).update(body).digest("base64");
    console.log("Computed signature:", hash);
    console.log("Received signature:", signature);
    if (hash !== signature) {
      console.error("Signature validation failed");
      return res.status(401).send("Unauthorized - Invalid signature");
    }

    // Step 3: Immediately respond to LINE
    res.status(200).send("OK");

    // Step 4: Forward webhook to Apps Script
    const response = await fetch(
      "https://script.google.com/macros/s/AKfycbyLLrH6EuC6uNid5Ye_pNYV0JkLmwEN3voZEqyLWY5Akvlgxmw_4bX7mgw4AuocyMxS/exec",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(JSON.parse(body))
      }
    );
    if (!response.ok) {
      console.error(`Forwarding failed with status: ${response.status}`);
    }
  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).send("Internal Server Error");
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
