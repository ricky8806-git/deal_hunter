export async function GET() {
  const key = process.env.GEMINI_API_KEY;

  if (!key) {
    return Response.json({ status: "NO_KEY", message: "GEMINI_API_KEY is not set in this deployment" });
  }

  const maskedKey = key.slice(0, 8) + "..." + key.slice(-4);

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Return only this exact JSON: {"ok":true}' }] }],
        }),
      }
    );
    const raw = await res.text();
    if (!res.ok) {
      return Response.json({ status: "GEMINI_ERROR", key: maskedKey, httpStatus: res.status, response: raw });
    }
    return Response.json({ status: "OK", key: maskedKey, response: raw.slice(0, 300) });
  } catch (e) {
    return Response.json({ status: "NETWORK_ERROR", key: maskedKey, error: String(e) });
  }
}
