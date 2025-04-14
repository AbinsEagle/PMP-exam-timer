import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { OpenAI } from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get("/", (req, res) => {
  res.send("✅ PMP Question Generator API is running!");
});

app.post("/generate-questions", async (req, res) => {
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

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (err) {
      console.error("❌ JSON Parse Error:", err.message);
      return res.status(500).json({ error: "Invalid response format from GPT." });
    }

    return res.json(parsed);
  } catch (err) {
    console.error("❌ OpenAI Error:", err.message);
    return res.status(500).json({ error: "Failed to fetch questions or insight." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 PMP backend server running on port ${PORT}`);
});
