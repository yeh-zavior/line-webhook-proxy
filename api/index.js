export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

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
    return res.status(200).send("OK");
  } catch (err) {
    console.error("❌ Forward Failed:", err);
    return res.status(500).send("Webhook Forward Failed");
  }
}

