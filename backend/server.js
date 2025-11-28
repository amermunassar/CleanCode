import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

console.log("API:", process.env.OPENAI_API_KEY);
console.log("PROJECT:", process.env.OPENAI_PROJECT_ID);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  project: process.env.OPENAI_PROJECT_ID,
});

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("CleanCode API is running");
});

app.post("/api/clean", async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: "No code provided" });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "You clean code. You improve formatting, readability, and style. DO NOT change logic. DO NOT backtick the code in your response.",
        },
        {
          role: "user",
          content: code,
        },
      ],
    });

    res.json({ cleanedCode: completion.choices[0].message.content });
  } catch (error) {
    console.error("API error:", error);
    res.status(500).json({ error: "AI request failed" });
  }
});

app.listen(3000, () => console.log("Server running on 3000"));
