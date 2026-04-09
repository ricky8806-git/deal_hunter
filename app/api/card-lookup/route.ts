const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const PROMPT = (issuer: string, cardName: string) => `You are a credit card rewards researcher. A user entered "${issuer} ${cardName}" as their credit card. This may be an informal, abbreviated, or misspelled name.

Your job: identify the most likely real credit card this refers to, and return its standard permanent baseline rewards.

Return ONLY a JSON object with exactly these fields, no markdown, no code fences, no explanation:
{"matchedCardName":"official card name","issuer":"issuer name","rewardType":"cashback or points","baseEarnRate":0.01,"categoryEarnRates":{"dining":0.03},"pointToCashValue":0.01,"note":"brief note"}

Rules:
- Make your best guess even if the name is informal — e.g. "Chase Prime Signature" likely refers to the Amazon Prime Rewards Visa Signature by Chase
- baseEarnRate: decimal fraction of spend earned as cash equivalent (e.g. 0.02 = 2%)
- categoryEarnRates keys must be one of: dining, travel, groceries, gas, retail, entertainment, streaming, pharmacy, general
- Only standard permanent rewards — no signup bonuses, rotating categories, temporary promotions
- Only return null if you have absolutely no idea what card this could be`;

/** Extract the outermost JSON object from a string that may contain extra text */
function extractJson(text: string): string | null {
  const start = text.indexOf("{");
  if (start === -1) return null;
  let depth = 0;
  for (let i = start; i < text.length; i++) {
    if (text[i] === "{") depth++;
    else if (text[i] === "}") {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return null;
}

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
      }),
    });
  } catch {
    return Response.json({ error: "Failed to reach Gemini API" }, { status: 502 });
  }

  if (!geminiRes.ok) {
    const errBody = await geminiRes.text();
    return Response.json(
      { error: `Gemini API error ${geminiRes.status}`, detail: errBody },
      { status: 502 }
    );
  }

  const data = await geminiRes.json();
  const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  if (text.trim() === "null") return Response.json(null);

  const jsonStr = extractJson(text);
  if (!jsonStr) {
    return Response.json({ error: "No JSON in Gemini response", raw: text.slice(0, 300) }, { status: 502 });
  }

  try {
    const parsed = JSON.parse(jsonStr);
    return Response.json(parsed);
  } catch {
    return Response.json({ error: "Failed to parse Gemini JSON", raw: jsonStr.slice(0, 300) }, { status: 502 });
  }
}
