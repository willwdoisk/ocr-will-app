import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

// DEBUG: presença e comprimento da chave
console.log("DEBUG: VITE_GEMINI_API_KEY presente?", !!API_KEY, "comprimento:", API_KEY ? API_KEY.length : 0);

const genAI = new GoogleGenerativeAI(API_KEY);
// MUDANÇA AQUI: Usando o modelo gemini-1.5-flash que é o mais atual e estável
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

function cleanBase64(dataUrlOrBase64: string) {
  const withoutHeader = dataUrlOrBase64.includes(",") ? dataUrlOrBase64.split(",")[1] : dataUrlOrBase64;
  return withoutHeader.replace(/\s/g, "");
}

export async function performOCR(base64: string): Promise<string> {
  console.log("DEBUG: performOCR chamado com gemini-1.5-flash");

  if (!API_KEY) {
    return "Erro: chave API não configurada";
  }

  try {
    const cleaned = cleanBase64(base64);
    const mimeType = base64.startsWith("data:image/jpeg") || base64.startsWith("/9j/") ? "image/jpeg" : "image/png";

    const prompt = [
      {
        inlineData: {
          data: cleaned,
          mimeType
        }
      },
      {
        text: "Extraia todo o texto desta imagem. Retorne apenas o texto encontrado, sem explicações."
      }
    ];

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log("DEBUG: OCR Sucesso!");
    return text;
  } catch (error: any) {
    console.error("DEBUG: Erro no Gemini OCR:", error);
    const status = error?.status || error?.code;
    if (status === 404) return "Erro: Modelo não encontrado. Tentando ajustar...";
    return "Erro ao processar imagem. Tente novamente.";
  }
}

export async function translateText(inputText: string, targetLanguage = "Português"): Promise<string> {
  try {
    const prompt = `Traduza o texto a seguir para ${targetLanguage}. Retorne apenas a tradução: ${inputText}`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("DEBUG: Erro ao traduzir:", error);
    throw new Error("Falha ao traduzir");
  }
}