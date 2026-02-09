import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

async function compressImage(base64Str: string): Promise<string> {
  return new Promise((resolve, reject) => {
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
        if (!ctx) throw new Error("Canvas 2D não suportado");

        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL("image/jpeg", 0.7);
        resolve(compressed);
      } catch (e) {
        reject(e);
      }
    };

    img.onerror = (err) => reject(err);
    img.src = base64Str;
  });
}

export async function performOCR(base64: string): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: { timeout: 30000 }
  });

  try {
    const compressedData = await compressImage(base64);
    const prompt = `Realize OCR (extração de texto) da imagem em base64 abaixo e retorne apenas o texto extraído:\n\n${compressedData}`;

    console.log("Prompt enviado para Gemini:", prompt);

    const result = await model.generateContent(prompt);

    console.log("Resposta da Gemini:", result);

    const text =
      (result as any)?.response?.text ? (result as any).response.text() :
      (result as any)?.candidates?.[0]?.content ??
      JSON.stringify(result);

    console.log("Texto extraído:", text);

    return String(text);
  } catch (error) {
    console.error("Erro no Gemini:", error);
    return "Erro ao processar imagem. Verifique a conexão.";
  }
}