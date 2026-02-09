import { GoogleGenerativeAI } from "@google/generative-ai";

// Pega a chave das variáveis de ambiente do Vite
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

export async function performOCR(base64: string): Promise<string> {
  // Alerta de depuração: se a chave estiver vazia, o erro é no Netlify
  if (!API_KEY) {
    console.error("ERRO: A VITE_GEMINI_API_KEY não foi encontrada nas variáveis de ambiente.");
    return "Erro de configuração: Chave API não encontrada no servidor.";
  }

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    // Limpa o base64 (remove o cabeçalho data:image/jpeg;base64,)
    const base64Data = base64.includes(",") ? base64.split(",")[1] : base64;

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Data,
          mimeType: "image/jpeg"
        }
      },
      { text: "Extraia apenas o texto desta imagem, sem comentários adicionais." },
    ]);

    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error("Erro detalhado no Gemini:", error);
    // Se o erro for 403 ou 400, geralmente é a chave
    if (error.message?.includes("403") || error.message?.includes("API key")) {
      return "Erro: Chave de API inválida ou sem permissão.";
    }
    return "Erro ao processar imagem. Tente novamente.";
  }
}

export async function translateText(text: string, targetLang: string): Promise<string> {
  if (!API_KEY) return "Erro: Chave não configurada.";
  
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    const result = await model.generateContent(`Traduza para ${targetLang}: ${text}`);
    const response = await result.response;
    return response.text();
  } catch (error) {
    return "Erro na tradução.";
  }
}