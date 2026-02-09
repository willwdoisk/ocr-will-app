
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export async function performOCR(base64Image: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          parts: [
            { text: "Você é um especialista em OCR. Extraia TODO o texto desta imagem. Mantenha a formatação original (parágrafos, listas, valores de recibos). Se houver tabelas, tente representá-las de forma legível. Não adicione comentários, apenas o texto extraído." },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Image.split(',')[1] || base64Image
              }
            }
          ]
        }
      ],
      config: {
        temperature: 0.1,
      }
    });

    return response.text || "Nenhum texto detectado.";
  } catch (error) {
    console.error("OCR failed:", error);
    throw error;
  }
}

export async function translateText(text: string, targetLanguage: string = "Português"): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Traduza o seguinte texto para ${targetLanguage}. Mantenha o tom original e a formatação: \n\n${text}`,
      config: {
        temperature: 0.3,
      }
    });
    return response.text || text;
  } catch (error) {
    console.error("Translation failed:", error);
    return text;
  }
}
