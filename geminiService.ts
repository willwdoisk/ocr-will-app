import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

// USANDO O NOME COMPLETO COM PREFIXO
const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });

export async function performOCR(base64: string): Promise<string> {
  if (!API_KEY) return "Erro: Chave API não encontrada.";

  try {
    const base64Data = base64.includes(",") ? base64.split(",")[1] : base64;
    
    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Data,
          mimeType: "image/png"
        }
      },
      { text: "Extraia o texto desta imagem." }
    ]);

    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error("Erro detalhado:", error);
    return "Erro ao processar imagem. Verifique o console.";
  }
}

export async function translateText(text: string, lang = "Português"): Promise<string> {
  try {
    const result = await model.generateContent(`Traduza para ${lang}: ${text}`);
    const response = await result.response;
    return response.text();
  } catch (error) {
    return text;
  }
}