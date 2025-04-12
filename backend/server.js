const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/generate-questions", async (req, res) => {
  const count = req.body.count || 10;
  const prompt = `
Generate ${count} PMP exam questions with 4 options (A-D) and the correct answer.
Return in JSON format like:
[
  {
    "question": "...",
    "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
    "answer": "B"
  }
]
`;

  try {
    const chat = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const content = chat.choices[0].message.content;
    const data = JSON.parse(content);
    res.json(data);
  } catch (err) {
    console.error("OpenAI Error:", err.message);
    res.status(500).json({ error: "Failed to generate questions" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server ready on port ${PORT}`));
