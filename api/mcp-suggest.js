module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server missing OPENAI_API_KEY' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const provider = (body.provider || 'linear').toString();
    const prompt = (body.prompt || 'Ship one concrete improvement').toString();

    const system = [
      'You generate one short, concrete engineering execution task.',
      'Style: imperative, specific, can be done in <=45 minutes.',
      'Return ONLY the task sentence, no bullets, no extra commentary.'
    ].join(' ');

    const user = `Provider: ${provider}\nPrompt/context: ${prompt}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.4,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user }
        ],
        max_tokens: 70
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(502).json({ error: 'OpenAI request failed', details: errText.slice(0, 500) });
    }

    const data = await response.json();
    const suggestion = data?.choices?.[0]?.message?.content?.trim();

    if (!suggestion) {
      return res.status(502).json({ error: 'No suggestion generated' });
    }

    return res.status(200).json({ suggestion });
  } catch (error) {
    return res.status(500).json({ error: 'Unexpected server error', details: error?.message || String(error) });
  }
};
