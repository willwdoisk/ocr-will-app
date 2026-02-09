import { GoogleGenerativeAI } from "@google/generative-ai";

// COLOQUE SUA CHAVE NOVA AQUI
const API_KEY = "SUA_CHAVE_AQUI"; 
const genAI = new GoogleGenerativeAI(API_KEY);

async function testOCR() {
  // Removemos o timeout daqui para não dar erro
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash"
  });

  const prompt = "Responda apenas com a palavra: FUNCIONOU";

  try {
    console.log("Chamando API...");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log("Resposta da Gemini:", text);
  } catch (error) {
    console.error("Erro ao chamar Gemini:", error);
  }
}

testOCR();