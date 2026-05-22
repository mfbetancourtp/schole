export interface SpaceDto {
  id: number;
  code: string;
  name: string;
  spaceTypeId: number;
  spaceTypeName: string;
  hierarchicalPath: string;
  capacity: number | null;
  area: number | null;
  isActive: boolean;
  campusId: number | null;
  campusName: string;
  sedeId: number | null;
  sedeName: string;
  buildingId: number | null;
  buildingName: string;
  floorId: number | null;
  floorName: string;
  responsibleUserId: number | null;
  responsibleName: string;
}

export interface SpaceTypeOption {
  id: number;
  name: string;
}

export interface LocationOption {
  id: number;
  name: string;
  parentId?: number | null;
}

export interface ResponsibleOption {
  id: number;
  name: string;
}
