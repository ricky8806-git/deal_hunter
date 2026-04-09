export async function GET() {
  const key = process.env.GEMINI_API_KEY;

  if (!key) {
    return Response.json({ status: "NO_KEY", message: "GEMINI_API_KEY is not set in this deployment" });
  }

  const maskedKey = key.slice(0, 8) + "..." + key.slice(-4);

  const prompt = `You are a credit card rewards researcher. Look up the standard permanent baseline rewards for the "Chase Prime Signature" credit card.

Return ONLY a JSON object with exactly these fields, no markdown, no code fences, no explanation:
{"matchedCardName":"official card name","issuer":"issuer name","rewardType":"cashback or points","baseEarnRate":0.01,"categoryEarnRates":{"dining":0.03},"pointToCashValue":0.01,"note":"brief note"}

Rules:
- baseEarnRate: decimal fraction of spend earned as cash equivalent (e.g. 0.02 = 2%)
- categoryEarnRates keys must be one of: dining, travel, groceries, gas, retail, entertainment, streaming, pharmacy, general
- Only standard permanent rewards — no signup bonuses, rotating categories, temporary promotions
- If the card is not found or data is unreliable, return the word: null`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "(no text)";
    return Response.json({ status: "OK", key: maskedKey, rawText: text, fullResponse: data });
  } catch (e) {
    return Response.json({ status: "NETWORK_ERROR", key: maskedKey, error: String(e) });
  }
}
