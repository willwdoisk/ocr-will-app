
export type Screen = 'home' | 'processing' | 'result' | 'history' | 'settings' | 'folders' | 'styleguide' | 'identity';

export interface TranscriptionItem {
  id: string;
  title: string;
  content: string;
  date: string;
  time: string;
  language: string;
  image?: string;
  folderId?: string;
}

export interface Folder {
  id: string;
  name: string;
  itemCount: number;
}
