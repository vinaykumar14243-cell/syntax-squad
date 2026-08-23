import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function run() {
  try {
    const res = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: 'Say hi in JSON format: { "message": "Hi" }',
      config: {
        responseMimeType: 'application/json'
      }
    });
    console.log(res.text);
  } catch (e) { console.error(e); }
}
run();
