import { GoogleGenerativeAI } from "@google/generative-ai";

export const getMedicalAdvice = async (symptom) => {
  if (!symptom) return ["Please describe your symptoms"];

  try {
    const genAI = new GoogleGenerativeAI(AIzaSyCPrH4D9ZCaECa1djVPhUzqIqP8lr9QIxI);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const prompt = `
User Symptom: "${symptom}"
1. Identify the likely medical issue.
2. Suggest basic medicine (with name and dosage).
3. Mention when to consult a doctor.

Respond in JSON format like:
{
  "condition": "Migraine",
  "medicines": [
    { "name": "Paracetamol", "dosage": "500mg", "type": "tablet" }
  ],
  "advice": "Consult a doctor if pain persists after 2 doses."
}`;

    const result = await model.generateContent(prompt);
    const data = JSON.parse(result.response.text());
    return data;
  } catch (err) {
    console.error("Medical advice error:", err);
    return { error: "Something went wrong. Try again." };
  }
}; 