import { GoogleGenAI } from "@google/genai";
//import { config } from "process";
const ai = new GoogleGenAI({ apiKey:"" });

async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "As a chatbot how you can help me in practice",
    config: {
      systemInstruction: "you are a teacher who teach people how to crack interview and and how to do Group discussion and how to good and communication and pronounciation. And tech them how to communicate effectively in front of people.Teaching them some practical things.",
    },
  });
  console.log(response.text);
}

main();
