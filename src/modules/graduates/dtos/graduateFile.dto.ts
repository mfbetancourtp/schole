export type FileCategory = 'CV' | 'Portafolio' | 'Certificación' | 'Otro';

export interface GraduateFileDto {
  id: number;
  name: string;
  category: FileCategory;
  sizeKb: number;
  uploadedAt: string;
  url: string;
}
