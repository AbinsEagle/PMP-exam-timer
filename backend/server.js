const express = require("express");
const cors = require("cors");
const { Configuration, OpenAIApi } = require("openai");

const app = express();
app.use(cors());
app.use(express.json());

const configuration = new Configuration({
  apiKey: "sk-REPLACE_WITH_YOUR_OPENAI_KEY" // Replace this with your actual key
});
const openai = new OpenAIApi(configuration);

app.post("/generate-questions", async (req, res) => {
  const prompt = `
Generate 10 PMP exam questions with 4 options (A-D) and the correct answer.
Return in this JSON format:
[
  {
    "question": "....",
    "options": {
      "A": "...",
      "B": "...",
      "C": "...",
      "D": "..."
    },
    "answer": "B"
  }
]
`;

  try {
    const response = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }]
    });

    const content = response.data.choices[0].message.content;
    const json = JSON.parse(content);
    res.json(json);
  } catch (err) {
    console.error(\"OpenAI Error:\", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => console.log(\"🔥 Backend running at http://localhost:5000\"));

