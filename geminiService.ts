import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "models/text-bison-001" });

export async function performOCR(base64: string): Promise<string> {
  if (!API_KEY) {
    console.error("Chave API não configurada");
    return "Erro: chave API não configurada";
  }

  try {
    // Remove o cabeçalho data:image/png;base64, se existir
    const base64Data = base64.includes(",") ? base64.split(",")[1] : base64;

    // Prompt para extrair texto da imagem
    const prompt = [
      {
        inlineData: {
          data: base64Data,
          mimeType: "image/png" // ou "image/jpeg" conforme sua imagem
        }
      },
      { text: "Extraia o texto desta imagem e retorne somente o texto." }
    ];

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error("Erro no Gemini OCR:", error);
    if (error?.status === 403) return "Erro: chave API inválida ou sem permissão.";
    if (error?.status === 400) return "Erro: requisição inválida para a API.";
    return "Erro ao processar imagem. Tente novamente.";
  }
}