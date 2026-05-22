export interface LanguageCatalogItemDto {
  id: number;
  name: string;
  key: string;
  isActive: number;
}

export type LanguageLevel = 'Básico' | 'Intermedio' | 'Avanzado' | 'Nativo';

export interface LanguageDto {
  id: number;
  languageId?: number;
  language: string;
  code: string;
  readingLevel: LanguageLevel;
  writingLevel: LanguageLevel;
  conversationLevel: LanguageLevel;
}
