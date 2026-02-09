import React, { useState } from 'react';
import { Screen, TranscriptionItem } from './types';
import { MOCK_TRANSCRIPTIONS, MOCK_FOLDERS } from './constants';
import { performOCR, translateText } from './geminiService';

/**
 * Componente Icon centralizado.
 * - Usa Material Symbols por padrão.
 * - Classe notranslate evita que serviços de tradução (ou o navegador) convertam o texto do ícone.
 * - Recebe className para controlar tamanho/cores via Tailwind.
 */
const Icon: React.FC<{ name: string; className?: string; variant?: 'outlined' | 'classic' }> = ({ name, className = '', variant = 'outlined' }) => {
  const base = variant === 'outlined' ? 'material-symbols-outlined notranslate' : 'material-icons notranslate';
  return (
    <span className={`${base} ${className}`} aria-hidden="true" role="img">
      {name}
    </span>
  );
};

// --- Shared Components ---

const Navbar: React.FC<{ title: string; onBack?: () => void; rightElement?: React.ReactNode }> = ({ title, onBack, rightElement }) => (
  <header className="sticky top-0 z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md px-5 py-4 pt-safe flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
    <div className="flex items-center gap-4">
      {onBack && (
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors active:scale-90">
          <Icon name="arrow_back_ios_new" className="text-primary text-2xl" />
        </button>
      )}
      <div className="flex items-center gap-2.5">
        {!onBack && (
          <div className="bg-brand-deep-blue dark:bg-brand-electric-cyan/20 p-1.5 rounded-lg shadow-sm">
            <Icon name="document_scanner" className="text-white dark:text-brand-electric-cyan text-2xl font-bold block" />
          </div>
        )}
        <h1 className="text-xl font-bold tracking-tight text-brand-deep-blue dark:text-brand-electric-cyan truncate max-w-[200px]">{title}</h1>
      </div>
    </div>
    <div className="flex gap-1">
      {rightElement}
    </div>
  </header>
);

const BottomNav: React.FC<{ active: Screen; onNavigate: (s: Screen) => void }> = ({ active, onNavigate }) => (
  <nav className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 pb-safe pt-3 shadow-[0_-8px_20px_rgba(0,0,0,0.1)] z-40">
    <div className="max-w-md mx-auto flex items-center justify-around px-4 pb-2">
      <button onClick={() => onNavigate('home')} className={`flex flex-col items-center gap-1 transition-colors ${active === 'home' ? 'text-primary' : 'text-slate-400'}`}>
        <Icon name="home" className={`text-3xl ${active === 'home' ? 'fill-1' : ''}`} />
        <span className="text-[10px] font-bold uppercase tracking-widest">Início</span>
      </button>
      <button onClick={() => onNavigate('history')} className={`flex flex-col items-center gap-1 transition-colors ${active === 'history' ? 'text-primary' : 'text-slate-400'}`}>
        <Icon name="history" className={`text-3xl ${active === 'history' ? 'fill-1' : ''}`} />
        <span className="text-[10px] font-semibold uppercase tracking-widest">Histórico</span>
      </button>
      <button onClick={() => onNavigate('home')} className="relative -top-6 flex items-center justify-center size-16 rounded-full bg-primary shadow-lg shadow-primary/40 border-4 border-slate-50 dark:border-background-dark active:scale-95 transition-transform">
        <Icon name="add_a_photo" className="text-white text-4xl" />
      </button>
      <button onClick={() => onNavigate('folders')} className={`flex flex-col items-center gap-1 transition-colors ${active === 'folders' ? 'text-primary' : 'text-slate-400'}`}>
        <Icon name="bookmark" className={`text-3xl ${active === 'folders' ? 'fill-1' : ''}`} />
        <span className="text-[10px] font-semibold uppercase tracking-widest">Pastas</span>
      </button>
      <button onClick={() => onNavigate('settings')} className={`flex flex-col items-center gap-1 transition-colors ${active === 'settings' ? 'text-primary' : 'text-slate-400'}`}>
        <Icon name="settings" className={`text-3xl ${active === 'settings' ? 'fill-1' : ''}`} />
        <span className="text-[10px] font-semibold uppercase tracking-widest">Ajustes</span>
      </button>
    </div>
  </nav>
);

// --- Views ---

const HomeView: React.FC<{ onOCR: (file: File) => void; history: TranscriptionItem[] }> = ({ onOCR, history }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onOCR(file);
  };

  return (
    <div className="max-w-md mx-auto pb-32 animate-in fade-in duration-500">
      <section className="p-6">
        <div className="relative overflow-hidden bg-gradient-to-br from-brand-deep-blue/5 to-brand-electric-cyan/5 dark:from-brand-deep-blue/20 dark:to-brand-electric-cyan/10 rounded-3xl border border-brand-deep-blue/10 dark:border-brand-electric-cyan/20 p-8 flex flex-col items-center text-center shadow-inner">
          <div className="mb-5 bg-white dark:bg-slate-800 shadow-xl p-6 rounded-full border border-brand-deep-blue/5 dark:border-brand-electric-cyan/20">
            <Icon name="photo_camera" className="text-brand-deep-blue dark:text-brand-electric-cyan text-5xl" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-brand-deep-blue dark:text-white">Digitalizar Agora</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm px-4">Converta fotos de documentos em texto editável em segundos.</p>
          
          <div className="flex flex-col gap-4 w-full">
            <div className="grid grid-cols-2 gap-4 w-full">
              <label className="cursor-pointer flex items-center justify-center gap-2 bg-primary text-white font-bold py-4 px-4 rounded-2xl active:scale-95 transition-all shadow-lg shadow-primary/20">
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
                <Icon name="photo_camera" className="text-white" />
                <span>Câmera</span>
              </label>
              <label className="cursor-pointer flex items-center justify-center gap-2 border-2 border-primary text-primary font-bold py-4 px-4 rounded-2xl active:scale-95 transition-all">
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                <Icon name="photo_library" className="text-primary" />
                <span>Galeria</span>
              </label>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 mt-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Sua Atividade</h3>
          <button className="text-primary font-bold text-sm">Ver Tudo</button>
        </div>
        <div className="space-y-4">
          {history.length > 0 ? history.slice(0, 3).map(item => (
            <div key={item.id} className="flex items-center gap-4 bg-white dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 active:bg-slate-50 dark:active:bg-slate-800 transition-colors cursor-pointer group shadow-sm">
              <div className="size-14 rounded-xl overflow-hidden shrink-0 bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-primary">
                {item.image ? <img src={item.image} className="w-full h-full object-cover" /> : <Icon name="description" className="text-2xl" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{item.date}</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-primary/5 text-primary text-[9px] font-black uppercase">{item.language}</span>
                </div>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{item.title}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 italic">{item.content}</p>
              </div>
              <Icon name="chevron_right" className="text-slate-300 group-hover:text-primary transition-colors" />
            </div>
          )) : (
            <div className="text-center py-10 text-slate-400 italic text-sm">Nenhuma transcrição ainda.</div>
          )}
        </div>
      </section>
    </div>
  );
};

const ProcessingView: React.FC<{ progress: number }> = ({ progress }) => (
  <div className="flex-1 flex flex-col items-center justify-center p-6 gap-8 max-w-md mx-auto">
    <div className="relative w-full aspect-[3/4] max-h-[400px] overflow-hidden rounded-3xl bg-slate-200 dark:bg-slate-800 shadow-2xl border-4 border-white dark:border-slate-700">
      <div className="absolute inset-0 bg-center bg-cover opacity-40" style={{ backgroundImage: "url('https://picsum.photos/seed/scanning/600/800')" }}></div>
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-electric-cyan to-transparent shadow-[0_0_15px_#00F2FF] animate-scan z-20"></div>
      
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="size-24 rounded-full border-4 border-t-brand-electric-cyan border-white/10 animate-spin"></div>
      </div>
    </div>

    <div className="w-full text-center space-y-2">
      <h3 className="text-2xl font-black tracking-tight text-brand-deep-blue dark:text-white">Extraindo Texto...</h3>
      <p className="text-slate-500 dark:text-slate-400 text-sm">O Gemini está lendo seu documento agora.</p>
    </div>

    <div className="w-full space-y-4 px-4">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-slate-400">
          <span>IA Engine v3.1</span>
          <span className="text-primary">{progress}%</span>
        </div>
        <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
          <div className="h-full bg-gradient-to-r from-primary to-brand-electric-cyan rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(19,127,236,0.5)]" style={{ width: `${progress}%` }}></div>
        </div>
      </div>
    </div>
  </div>
);

const ResultView: React.FC<{ 
  resultText: string; 
  setResultText: (t: string) => void; 
  onSave: () => void;
  onTranslate: () => void;
  isTranslating: boolean;
}> = ({ resultText, setResultText, onSave, onTranslate, isTranslating }) => (
  <div className="flex-1 flex flex-col p-5 gap-4 max-w-md mx-auto w-full pb-32 animate-in slide-in-from-bottom-10 duration-500">
    <div className="flex items-center justify-between px-1">
      <div className="px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 flex items-center gap-2">
        <span className="size-1.5 rounded-full bg-green-500 animate-pulse"></span>
        <span className="text-[10px] font-black text-primary uppercase tracking-tighter">Escaneamento Concluído</span>
      </div>
      <span className="text-[12px] font-bold text-slate-400">{resultText.split(' ').length} palavras</span>
    </div>
    
    <div className="flex-1 flex flex-col relative group">
      <textarea 
        className="w-full flex-1 p-6 rounded-[2.5rem] bg-white dark:bg-card-dark border-2 border-slate-100 dark:border-slate-800 focus:border-primary outline-none text-base leading-relaxed resize-none transition-all shadow-xl shadow-slate-200/50 dark:shadow-none font-medium"
        value={resultText}
        onChange={(e) => setResultText(e.target.value)}
        placeholder="Texto extraído aparecerá aqui..."
        spellCheck={false}
      />
      {isTranslating && (
        <div className="absolute inset-0 bg-white/60 dark:bg-background-dark/60 backdrop-blur-sm rounded-[2.5rem] flex flex-col items-center justify-center z-10">
          <div className="size-12 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4"></div>
          <p className="font-bold text-primary animate-pulse uppercase tracking-widest text-xs">Traduzindo...</p>
        </div>
      )}
    </div>

    <section className="grid grid-cols-2 gap-3">
      <button 
        onClick={() => {
          navigator.clipboard.writeText(resultText);
          alert('Copiado!');
        }}
        className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 active:scale-95 transition-all shadow-sm"
      >
        <Icon name="content_copy" className="text-primary" />
        <span className="text-[11px] font-black uppercase">Copiar</span>
      </button>
      <button 
        onClick={onTranslate}
        disabled={isTranslating}
        className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 active:scale-95 transition-all shadow-sm disabled:opacity-50"
      >
        <Icon name="translate" className="text-primary" />
        <span className="text-[11px] font-black uppercase">Traduzir</span>
      </button>
      <button 
        onClick={onSave}
        className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-primary text-white active:scale-95 transition-all shadow-lg shadow-primary/30 col-span-2 font-bold"
      >
        <Icon name="save_as" />
        <span className="text-xs font-black uppercase tracking-wider">Salvar no Meu Histórico</span>
      </button>
    </section>
  </div>
);

const SettingsView: React.FC = () => {
  const handleShare = async () => {
    const shareData = {
      title: 'OCR-WILL Pro',
      text: 'Confira meu novo app de digitalização com IA!',
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share failed', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link do app copiado para a área de transferência! Envie para o seu celular.');
    }
  };

  return (
    <div className="max-w-md mx-auto pb-32 animate-in fade-in duration-500">
      <div className="mt-6 space-y-8">
        <section>
          <h2 className="px-6 mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Acesso Mobile</h2>
          <div className="bg-white dark:bg-card-dark border-y border-slate-100 dark:border-slate-800 shadow-sm">
            <button 
              onClick={handleShare}
              className="w-full flex items-center justify-between px-6 py-5 border-b border-slate-50 dark:border-slate-800/50 active:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
                  <Icon name="share" className="text-green-500" />
                </div>
                <div className="text-left">
                  <span className="font-bold text-sm block">Compartilhar App</span>
                  <span className="text-[10px] text-slate-400">Envie o link para o seu celular</span>
                </div>
              </div>
              <Icon name="send" className="text-slate-300" />
            </button>
          </div>
        </section>

        <section>
          <h2 className="px-6 mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Inteligência Artificial</h2>
          <div className="bg-white dark:bg-card-dark border-y border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-50 dark:border-slate-800/50">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                  <Icon name="bolt" className="text-purple-500" />
                </div>
                <span className="font-bold text-sm">Turbo OCR (Gemini 3)</span>
              </div>
              <div className="w-12 h-6 bg-primary rounded-full relative flex items-center p-1">
                <div className="size-4 bg-white rounded-full ml-auto shadow-sm"></div>
              </div>
            </div>
            <button className="w-full flex items-center justify-between px-6 py-5">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <Icon name="translate" className="text-blue-500" />
                </div>
                <span className="font-bold text-sm">Tradução Padrão</span>
              </div>
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Português-BR</span>
            </button>
          </div>
        </section>

        <section>
          <h2 className="px-6 mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Conta & Suporte</h2>
          <div className="bg-white dark:bg-card-dark border-y border-slate-100 dark:border-slate-800 shadow-sm">
            <button className="w-full flex items-center justify-between px-6 py-5 border-b border-slate-50 dark:border-slate-800/50">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-xl bg-slate-500/10 flex items-center justify-center text-slate-500">
                  <Icon name="cloud_sync" className="text-slate-500" />
                </div>
                <span className="font-bold text-sm">Sincronizar Dados</span>
              </div>
              <Icon name="chevron_right" className="text-slate-300" />
            </button>
            <button className="w-full flex items-center justify-between px-6 py-5 text-red-500 active:bg-red-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
                  <Icon name="logout" className="text-red-500" />
                </div>
                <span className="font-bold text-sm">Sair da Conta</span>
              </div>
            </button>
          </div>
        </section>
        
        <div className="px-10 text-center">
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Feito com ❤️ por OCR-WILL Team</p>
          <p className="text-[9px] text-slate-400 mt-1">v3.2.1 Stable Mobile</p>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [progress, setProgress] = useState(0);
  const [resultText, setResultText] = useState('');
  const [history, setHistory] = useState<TranscriptionItem[]>(MOCK_TRANSCRIPTIONS);
  const [isTranslating, setIsTranslating] = useState(false);

  const handleOCR = async (file: File) => {
    setCurrentScreen('processing');
    setProgress(0);

    const interval = setInterval(() => {
      setProgress(p => Math.min(p + 12, 98));
    }, 350);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const text = await performOCR(base64);
        clearInterval(interval);
        setProgress(100);
        setTimeout(() => {
          setResultText(text);
          setCurrentScreen('result');
        }, 600);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      clearInterval(interval);
      alert('Houve um erro no processamento. Tente novamente.');
      setCurrentScreen('home');
    }
  };

  const handleSave = () => {
    const newItem: TranscriptionItem = {
      id: Date.now().toString(),
      title: resultText.slice(0, 30) + (resultText.length > 30 ? '...' : ''),
      content: resultText,
      date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      language: 'Detectado',
      image: 'https://picsum.photos/seed/' + Math.random() + '/200/200'
    };
    setHistory([newItem, ...history]);
    alert('Documento salvo com sucesso!');
    setCurrentScreen('history');
  };

  const handleTranslate = async () => {
    setIsTranslating(true);
    try {
      const translated = await translateText(resultText, "Português");
      setResultText(translated);
    } catch (err) {
      alert("Falha ao traduzir.");
    } finally {
      setIsTranslating(false);
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home': return <HomeView onOCR={handleOCR} history={history} />;
      case 'processing': return <ProcessingView progress={progress} />;
      case 'result': return (
        <ResultView 
          resultText={resultText} 
          setResultText={setResultText} 
          onSave={handleSave} 
          onTranslate={handleTranslate}
          isTranslating={isTranslating}
        />
      );
      case 'history': return (
        <div className="max-w-md mx-auto pb-32 animate-in slide-in-from-right-10 duration-300 px-6 pt-4">
          <h2 className="text-3xl font-black tracking-tighter mb-6">Meu Histórico</h2>
          <div className="space-y-4">
            {history.map(item => (
              <div key={item.id} className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl flex items-center gap-4 shadow-sm active:scale-[0.98] transition-all">
                <div className="size-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary shrink-0">
                  <Icon name="description" className="text-3xl" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{item.title}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{item.date} • {item.time}</p>
                </div>
                <Icon name="open_in_new" className="text-slate-300" />
              </div>
            ))}
          </div>
        </div>
      );
      case 'settings': return <SettingsView />;
      case 'folders': return (
        <div className="max-w-md mx-auto p-6 animate-in slide-in-from-left-10 duration-300">
          <h2 className="text-3xl font-black tracking-tighter mb-8">Pastas Inteligentes</h2>
          <div className="grid gap-4">
            {MOCK_FOLDERS.map(f => (
              <div key={f.id} className="p-5 bg-white dark:bg-card-dark rounded-[2rem] border border-slate-100 dark:border-slate-800 flex items-center justify-between shadow-sm active:bg-slate-50 transition-colors">
                <div className="flex items-center gap-5">
                  <div className="size-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary shadow-inner">
                    <Icon name="folder" className="text-3xl fill-1" />
                  </div>
                  <div>
                    <p className="font-black text-slate-800 dark:text-white">{f.name}</p>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{f.itemCount} arquivos</p>
                  </div>
                </div>
                <Icon name="chevron_right" className="text-slate-200" />
              </div>
            ))}
            <button className="p-5 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] flex items-center justify-center gap-2 text-slate-400 font-bold hover:text-primary hover:border-primary transition-all">
              <Icon name="add_circle" />
              <span>Nova Pasta</span>
            </button>
          </div>
        </div>
      );
      default: return <HomeView onOCR={handleOCR} history={history} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-background-dark text-slate-900 dark:text-slate-100 pb-safe overflow-hidden">
      <Navbar 
        title={
          currentScreen === 'result' ? 'Transcrição' : 
          currentScreen === 'folders' ? 'Minhas Pastas' : 
          currentScreen === 'history' ? 'Histórico' : 
          currentScreen === 'settings' ? 'Ajustes' : 'OCR-WILL Pro'
        } 
        onBack={currentScreen !== 'home' && currentScreen !== 'processing' ? () => setCurrentScreen('home') : undefined}
        rightElement={currentScreen === 'home' && (
          <button onClick={() => setCurrentScreen('settings')} className="size-10 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors active:scale-90">
            <Icon name="account_circle" />
          </button>
        )}
      />
      
      <main className="flex-1 overflow-y-auto no-scrollbar">
        {renderScreen()}
      </main>

      {currentScreen !== 'processing' && (
        <BottomNav active={currentScreen} onNavigate={setCurrentScreen} />
      )}
    </div>
  );
}