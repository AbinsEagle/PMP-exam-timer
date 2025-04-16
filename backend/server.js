import dotenv from 'dotenv';
dotenv.config(); // Load environment variables from the .env file

import express from 'express';
import cors from 'cors';
import { OpenAI } from 'openai';

const app = express();

// Middleware to enable CORS and to parse JSON request bodies
app.use(cors());
app.use(express.json());

// Create an OpenAI client instance using the API key from your .env file
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Home route - confirms the API is running
app.get('/', (req, res) => {
  res.send("✅ PMP Question Generator API is running!");
});

// Endpoint to generate PMP-style multiple-choice questions
app.post('/generate-questions', async (req, res) => {
  // Parse the number of questions from the request body (defaulting to 5 if not provided)
  const count = parseInt(req.body.count, 10) || 5;
  
  // Craft the prompt for OpenAI
  const promptContent = `Generate ${count} PMP-style multiple-choice questions with options A to D, and return them in this JSON format: 

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
}`;

  try {
    // Call the OpenAI API with the prompt
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "user",
          content: promptContent,
        },
      ],
    });

    // Extract and parse the response content into JSON
    const content = response.choices[0].message.content;
    const jsonResponse = JSON.parse(content);
    res.json(jsonResponse);
  } catch (err) {
    console.error("Error parsing GPT response:", err.message);
    res.status(500).json({ error: "Failed to parse OpenAI response." });
  }
});

// Start the server on the specified port (default to 3000 if not set)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
