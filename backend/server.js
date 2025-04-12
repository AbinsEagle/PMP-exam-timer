// server.js (your backend)
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post('/generate-questions', async (req, res) => {
  const { count } = req.body;

  if (!count || typeof count !== 'number') {
    return res.status(400).json({ error: 'Invalid count provided.' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a PMP exam question generator. Generate ONLY JSON with no explanation. Format: [{"question":"...","options":["A","B","C","D"],"answer":"A"}]'
        },
        {
          role: 'user',
          content: `Generate ${count} PMP exam questions in JSON array format.`
        }
      ],
      temperature: 0.7
    });

    const content = completion.choices[0].message.content;
    const questions = JSON.parse(content);
    res.json(questions);
  } catch (err) {
    console.error('OpenAI Error:', err);
    res.status(500).json({ error: 'Failed to generate questions from OpenAI' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
