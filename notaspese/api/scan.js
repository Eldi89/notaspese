// Serverless function (Vercel). Keeps the API key secret on the server.
// The key is read from the environment variable ANTHROPIC_API_KEY,
// which you set in the Vercel dashboard (NOT in the code).

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API key non configurata sul server." });
  }

  try {
    const { image, mediaType } = req.body;
    if (!image) return res.status(400).json({ error: "Nessuna immagine ricevuta." });

    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: mediaType || "image/jpeg", data: image } },
              {
                type: "text",
                text: `Sei un assistente contabile. Analizza questa ricevuta ed estrai i dati. Rispondi SOLO con JSON valido (nessun markdown):
{"data":"YYYY-MM-DD o vuoto","luogo":"nome posto","importo":"numero senza simbolo es 45.50","valuta":"USD/EUR/ecc","note":"dettagli utili"}
Campi non rilevabili = stringa vuota.`,
              },
            ],
          },
        ],
      }),
    });

    const data = await r.json();
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: "Errore durante la lettura della ricevuta." });
  }
}
