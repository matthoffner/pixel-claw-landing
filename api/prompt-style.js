module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Server missing OPENAI_API_KEY' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const prompt = (body.prompt || '').toString();

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0,
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'prompt_style',
            strict: true,
            schema: {
              type: 'object',
              additionalProperties: false,
              properties: {
                theme: { type: 'string', enum: ['default', 'pink'] }
              },
              required: ['theme']
            }
          }
        },
        messages: [
          {
            role: 'system',
            content:
              'Choose theme from enum only. Use pink when user intent clearly asks for pink/rose/fuchsia/magenta vibes. Otherwise default.'
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 30
      })
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(502).json({ error: 'OpenAI request failed', details: err.slice(0, 300) });
    }

    const data = await response.json();
    const raw = data?.choices?.[0]?.message?.content?.trim() || '{}';
    let parsed = {};
    try { parsed = JSON.parse(raw); } catch {}

    const theme = parsed.theme === 'pink' ? 'pink' : 'default';
    return res.status(200).json({ theme });
  } catch (error) {
    return res.status(500).json({ error: 'Unexpected server error', details: error?.message || String(error) });
  }
};
