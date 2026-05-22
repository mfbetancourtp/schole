import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { PhysicalStructureNodeDto } from '../dtos/physicalStructure.dto';

const BASE = services.structure;

export const getBuildings = (): Promise<any[]> =>
  axios.get(`${BASE}/buildings`).then((r) => {
    const data = r.data;
    return Array.isArray(data) ? data : data?.data ?? [];
  });

export const getFloors = (): Promise<any[]> =>
  axios.get(`${BASE}/floors`).then((r) => {
    const data = r.data;
    return Array.isArray(data) ? data : data?.data ?? [];
  });

export const getPhysicalStructure = async (): Promise<PhysicalStructureNodeDto[]> => {
  const [buildings, floors] = await Promise.all([getBuildings(), getFloors()]);

  // Map buildings to tree nodes
  return buildings.map((b: any) => ({
    id: b._id ?? b.id,
    code: b.code ?? '',
    name: b.name ?? '',
    levelType: 'Edificio' as const,
    parentId: b.campusId ?? null,
    isActive: b.isActive === 1 || b.isActive === true,
    description: b.description ?? '',
    children: floors
      .filter((f: any) => (f.buildingId ?? f.building_id) === (b._id ?? b.id))
      .map((f: any) => ({
        id: f._id ?? f.id,
        code: f.code ?? '',
        name: f.name ?? '',
        levelType: 'Piso' as const,
        parentId: f.buildingId ?? f.building_id ?? null,
        isActive: f.isActive === 1 || f.isActive === true,
        description: f.description ?? '',
        children: [],
      })),
  }));
};
