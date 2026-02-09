import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

async function compressImage(base64Str: string): Promise<string> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || typeof Image === "undefined") {
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
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      } catch (e) {
        resolve(base64Str);
      }
    };
    img.onerror = () => resolve(base64Str);
    img.src = base64Str;
  });
}

export async function performOCR(base64: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    const compressedData = await compressImage(base64);
    // Remove o cabeçalho data:image/... se existir para enviar apenas o base64 puro
    const base64Data = compressedData.split(",")[1] || compressedData;

    const result = await model.generateContent([
      "Extraia todo o texto desta imagem. Retorne apenas o texto encontrado.",
      { inlineData: { data: base64Data, mimeType: "image/jpeg" } }
    ]);

    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Erro no Gemini OCR:", error);
    return "Erro ao processar imagem. Verifique a chave da API e a conexão.";
  }
}

export async function translateText(text: string, targetLang: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `Traduza o seguinte texto para ${targetLang}: ${text}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Erro na tradução:", error);
    return "Erro ao traduzir o texto.";
  }
}