export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  // ✅ Step 1: 立刻回應 LINE 200 OK，避免 timeout
  res.status(200).send("OK");

  // ✅ Step 2: 背後非同步轉送 webhook 到 Google Apps Script
  const scriptUrl = process.env.APPS_SCRIPT_URL;

  try {
    const forward = await fetch(scriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    const result = await forward.text();
    console.log("✅ Forwarded to Apps Script:", result);
  } catch (err) {
    console.error("❌ Forward Failed:", err);
  }
}
