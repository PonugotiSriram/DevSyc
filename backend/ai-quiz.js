import axios from "axios";
import * as dotenv from "dotenv";
import { jsonrepair } from "jsonrepair";
dotenv.config();

const API_KEY = process.env.ApiKey || process.env.GROQ_API_KEY || "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";

export async function generateQuiz(subjects, difficulty) {
  const prompt = `You are a technical interviewer. Generate 5 multiple-choice questions for:
Subject: ${subjects || "Java OOP"}
Difficulty: ${difficulty || "Medium"}

Return ONLY a pure JSON array of 5 objects with no extra text or markdown:
[
  {
    "question": "question text",
    "options": ["opt1", "opt2", "opt3", "opt4"],
    "correctOption": 0,
    "explanation": "why this is correct"
  }
]`;

  try {
    const res = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "qwen/qwen3.8-27b",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );

    let raw = res.data.choices[0]?.message?.content || "";
    raw = raw.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(jsonrepair(raw));
    const questions = Array.isArray(parsed) ? parsed : (parsed.questions || []);

    if (!questions.length) throw new Error("Empty questions array returned");
    return questions;
  } catch (err) {
    console.error("Direct Groq Call Failed:", err.response?.data || err.message);
    throw err;
  }
}
