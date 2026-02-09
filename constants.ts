
import { TranscriptionItem, Folder } from './types';

export const MOCK_TRANSCRIPTIONS: TranscriptionItem[] = [
  {
    id: '1',
    title: 'Notas da Proposta do Projeto',
    content: '"Os objetivos principais para o roteiro do Q4 envolvem..."',
    date: '24 Out',
    time: '10:30',
    language: 'Inglês',
    image: 'https://picsum.photos/seed/doc1/200/200'
  },
  {
    id: '2',
    title: 'Recibo Jantar - Barcelona',
    content: '"Total a pagar: 45.50€ Gracias por su visita..."',
    date: '23 Out',
    time: '16:15',
    language: 'Espanhol',
    image: 'https://picsum.photos/seed/doc2/200/200'
  },
  {
    id: '3',
    title: 'Relatório Financeiro Q3',
    content: 'Análise detalhada do terceiro trimestre fiscal...',
    date: '22 Out',
    time: '14:30',
    language: 'Inglês',
    image: 'https://picsum.photos/seed/doc3/200/200'
  }
];

export const MOCK_FOLDERS: Folder[] = [
  { id: 'f1', name: 'Prompts Imagens', itemCount: 12 },
  { id: 'f2', name: 'Prompts Vídeos', itemCount: 5 },
  { id: 'f3', name: 'Prompts Redes Sociais', itemCount: 8 },
  { id: 'f4', name: 'Temporários', itemCount: 2 },
  { id: 'f5', name: 'Diversos', itemCount: 15 }
];
