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
    const prompt = (body.prompt || 'Build a todo app widget').toString();

    const system = [
      'Return JSON only with keys: theme and sourceCode.',
      'theme must be "default" or "pink".',
      'sourceCode must be valid JavaScript that defines globalThis.__pixelWidgetFactory = ({ state, setState, prompt }) => HTMLElement.',
      'Do not use imports, fetch, eval, or Function constructor inside sourceCode.',
      'Prefer plain DOM APIs and safe deterministic behavior.',
      'Widget should support Planning/Active/Done lanes and adding new tasks.'
    ].join(' ');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1200
      })
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(502).json({ error: 'OpenAI request failed', details: err.slice(0, 400) });
    }

    const data = await response.json();
    const raw = data?.choices?.[0]?.message?.content?.trim() || '{}';

    let parsed = {};
    try { parsed = JSON.parse(raw); } catch {
      return res.status(502).json({ error: 'LLM returned invalid JSON' });
    }

    const theme = parsed.theme === 'pink' ? 'pink' : 'default';
    const sourceCode = typeof parsed.sourceCode === 'string' ? parsed.sourceCode : '';

    if (!sourceCode.includes('__pixelWidgetFactory')) {
      return res.status(502).json({ error: 'LLM source missing __pixelWidgetFactory' });
    }

    return res.status(200).json({ theme, sourceCode });
  } catch (error) {
    return res.status(500).json({ error: 'Unexpected server error', details: error?.message || String(error) });
  }
};
