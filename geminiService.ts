import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * OBS:
 * - Não imprima a chave completa em logs públicos.
 * - Variáveis VITE_ são expostas no bundle (frontend). Isso é apenas para debug temporário.
 */

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

// DEBUG: presença e comprimento da chave (NÃO imprime o valor completo)
console.log("DEBUG: VITE_GEMINI_API_KEY presente?", !!API_KEY, "comprimento:", API_KEY ? API_KEY.length : 0);

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "models/text-bison-001" });

/**
 * Limpa header data:... e removes whitespace do base64
 */
function cleanBase64(dataUrlOrBase64: string) {
  const withoutHeader = dataUrlOrBase64.includes(",") ? dataUrlOrBase64.split(",")[1] : dataUrlOrBase64;
  // Remove espaços e quebras de linha que algumas fontes colocam
  return withoutHeader.replace(/\s/g, "");
}

/**
 * performOCR
 * - Recebe um base64 (dataURL ou base64 puro)
 * - Envia como inlineData para o modelo (prompt simples que pede a extração do texto)
 */
export async function performOCR(base64: string): Promise<string> {
  console.log("DEBUG: performOCR chamado");
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
        // inlineData conforme usado antes — mantemos o padrão que você estava usando
        inlineData: {
          data: cleaned,
          mimeType
        }
      },
      {
        text: "Extraia o texto desta imagem. Retorne somente o texto extraído, sem comentários."
      }
    ];

    // Gera a resposta (seguindo o padrão usado anteriormente no projeto)
    const result = await model.generateContent(prompt as any);
    const response = await result.response;

    // Alguns SDKs retornam texto via .text() ou .content; tentamos ambas formas
    let extracted = "";
    try {
      // se houver método text()
      if (typeof response.text === "function") {
        extracted = await response.text();
      } else if (response.output && Array.isArray(response.output) && response.output.length > 0) {
        // fallback: extrai do output
        extracted = response.output.map((o: any) => o.content || o.text || "").join("\n");
      } else if (typeof response === "string") {
        extracted = response;
      } else {
        // última tentativa: stringify
        extracted = JSON.stringify(response);
      }
    } catch (innerErr) {
      console.warn("DEBUG: falha ao interpretar response.text(), tentando fallback", innerErr);
      extracted = JSON.stringify(response);
    }

    console.log("DEBUG: performOCR OK, tamanho texto extraído:", extracted.length);
    return extracted || "Nenhum texto encontrado.";
  } catch (error: any) {
    console.error("DEBUG: Erro no Gemini OCR:", error);

    // Tratamentos comuns
    const status = error?.status || error?.code || (error?.response?.status);
    if (status === 403) return "Erro: chave API inválida ou sem permissão (403).";
    if (status === 400) return "Erro: requisição inválida (400).";
    if (status === 404) return "Erro: endpoint não encontrado (404). Verifique modelo/endpoint.";
    // Mensagem genérica para o usuário, mantenha o log completo no console para debug
    return "Erro ao processar imagem. Tente novamente.";
  }
}

/**
 * translateText
 * - Função simples para traduzir um texto usando o mesmo modelo (prompt básico).
 * - targetLanguage ex: "Português"
 */
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

    // tenta extrair texto similarmente ao performOCR
    let translated = "";
    if (typeof response.text === "function") {
      translated = await response.text();
    } else if (response.output && Array.isArray(response.output)) {
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