// src/multiService.ts
import Tesseract from 'tesseract.js';

/**
 * Serviço híbrido gratuito:
 * - OCR local: Tesseract.js
 * - OCR online: OCR.Space (opcional chave em VITE_OCR_SPACE_API_KEY)
 * - Tradução principal: LibreTranslate (instância pública)
 * - Tradução fallback: MyMemory
 *
 * Observação: o frontend deve passar o valor do FileReader.result (data URL, ex: "data:image/png;base64,...")
 */

const OCR_SPACE_API_KEY = import.meta.env.VITE_OCR_SPACE_API_KEY || '';
const OCR_SPACE_URL = 'https://api.ocr.space/parse/image';
const LIBRETRANSLATE_URL = 'https://libretranslate.de/translate';
const MYMEMORY_URL = 'https://api.mymemory.translated.net/get';

/* --------------------------- Helpers --------------------------- */

function isLikelyGoodText(t?: string) {
  if (!t) return false;
  const trimmed = t.replace(/\s+/g, ' ').trim();
  // bom se > 10 chars e contém ao menos 3 letras
  const letters = (trimmed.match(/[A-Za-zÀ-ÖØ-öø-ÿ]/g) || []).length;
  return trimmed.length > 10 && letters >= 3;
}

function ensureDataUrl(base64OrDataUrl: string) {
  // se já vier no formato data:* return; caso venha só o base64 (raro), tenta prefixar como png
  if (base64OrDataUrl.startsWith('data:')) return base64OrDataUrl;
  return `data:image/png;base64,${base64OrDataUrl}`;
}

/* --------------------------- OCR (Local) --------------------------- */

export async function ocrLocal(imageDataUrl: string): Promise<string> {
  try {
    console.log('[multiService] OCR local (Tesseract) iniciando...');
    // Tesseract aceita data URL direto
    const res = await Tesseract.recognize(ensureDataUrl(imageDataUrl), 'por+eng', {
      logger: (m) => {
        // opcional: console.log('[tesseract]', m);
      }
    });
    const text = res?.data?.text || '';
    console.log('[multiService] OCR local finalizado. chars:', (text || '').length);
    return text;
  } catch (err) {
    console.error('[multiService] Erro OCR local:', err);
    return '';
  }
}

/* --------------------------- OCR (Online: OCR.Space) --------------------------- */

export async function ocrOnline(imageDataUrl: string): Promise<string> {
  try {
    console.log('[multiService] OCR online (OCR.Space) iniciando...');
    const form = new FormData();
    // OCR.Space espera uma string data:image/...base64,...
    form.append('base64Image', ensureDataUrl(imageDataUrl));
    form.append('language', 'por'); // ajustar se necessário
    form.append('isOverlayRequired', 'false');
    if (OCR_SPACE_API_KEY) form.append('apikey', OCR_SPACE_API_KEY);

    const resp = await fetch(OCR_SPACE_URL, {
      method: 'POST',
      body: form
    });

    const data = await resp.json();
    if (!data) {
      console.warn('[multiService] OCR.Space retornou vazio');
      return '';
    }
    if (data.IsErroredOnProcessing) {
      console.warn('[multiService] OCR.Space erro:', data.ErrorMessage || data);
      return '';
    }
    const parsed = data.ParsedResults?.[0]?.ParsedText || '';
    console.log('[multiService] OCR.Space finalizado. chars:', (parsed || '').length);
    return parsed;
  } catch (err) {
    console.error('[multiService] Erro OCR.Space:', err);
    return '';
  }
}

/* --------------------------- Função mestre de OCR --------------------------- */

/**
 * Tenta OCR local (Tesseract). Se o resultado for fraco, tenta OCR.Space.
 * Retorna string (pode ser vazia).
 */
export async function performOCR(imageDataUrl: string): Promise<string> {
  // Garantir formato
  const dataUrl = ensureDataUrl(imageDataUrl);

  // 1) Tentar local
  try {
    const local = await ocrLocal(dataUrl);
    if (isLikelyGoodText(local)) {
      return local;
    }
    // caso não seja confiável, tenta online
    console.log('[multiService] OCR local insuficiente, tentando OCR online...');
    const online = await ocrOnline(dataUrl);
    if (isLikelyGoodText(online)) return online;
    // se online também falhar, retorna o melhor entre os dois
    return (online && online.length > local.length) ? online : local;
  } catch (err) {
    console.error('[multiService] Erro no fluxo OCR híbrido:', err);
    // fallback último recurso: tenta online
    const online = await ocrOnline(dataUrl);
    return online || '';
  }
}

/* --------------------------- Tradução: LibreTranslate --------------------------- */

export async function translateLibre(text: string, targetLang: string): Promise<string> {
  try {
    console.log('[multiService] Tradução LibreTranslate iniciando...');
    const resp = await fetch(LIBRETRANSLATE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: text,
        source: 'auto',
        target: targetLang.toLowerCase(),
        format: 'text'
      })
    });
    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(`LibreTranslate falhou: ${resp.status} ${txt}`);
    }
    const data = await resp.json();
    return data?.translatedText || text;
  } catch (err) {
    console.warn('[multiService] Erro LibreTranslate:', err);
    throw err;
  }
}

/* --------------------------- Tradução: MyMemory (fallback) --------------------------- */

export async function translateMyMemory(text: string, targetLang: string): Promise<string> {
  try {
    console.log('[multiService] Tradução MyMemory iniciando...');
    
    // Mudamos 'auto' para 'en' (Inglês) para evitar o erro de 'INVALID SOURCE LANGUAGE'
    // O par fica 'en|pt' (Inglês para Português)
    const sourceLang = 'en'; 
    const url = `${MYMEMORY_URL}?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${encodeURIComponent(targetLang.toLowerCase())}`;
    
    const resp = await fetch(url);
    const data = await resp.json();
    
    // Se a MyMemory retornar erro, ela envia o status 200 mas com mensagem de erro no texto
    if (data.responseStatus !== 200) {
      console.warn('[multiService] MyMemory retornou status de erro:', data.responseDetails);
      return text;
    }

    const translated = data?.responseData?.translatedText;
    return translated || text;
  } catch (err) {
    console.warn('[multiService] Erro MyMemory:', err);
    return text;
  }
}

/* --------------------------- Função mestre de Tradução --------------------------- */

/**
 * Tenta LibreTranslate; se falhar, usa MyMemory como fallback.
 * targetLang deve ser código ISO curto (ex: 'pt', 'en', 'es')
 */
export async function translateText(text: string, targetLang: string): Promise<string> {
  // proteção básica
  if (!text || !text.trim()) return '';

  try {
    // opcional: limitar tamanho para evitar problemas em instâncias públicas
    const MAX = 15000;
    const toSend = text.length > MAX ? text.slice(0, MAX) : text;
    return await translateLibre(toSend, targetLang);
  } catch (err) {
    console.warn('[multiService] LibreTranslate falhou, tentando MyMemory...');
    return await translateMyMemory(text, targetLang);
  }
}