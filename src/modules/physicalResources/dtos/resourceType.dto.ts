export interface ResourceTypeDto {
  id: number;
  code: string;
  name: string;
  description: string;
  resourceCategoryId: number;
  categoryName: string;
  serialIsRequired: boolean;
  isActive: boolean;
}
