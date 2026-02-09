import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

async function compressImage(base64Str: string): Promise<string> {
return new Promise((resolve, reject) => {
const img = new Image();
img.src = base64Str.startsWith('data:') ? base64Str : data:image/jpeg;base64,${base64Str};
img.onload = () => {
const canvas = document.createElement('canvas');
const MAX_WIDTH = 1200;
let width = img.width;
let height = img.height;
if (width > MAX_WIDTH) {
height *= MAX_WIDTH / width;
width = MAX_WIDTH;
}
canvas.width = width;
canvas.height = height;
const ctx = canvas.getContext('2d');
if (!ctx) {
reject("Erro ao criar contexto do canvas");
return;
}
ctx.drawImage(img, 0, 0, width, height);
const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
resolve(compressedBase64.split(',')[1]);
};
img.onerror = () => reject("Erro ao carregar imagem para compressão");
});
}

export async function performOCR(base64: string) {
const model = genAI.getGenerativeModel({
model: "gemini-1.5-flash",
generationConfig: { timeout: 30000 }
});
try {
const compressedData = await compressImage(base64);
const prompt = "Extraia todo o texto desta imagem. Formate de maneira clara e organizada.";
const result = await model.generateContent([
prompt,
{ inlineData: { data: compressedData, mimeType: "image/jpeg" } }
]);
return result.response.text();
} catch (error) {
console.error("Erro no Gemini:", error);
return "Erro ao processar imagem. Tente um arquivo menor ou verifique a conexão.";
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