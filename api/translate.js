export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  const apiKey = process.env.DEEPL_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'DeepL API Key not configured' });
  }

  // DeepL API endpoints
  // DeepL Free API: api-free.deepl.com
  // DeepL Pro API: api.deepl.com
  // Since the user key ends with :fx, it's a Free API key.
  const isFreeKey = apiKey.endsWith(':fx');
  const apiUrl = isFreeKey ? 'https://api-free.deepl.com/v2/translate' : 'https://api.deepl.com/v2/translate';

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: [text],
        target_lang: 'UK', // Ukrainian
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('DeepL API Error:', errorData);
      return res.status(response.status).json({ error: 'DeepL API error' });
    }

    const data = await response.json();
    return res.status(200).json({ translation: data.translations[0].text });
  } catch (error) {
    console.error('Translation server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
