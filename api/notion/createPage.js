import type { VercelRequest, VercelResponse } from 'vercel';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // ===== CORS =====
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const rawBody = req.body;

    if (!rawBody) {
      return res.status(400).json({ error: 'EMPTY_BODY' });
    }

    const body =
      typeof rawBody === 'string'
        ? JSON.parse(rawBody)
        : rawBody;

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
      console.error('❌ Notion Error:', text);
      return res.status(notionRes.status).send(text);
    }

    return res.status(200).send(text);
  }
  catch (e: any) {
    console.error('🔥 FUNCTION CRASH:', e);
    return res.status(500).json({
      error: 'FUNCTION_CRASH',
      message: e.message,
      stack: e.stack
    });
  }
}
