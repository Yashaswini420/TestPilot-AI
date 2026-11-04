const res = await fetch(process.env.LLM_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.LLM_API_KEY}`,
  },
  body: JSON.stringify({
    model: process.env.LLM_MODEL,
    temperature: 0,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'user', content: 'Reply with JSON only: {"action":"click","id":3}' },
    ],
  }),
});

console.log('Status:', res.status);
const data = await res.json();
console.log(data.choices?.[0]?.message?.content ?? data);