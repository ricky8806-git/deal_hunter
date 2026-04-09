export async function GET() {
  const key = process.env.GEMINI_API_KEY;

  if (!key) {
    return Response.json({ status: "NO_KEY", message: "GEMINI_API_KEY is not set in this deployment" });
  }

  const maskedKey = key.slice(0, 8) + "..." + key.slice(-4);

  // List available models for this key
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`
    );
    const data = await res.json();
    const names = (data.models ?? []).map((m: { name: string }) => m.name);
    return Response.json({ status: "MODEL_LIST", key: maskedKey, availableModels: names });
  } catch (e) {
    return Response.json({ status: "NETWORK_ERROR", key: maskedKey, error: String(e) });
  }
}
