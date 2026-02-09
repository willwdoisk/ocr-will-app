import { createWorker } from 'tesseract.js';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Chave para a tradução via Gemini
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * OCR LOCAL (Tesseract.js) - Já está funcionando!
 */
export async function performOCR(imageSource: string): Promise<string> {
  console.log("DEBUG: Iniciando OCR local com Tesseract.js");
  try {
    const worker = await createWorker('por+eng');
    const { data: { text } } = await worker.recognize(imageSource);
    await worker.terminate();
    return text || "Nenhum texto encontrado.";
  } catch (error) {
    console.error("Erro no OCR:", error);
    return "Erro ao ler a imagem localmente.";
  }
}

/**
 * TRADUÇÃO VIA GEMINI (Apenas Texto)
 */
export async function translateText(inputText: string, targetLanguage = "Português"): Promise<string> {
  console.log("DEBUG: Iniciando tradução via Gemini");
  
  if (!API_KEY) {
    return `[Erro: Chave API não configurada no Vercel]. Texto original: ${inputText}`;
  }

  try {
    const prompt = `Traduza o texto a seguir para ${targetLanguage}. Retorne APENAS a tradução, sem comentários: "${inputText}"`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const translatedText = response.text();
    
    return translatedText;
  } catch (error: any) {
    console.error("Erro na tradução Gemini:", error);
    return `[Falha na tradução]: ${inputText}`;
  }
}