export type ResourceInventoryStatus = 'available' | 'assigned' | 'maintenance' | 'damaged';

export interface ResourceInventoryDto {
  id: number;
  code: string;
  resourceTypeId: number;
  typeName: string;
  name: string;
  make: string;
  model: string;
  serial: string;
  status: ResourceInventoryStatus;
  purchaseDate: string;
  purchaseValue: number;
}
