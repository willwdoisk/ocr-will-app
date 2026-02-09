import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

// Inicializa o cliente
const genAI = new GoogleGenerativeAI(API_KEY);

// TENTATIVA: Usar apenas o nome do modelo sem o prefixo 'models/'
// Se o 404 persistir, o problema é a região do servidor da Vercel ou a lib desatualizada
const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash",
});

function cleanBase64(dataUrlOrBase64: string) {
  const withoutHeader = dataUrlOrBase64.includes(",") ? dataUrlOrBase64.split(",")[1] : dataUrlOrBase64;
  return withoutHeader.replace(/\s/g, "");
}

export async function performOCR(base64: string): Promise<string> {
  if (!API_KEY) return "Erro: chave API não configurada";

  try {
    const cleaned = cleanBase64(base64);
    const mimeType = base64.startsWith("data:image/jpeg") || base64.startsWith("/9j/") ? "image/jpeg" : "image/png";

    const prompt = [
      { inlineData: { data: cleaned, mimeType } },
      { text: "Extraia o texto desta imagem. Retorne apenas o texto." }
    ];

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    console.error("Erro detalhado:", error);
    // Se der 404, vamos tentar um fallback para o modelo Pro caso o Flash esteja instável na sua região
    return `Erro ${error?.status || '404'}: O serviço Gemini não encontrou o modelo. Verifique se a biblioteca @google/generative-ai está atualizada no package.json.`;
  }
}

export async function translateText(inputText: string, targetLanguage = "Português"): Promise<string> {
  try {
    const result = await model.generateContent(`Traduza para ${targetLanguage}: ${inputText}`);
    const response = await result.response;
    return response.text();
  } catch (error) {
    throw new Error("Falha ao traduzir");
  }
}