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

// Health check route
app.get("/", (req, res) => {
  res.send("✅ PMP backend is up and running!");
});

// Generate PMP questions
app.post("/generate-questions", async (req, res) => {
  const total = parseInt(req.body.count || 5);

  const prompt = `
You are a certified PMP trainer AI. 
Generate ${total} PMP exam-style multiple choice questions STRICTLY based on the latest PMI Examination Content Outline (ECO).

👉 Also, include ONE insightful, real-world project management fact/trend based on recent developments, tools, agile changes, or job market buzz — known to top 5% of PMs.

Return ONLY valid JSON with this structure:

{
  "insight": "A fresh PMP insight here...",
  "questions": [
    {
      "question": "Your question text here...",
      "options": ["A. Option A", "B. Option B", "C. Option C", "D. Option D"],
      "answer": "B",
      "rationale": "Explain why this is the best answer.",
      "eco_task": "Mapped ECO task from PMI content outline"
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
          content: "You are a PMP trainer AI who generates exam-level content strictly based on the latest PMI ECO and PMP best practices."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7
    });

    const messageContent = completion.choices[0].message.content;

    try {
      const parsed = JSON.parse(messageContent);
      if (!parsed.questions || !Array.isArray(parsed.questions)) {
        throw new Error("Invalid format: questions array missing");
      }
      res.json(parsed);
    } catch (err) {
      console.error("❌ Failed to parse GPT JSON:", err.message);
      res.status(500).json({ error: "Invalid GPT response format" });
    }

  } catch (err) {
    console.error("❌ OpenAI API error:", err.message);
    res.status(500).json({ error: "Failed to fetch questions or insight from OpenAI" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 PMP backend server running on port ${PORT}`);
});
