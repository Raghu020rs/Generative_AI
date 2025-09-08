import { GoogleGenAI } from "@google/genai";
//import { config } from "process";
const ai = new GoogleGenAI({ apiKey:"AIzaSyBnb2w6rzHChFX7h0BE-YDSb_1rBwtxm8o" });

async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash", 
    contents:  "I am a diabetic patient ",
    config: {
      systemInstruction: "You have to behave like a medicine adherence ai ",
    },
  });
  console.log(response.text);
}

main();
