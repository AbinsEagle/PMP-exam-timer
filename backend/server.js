import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { OpenAI } from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const domainWeights = {
  People: 0.42,
  Process: 0.50,
  "Business Environment": 0.08,
};

function getQuestionDistribution(total) {
  const people = Math.round(total * domainWeights["People"]);
  const process = Math.round(total * domainWeights["Process"]);
  const business = total - people - process;
  return { people, process, business };
}

app.post("/generate-questions", async (req, res) => {
  const total = parseInt(req.body.count || 5);
  const { people, process, business } = getQuestionDistribution(total);

  const domainRequests = [
    { domain: "People", count: people },
    { domain: "Process", count: process },
    { domain: "Business Environment", count: business },
  ];

  let allQuestions = [];

  try {
    for (const req of domainRequests) {
      if (req.count <= 0) continue;

      const prompt = `
You are a PMP exam question generator. Create ${req.count} unique and realistic PMP multiple-choice questions based on the '${req.domain}' domain as defined in the PMI Examination Content Outline (2021).

Each question must:
- Focus only on '${req.domain}' tasks from the ECO
- Be situational and decision-based, not factual recall
- Use official PMI language and tone
- Include 4 distinct options (A, B, C, D)
- Mark exactly one correct answer

Respond with a JSON array in this format:

[
  {
    "question": "What should the project manager do FIRST when a stakeholder reports a scope concern?",
    "options": [
      "A. Update the risk register",
      "B. Consult the stakeholder register",
      "C. Review the scope management plan",
      "D. Initiate change control"
    ],
    "answer": "C"
  }
]

Only return the JSON array. Do not include any extra commentary or formatting.
`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a certified PMP exam simulator that strictly follows the official PMI ECO document.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const parsed = JSON.parse(completion.choices[0].message.content);
      allQuestions = [...allQuestions, ...parsed];
    }

    res.json(allQuestions);
  } catch (err) {
    console.error("❌ Error generating questions:", err.message);
    res.status(500).json({ error: "Failed to generate PMP questions." });
  }
});

app.listen(3000, () => {
  console.log("🚀 PMP API live on port 3000");
});
