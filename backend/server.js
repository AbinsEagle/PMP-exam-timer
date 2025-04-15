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
  const count = parseInt(req.body.count || 5);

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "user",
        content: `Generate ${count} PMP-style multiple-choice questions with options A to D, and return them in this JSON format: 

{
  "questions": [
    {
      "question": "Question text?",
      "options": ["A. Option A", "B. Option B", "C. Option C", "D. Option D"],
      "answer": "B",
      "rationale": "Short explanation why B is correct.",
      "eco_task": "Related ECO Task"
    }
  ]
}`,
      },
    ],
  });

  try {
    const content = response.choices[0].message.content;
    const json = JSON.parse(content);
    res.json(json);
  } catch (err) {
    console.error("Error parsing GPT response:", err.message);
    res.status(500).json({ error: "Failed to parse OpenAI response." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
