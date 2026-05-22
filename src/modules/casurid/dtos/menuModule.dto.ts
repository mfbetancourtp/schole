export interface MenuModuleDto {
  id: number;
  name: string;
  description: string | null;
  route: string;
  icon: string | null;
  cssClass: string | null;
  order: number;
  internalBase: number;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface CreateOrUpdateMenuModuleDto {
  name: string;
  description: string | null;
  route: string;
  icon: string | null;
  cssClass: string | null;
  order: number;
  internalBase: number;
}

export type MenuModuleRouteState = 'withRoute' | 'withoutRoute';
