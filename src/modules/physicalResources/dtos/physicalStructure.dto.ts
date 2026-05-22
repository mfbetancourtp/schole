export interface PhysicalStructureNodeDto {
  id: number;
  code: string;
  name: string;
  levelType: 'Campus' | 'Edificio' | 'Piso';
  parentId: number | null;
  isActive: boolean;
  description?: string;
  children?: PhysicalStructureNodeDto[];
}
