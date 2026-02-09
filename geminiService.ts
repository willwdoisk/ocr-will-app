import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

async function compressImage(base64Str: string): Promise<string> {
return new Promise((resolve, reject) => {
const img = new Image();

});
}

export async function performOCR(base64: string) {
const model = genAI.getGenerativeModel({
model: "gemini-1.5-flash",
generationConfig: { timeout: 30000 }
});

try {
const compressedData = await compressImage(base64);

} catch (error) {
console.error("Erro no Gemini:", error);
return "Erro ao processar imagem. Verifique a conexão.";
}
}

export async function translateText(text: string, targetLang: string) {
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const prompt = Traduza o seguinte texto para ${targetLang}, mantendo o sentido original: ${text};

try {
const result = await model.generateContent(prompt);
return result.response.text();
} catch (error) {
console.error("Erro na tradução:", error);
return "Erro ao traduzir o texto.";
}
}