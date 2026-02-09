import { createWorker } from 'tesseract.js';

/**
 * performOCR usando Tesseract.js
 * Não precisa de chaves de API, roda localmente no navegador.
 */
export async function performOCR(imageSource: string): Promise<string> {
  console.log("DEBUG: Iniciando OCR com Tesseract.js");
  
  try {
    // Cria o trabalhador do Tesseract
    const worker = await createWorker('por+eng'); // Carrega Português e Inglês

    // Realiza o reconhecimento
    const { data: { text } } = await worker.recognize(imageSource);
    
    // Finaliza o trabalhador para liberar memória
    await worker.terminate();

    console.log("DEBUG: OCR concluído com sucesso");
    return text || "Nenhum texto encontrado na imagem.";
  } catch (error: any) {
    console.error("DEBUG: Erro no Tesseract OCR:", error);
    return "Erro ao ler a imagem. Certifique-se de que é um arquivo de imagem válido.";
  }
}

/**
 * translateText
 * Como o Tesseract não traduz, aqui temos duas opções:
 * 1. Manter o Gemini apenas para tradução (que é texto e dá menos erro).
 * 2. Usar uma API de tradução gratuita.
 * Por enquanto, vamos deixar um aviso ou usar uma chamada simples.
 */
export async function translateText(text: string, targetLanguage = "Português"): Promise<string> {
  // Para tradução, o Gemini costuma não dar erro de 404 (pois é só texto).
  // Se quiser tentar manter o Gemini só para traduzir, me avise.
  // Por ora, vamos retornar o texto com um aviso:
  return `[Tradução para ${targetLanguage} indisponível no modo offline]: ${text}`;
}