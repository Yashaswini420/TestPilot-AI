const API_URL = process.env.LLM_URL;
const MODEL = process.env.LLM_MODEL;
const API_KEY = process.env.LLM_API_KEY;

export async function askLLM(messages, attempt = 0) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0,
      max_completion_tokens: 1500,
      reasoning_effort: 'low',
      response_format: { type: 'json_object' },
    }),
  });

  if (res.status === 429 && attempt < 4) {
    await new Promise(r => setTimeout(r, 2000 * 2 ** attempt));
    return askLLM(messages, attempt + 1);
  }

  if (!res.ok) {
    throw new Error(`LLM API ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('LLM returned an empty reply');

  const cleaned = text.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error(`LLM reply was not valid JSON: ${cleaned.slice(0, 200)}`);
  }
}