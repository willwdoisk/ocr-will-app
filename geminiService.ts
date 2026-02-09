import { GoogleGenerativeAI } from "@google/generative-ai";

// Aqui está a mágica: ele vai ler a chave que você salvou no Netlify
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export async function performOCR(base64: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  // Limpa o cabeçalho do base64 se existir
  const base64Data = base64.includes(",") ? base64.split(",")[1] : base64;
  
  const prompt = "Extraia todo o texto desta imagem. Formate de maneira clara e organizada.";

  try {
    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64Data, mimeType: "image/jpeg" } }
    ]);
    return result.response.text();
  } catch (error) {
    console.error("Erro no Gemini:", error);
    return "Erro ao processar imagem. Tente um arquivo menor ou verifique a conexão.";
  }
}

export async function translateText(text: string, targetLang: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `Traduza o seguinte texto para ${targetLang}, mantendo o sentido original: ${text}`;
  
  const result = await model.generateContent(prompt);
  return result.response.text();
}