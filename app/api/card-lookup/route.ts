const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const PROMPT = (issuer: string, cardName: string) => `You are a credit card rewards researcher. Look up the standard permanent baseline rewards for the "${issuer} ${cardName}" credit card.

Return ONLY a JSON object with exactly these fields:
{
  "matchedCardName": "official card name",
  "issuer": "issuer name",
  "rewardType": "cashback" or "points",
  "baseEarnRate": <decimal fraction, e.g. 0.02 for 2%>,
  "categoryEarnRates": { "dining": 0.03, "travel": 0.02 },
  "pointToCashValue": <conservative dollars per point, e.g. 0.01>,
  "note": "brief one-line source note"
}

Rules:
- Only standard permanent rewards — no signup bonuses, rotating categories, or temporary promotions
- categoryEarnRates keys must be one of: dining, travel, groceries, gas, retail, entertainment, streaming, pharmacy, general
- pointToCashValue: use 0.01 for most rewards programs unless cash back is clearly different
- If the card is not found or data is unreliable, return null
- Return ONLY the JSON, no markdown, no explanation`;

export async function POST(request: Request) {
  if (!GEMINI_API_KEY) {
    return Response.json({ error: "GEMINI_API_KEY not configured" }, { status: 503 });
  }

  let issuer: string, cardName: string;
  try {
    ({ issuer, cardName } = await request.json());
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!issuer?.trim() || !cardName?.trim()) {
    return Response.json({ error: "issuer and cardName required" }, { status: 400 });
  }

  let geminiRes: Response;
  try {
    geminiRes = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: PROMPT(issuer.trim(), cardName.trim()) }] }],
        tools: [{ google_search: {} }],
      }),
    });
  } catch {
    return Response.json({ error: "Failed to reach Gemini API" }, { status: 502 });
  }

  if (!geminiRes.ok) {
    return Response.json({ error: `Gemini API error ${geminiRes.status}` }, { status: 502 });
  }

  const data = await geminiRes.json();
  const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  const match = text.match(/\{[\s\S]*?\}/);
  if (!match) {
    return Response.json({ error: "No structured data in Gemini response" }, { status: 502 });
  }

  try {
    const parsed = JSON.parse(match[0]);
    if (parsed === null) return Response.json(null);
    return Response.json(parsed);
  } catch {
    return Response.json({ error: "Failed to parse Gemini response" }, { status: 502 });
  }
}
