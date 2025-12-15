export default async function handler(req, res) {
  // ===== CORS =====
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (!req.body) {
      return res.status(400).json({ error: 'EMPTY_BODY' });
    }

    // Vercel 里 body 可能是 string
    const body =
      typeof req.body === 'string'
        ? JSON.parse(req.body)
        : req.body;

    console.log('📦 BODY:', body);

    const notionRes = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const text = await notionRes.text();

    if (!notionRes.ok) {
      console.error('❌ Notion API Error:', text);
      return res.status(notionRes.status).send(text);
    }

    return res.status(200).send(text);
  }
  catch (e) {
    console.error('🔥 FUNCTION CRASH:', e);
    return res.status(500).json({
      error: 'FUNCTION_CRASH',
      message: e.message
    });
  }
}
