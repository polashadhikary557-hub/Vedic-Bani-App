export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { topic } = req.body;
  const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : null;

  if (!apiKey) {
    return res.status(500).json({ result: "ত্রুটি: Vercel-এ GEMINI_API_KEY পাওয়া যায়নি।" });
  }

  const prompt = `You are a professional Bengali YouTube strategist. Produce a complete production package in Bengali for a 10-12 minute video on: "${topic}". Include:
1. High-retention 15-second opening hook.
2. Full spoken Bengali script with timestamps ([00:00-01:00], [01:00-04:00], [04:00-08:00], [08:00-10:30], [10:30-12:00]) and [B-Roll cues].
3. 3 Thumbnail ideas with English AI image prompts.
4. 3 Titles, SEO Description with timestamps, and 25 tags.`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(200).json({ result: `গুগল এপিআই এরর: ${data.error.message}` });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return res.status(200).json({ result: "গুগল থেকে কোনো উত্তর আসেনি। দয়া করে অন্য বিষয়ে চেষ্টা করুন।" });
    }

    return res.status(200).json({ result: text });
  } catch (err) {
    return res.status(500).json({ result: `সার্ভার এরর: ${err.message}` });
  }
}
