// api/generate-questions.js
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const total = parseInt(req.body.count || 5);

  const prompt = `
Generate ${total} PMP exam-style multiple choice questions STRICTLY based on the PMI Examination Content Outline (ECO).
Also include ONE fresh, real-world PMP insight or project management trend based on recent events, news, or professional discussions.

Respond ONLY in this JSON format:
{
  "insight": "Your dynamic PMP insight here",
  "questions": [
    {
      "question": "Sample question text...",
      "options": ["A. Option A", "B. Option B", "C. Option C", "D. Option D"],
      "answer": "B",
      "rationale": "Why this is the right answer...",
      "eco_task": "Task name from the ECO"
    }
  ]
}
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a PMP trainer AI. Follow the PMI ECO guidelines strictly.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = completion.choices[0].message.content;

    try {
      const parsed = JSON.parse(content);
      return res.status(200).json(parsed);
    } catch (err) {
      console.error("❌ JSON Parse Error:", err.message);
      return res.status(500).json({ error: "Invalid response format from GPT." });
    }
  } catch (err) {
    console.error("❌ OpenAI Error:", err.message);
    return res.status(500).json({ error: "Failed to fetch questions or insight." });
  }
}
