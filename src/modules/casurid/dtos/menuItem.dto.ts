export interface MenuItemPermissionDto {
  id: number;
  action: string;
}

export interface MenuPermissionTranslationDto {
  languageId: number;
  value: string;
}

export interface MenuPermissionDto {
  id: number;
  name: string;
  class: string | null;
  icon: string | null;
  action: string;
  scope: string | null;
  isPrincipal: number;
  translations: MenuPermissionTranslationDto[];
}

export interface MenuItemDto {
  id: number;
  itemParentId: number | null;
  moduleId: number;
  code: string;
  name: string;
  route: string | null;
  icon: string | null;
  cssClass: string | null;
  showMenu: number;
  isReport: number;
  isActive: number;
  order: number;
  isRequired: number;
  createdAt: string | null;
  updatedAt: string | null;
  permissions: MenuItemPermissionDto[];
  children: MenuItemDto[];
}

export interface CreateOrUpdateMenuItemDto {
  itemParentId?: number;
  moduleId: number;
  code: string;
  name: string;
  route: string | null;
  icon: string | null;
  cssClass: string | null;
  showMenu: number;
  isReport: number;
  isActive: number;
  order: number;
  isRequired: number;
  permissions: number[];
}

export interface MenuItemTreeOptionDto {
  id: number;
  moduleId: number;
  name: string;
  code: string;
  depth: number;
  treeLabel: string;
  moduleName: string;
}

export interface MenuItemViewDto extends MenuItemDto {
  depth: number;
  moduleName: string;
  children: MenuItemViewDto[];
}
