// src/geminiService.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Atenção: variáveis VITE_ são expostas no bundle do frontend.
 * Usamos logs temporários apenas para debug — remova-os depois.
 */
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

// DEBUG: presença e comprimento da chave (NÃO imprime o valor completo)
console.log("DEBUG: VITE_GEMINI_API_KEY presente?", !!API_KEY, "comprimento:", API_KEY ? API_KEY.length : 0);

// Inicializa cliente e modelo (ajustado para models/gemini-1.5-flash)
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });

/** Limpa header data:... e espaços do base64 */
function cleanBase64(dataUrlOrBase64: string) {
  const withoutHeader = dataUrlOrBase64.includes(",") ? dataUrlOrBase64.split(",")[1] : dataUrlOrBase64;
  return withoutHeader.replace(/\s/g, "");
}

/**
 * performOCR
 * - Recebe um base64 (dataURL ou base64 puro)
 * - Envia como inlineData para o modelo, pede extração de texto
 */
export async function performOCR(base64: string): Promise<string> {
  console.log("DEBUG: performOCR chamado (modelo: models/gemini-1.5-flash)");
  console.log("DEBUG: chave presente?", !!API_KEY);

  if (!API_KEY) {
    console.error("Chave API não configurada (VITE_GEMINI_API_KEY).");
    return "Erro: chave API não configurada";
  }

  try {
    const cleaned = cleanBase64(base64);
    const mimeType = base64.startsWith("data:image/jpeg") || base64.startsWith("/9j/") ? "image/jpeg" : "image/png";

    console.log("DEBUG: base64 length:", cleaned.length, "mimeType:", mimeType);

    const prompt = [
      {
        inlineData: {
          data: cleaned,
          mimeType
        }
      },
      {
        text: "Extraia todo o texto contido nesta imagem e retorne SOMENTE o texto extraído, sem explicações."
      }
    ];

    const result = await model.generateContent(prompt as any);
    const response = await result.response;

    // Tenta extrair texto de formas diferentes dependendo do SDK/versão
    let extracted = "";
    try {
      if (response && typeof response.text === "function") {
        extracted = await response.text();
      } else if (response && response.output && Array.isArray(response.output)) {
        extracted = response.output.map((o: any) => o.content || o.text || "").join("\n");
      } else if (typeof response === "string") {
        extracted = response;
      } else {
        extracted = JSON.stringify(response);
      }
    } catch (innerErr) {
      console.warn("DEBUG: fallback ao interpretar response:", innerErr);
      extracted = JSON.stringify(response);
    }

    console.log("DEBUG: performOCR OK, tamanho texto extraído:", extracted.length);
    return extracted || "Nenhum texto encontrado.";
  } catch (error: any) {
    console.error("DEBUG: Erro no Gemini OCR:", error);

    const status = error?.status || error?.code || error?.response?.status;
    if (status === 403) return "Erro: chave API inválida ou sem permissão (403).";
    if (status === 400) return "Erro: requisição inválida (400).";
    if (status === 404) return "Erro: modelo/endpoint não encontrado (404). Verifique nome do modelo e lib.";
    return "Erro ao processar imagem. Tente novamente.";
  }
}

/**
 * translateText
 * - Simples wrapper para tradução usando o mesmo modelo
 /
export async function translateText(inputText: string, targetLanguage = "Português"): Promise<string> {
  console.log("DEBUG: translateText chamado, comprimento:", inputText?.length || 0);

  if (!API_KEY) {
    console.error("Chave API não configurada (VITE_GEMINI_API_KEY).");
    throw new Error("Chave API não configurada");
  }

  try {
    const prompt = [
      { text: `Traduza o texto a seguir para ${targetLanguage}. Retorne somente a tradução.` },
      { text: inputText }
    ];

    const result = await model.generateContent(prompt as any);
    const response = await result.response;

    let translated = "";
    if (response && typeof response.text === "function") {
      translated = await response.text();
    } else if (response && response.output && Array.isArray(response.output)) {
      translated = response.output.map((o: any) => o.content || o.text || "").join("\n");
    } else if (typeof response === "string") {
      translated = response;
    } else {
      translated = JSON.stringify(response);
    }

    console.log("DEBUG: translateText OK, comprimento resultado:", translated.length);
    return translated;
  } catch (error: any) {
    console.error("DEBUG: Erro ao traduzir:", error);
    throw new Error("Falha ao traduzir");
  }
}