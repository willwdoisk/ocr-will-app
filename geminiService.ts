import { GoogleGenerativeAI } from "@google/generative-ai";

// Pega a chave das variáveis de ambiente do Vite
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

/**
 * Compressão simples de imagem via canvas (somente em ambiente cliente).
 * Retorna o base64 (dataURL). Se rodar no server, retorna o base64 original.
 */
async function compressImage(base64Str: string): Promise<string> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || typeof Image === "undefined") {
      // Não há DOM no servidor — retorna o base64 original
      return resolve(base64Str);
    }

    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const maxDim = 1024;
        let { width, height } = img;

        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim / width, maxDim / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(base64Str);

        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL("image/jpeg", 0.7);
        resolve(compressed);
      } catch (e) {
        // Em caso de erro, retorna o base64 original
        resolve(base64Str);
      }
    };

    img.onerror = () => resolve(base64Str);
    img.src = base64Str;
  });
}

/**
 * Realiza OCR chamando a API do Gemini / Generative Language.
 * Envia inlineData com base64 puro (sem cabeçalho).
 */
export async function performOCR(base64: string): Promise<string> {
  if (!API_KEY) {
    console.error("ERRO: A VITE_GEMINI_API_KEY não foi encontrada nas variáveis de ambiente.");
    return "Erro de configuração: Chave API não encontrada no servidor.";
  }

  const genAI = new GoogleGenerativeAI(API_KEY);
  // Você pode trocar o modelo se quiser testar outro (ex: "models/text-bison-001")
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    const compressedData = await compressImage(base64);
    // Remove cabeçalho data:image/...;base64, se existir
    const base64Data = compressedData.includes(",") ? compressedData.split(",")[1] : compressedData;

    // Detecta mimeType a partir do cabeçalho original, se houver; caso contrário usa jpeg
    const mimeType = compressedData.includes(",")
      ? compressedData.split(",")[0].replace("data:", "").replace(";base64", "")
      : "image/jpeg";

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType || "image/jpeg"
        }
      },
      { text: "Extraia apenas o texto desta imagem. Retorne somente o texto sem comentários." }
    ]);

    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error("Erro no Gemini OCR:", error);
    // Mensagens amigáveis para o usuário
    if (error?.status === 400 || error?.message?.includes("Bad Request")) {
      return "Erro: requisição inválida para a API.";
    }
    if (error?.message?.includes("API key") || error?.status === 403 || error?.status === 401) {
      return "Erro: Chave de API inválida ou sem permissão.";
    }
    return "Erro ao processar imagem. Tente novamente.";
  }
}

/**
 * Tradução simples usando o mesmo cliente.
 */
export async function translateText(text: string, targetLang: string): Promise<string> {
  if (!API_KEY) return "Erro: Chave não configurada.";

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `Traduza o seguinte texto para ${targetLang}, mantendo o sentido original: ${text}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Erro na tradução:", error);
    return "Erro ao traduzir o texto.";
  }
}