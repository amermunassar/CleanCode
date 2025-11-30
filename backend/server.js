import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

// Load environment variables (OPENAI_API_KEY, OPENAI_PROJECT_ID, etc.)
dotenv.config();

console.log("API KEY:", process.env.OPENAI_API_KEY ? "Loaded" : "Missing");
console.log("PROJECT ID:", process.env.OPENAI_PROJECT_ID || "Not set");

// Create OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  project: process.env.OPENAI_PROJECT_ID,
});

const app = express();

app.use(cors());

app.use(express.json());

/**
 * getSystemPrompt(task)
 * Returns a system prompt that tells the model what kind of cleaning to do,
 * based on the selected task from the dropdown: "format", "optimize", "debug", "all".
 */
function getSystemPrompt(task) {
  switch (task) {
    case "format":
      // Format only: change whitespace/indentation, nothing else
      return `
You clean code. You only improve formatting and indentation.
- Fix indentation, spacing, and line breaks.
- Do NOT change any variable names, function names, comments, or logic.
- Do NOT add or remove any code.
- Do NOT add explanations.
- Do NOT wrap the code in backticks or any markdown.
Return ONLY the formatted code.
      `.trim();

    case "optimize":
  return `
You are a code optimizer. Your goal is to improve the efficiency of the code without changing what it does.

Optimization rules:
- You may simplify logic, remove redundancy, reduce repetition, and streamline control flow.
- You may reduce unnecessary operations, eliminate dead code, or replace inefficient patterns.
- You may improve naming only if it makes the code clearer AND does not change the external behavior.
- The optimized code must run faster, use fewer resources, or be more compact.
- You must NOT modify the program's behavior or produce a different output.
- You must NOT add new features.
- You must NOT wrap the code in backticks or markdown.
- Do NOT explain your changes.

Return ONLY the optimized code.
`.trim();


    case "debug":
      // Fix bugs, keep original intent
      return `
You debug code. You fix bugs while preserving the original intent of the code.
- Fix syntax errors and clear logical mistakes.
- Do NOT add new features or change the overall purpose of the code.
- If something is ambiguous, choose the simplest reasonable fix.
- Do NOT wrap the code in backticks or any markdown.
- Do NOT add explanations.
Return ONLY the corrected code.
      `.trim();

    case "all":
  return `
You are a full code refiner. Perform formatting, optimization, and debugging in one pass.

Your responsibilities:

FORMATTING:
- Fix indentation, spacing, and inconsistent style.
- Make the code clean and readable.

OPTIMIZATION:
- Improve efficiency without changing behavior.
- Reduce redundancy, simplify logic, remove dead code, and eliminate unnecessary operations.
- Improve naming only when it increases clarity AND retains original meaning.
- Produce code that runs faster or uses fewer resources.

DEBUGGING:
- Fix syntax errors, obvious mistakes, and incorrect logic while preserving the author’s intent.
- Do not add features or modify the external behavior of the program.

RESTRICTIONS:
- The program’s functionality and output must remain the same.
- Do NOT introduce new features.
- Do NOT wrap the output in backticks or markdown.
- Do NOT explain your changes.

Return ONLY the cleaned, optimized, and corrected code.
`.trim();

  }
}

// Simple health-check route to confirm API is running
app.get("/", (req, res) => {
  res.send("CleanCode API is running");
});

// Main route: handle code cleaning
app.post("/api/clean", async (req, res) => {
  const { code, task } = req.body;

  // Validate that code is present
  if (!code) {
    return res.status(400).json({ error: "No code provided" });
  }

  // Default to "all" if somehow task is missing
  const mode = task || "all";
  const systemPrompt = getSystemPrompt(mode);

  try {
    // Call OpenAI Chat Completion API
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt, // behavior depends on the chosen task
        },
        {
          role: "user",
          content: code, // user message is just the raw code
        },
      ],
    });

    // Extract model's reply (the cleaned code)
    const cleaned = completion.choices[0]?.message?.content || "";

    return res.json({ cleanedCode: cleaned });
  } catch (error) {
    console.error("API error:", error);
    return res.status(500).json({ error: "AI request failed" });
  }
});

// Start the server on PORT from env or 3000 by default
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
