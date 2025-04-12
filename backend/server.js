import express from "express";
import cors from "cors";
import { Configuration, OpenAIApi } from "openai";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.post("/generate-questions", async (req, res) => {
  const prompt = `
Generate ${req.body.count || 10} PMP exam questions. Return as JSON:
[
  {
    "question": "...",
    "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
    "answer": "B"
  }
]
`;

  try {
    const chat = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7
    });

    const content = chat.data.choices[0].message.content;
    const questions = JSON.parse(content);
    res.json(questions);
  } catch (err) {
    console.error("OpenAI Error:", err.message);
    res.status(500).json({ error: "Failed to generate questions" });
  }
});

app.listen(5000, () => {
  console.log("✅ Backend running on http://localhost:5000");
});
