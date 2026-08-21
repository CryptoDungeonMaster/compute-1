const OPENROUTER_URL = "https://openrouter.ai/api/v1";
const RATE_WINDOW_MS = 10 * 60_000;
const RATE_LIMIT = 3;
const requests = new Map<string, number[]>();

export function allowAiRequest(key: string) {
  const now = Date.now();
  const recent = (requests.get(key) || []).filter((time) => now - time < RATE_WINDOW_MS);
  if (recent.length >= RATE_LIMIT) return false;
  recent.push(now);
  requests.set(key, recent);
  return true;
}

export async function generateCode(prompt: string) {
  return openRouter("/chat/completions", {
    model: process.env.OPENROUTER_CODE_MODEL || "openrouter/auto",
    messages: [
      { role: "system", content: "You are ComputeFi Code Creator. Return production-ready code in fenced blocks followed by concise run instructions. Do not claim to have edited files." },
      { role: "user", content: prompt },
    ],
  }).then((data) => String(data.choices?.[0]?.message?.content || ""));
}

export async function generateImage(prompt: string) {
  return openRouter("/images", {
    model: process.env.OPENROUTER_IMAGE_MODEL || "google/gemini-2.5-flash-image",
    prompt,
    n: 1,
  }).then((data) => {
    const image = data.data?.[0];
    if (!image?.b64_json) throw new Error("Image provider returned no image data.");
    return { dataUrl: `data:${image.media_type || "image/png"};base64,${image.b64_json}`, cost: data.usage?.cost };
  });
}

async function openRouter(path: string, body: Record<string, unknown>) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("ComputeFi AI is not configured yet.");
  const response = await fetch(`${OPENROUTER_URL}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://computefi.fun",
      "X-Title": "ComputeFi",
    },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error?.message || data.error || "ComputeFi AI request failed.");
  return data;
}
