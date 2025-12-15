import type { VercelRequest, VercelResponse } from 'vercel';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // ===== CORS =====
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // ===== 预检请求 =====
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (!req.body) {
      return res.status(400).json({ error: 'Empty body' });
    }

    // 🔥 关键修复点：确保是对象
    const body =
      typeof req.body === 'string'
        ? JSON.parse(req.body)
        : req.body;

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

    // 🔥 Notion 报错时直接透传，方便你调试
    if (!notionRes.ok) {
      return res.status(notionRes.status).json({
        error: 'Notion API error',
        detail: text
      });
    }

    return res.status(200).json(JSON.parse(text));
  }
  catch (e: any) {
    console.error('🔥 Function error:', e);
    return res.status(500).json({
      error: 'FUNCTION_ERROR',
      message: e.message
    });
  }
}
