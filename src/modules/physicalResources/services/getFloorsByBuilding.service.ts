import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { PhysicalStructureNodeDto } from '../dtos/physicalStructure.dto';

const BASE = services.structure;

export class GetFloorsByBuildingService {
  async run(buildingId: number): Promise<PhysicalStructureNodeDto[]> {
    try {
      const r = await axios.get(`${BASE}/floors`, {
        params: { buildingId, noPag: true },
      });
      const data = r.data;
      const list = Array.isArray(data) ? data : data?.data ?? [];
      return list.map((f: any) => ({
        id: f._id ?? f.id,
        code: f.code ?? '',
        name: f.name ?? '',
        levelType: 'Piso' as const,
        parentId: buildingId,
        isActive: f.isActive === 1 || f.isActive === true,
        description: f.description ?? '',
        children: [],
      }));
    } catch (e) {
      console.error(`GetFloorsByBuildingService: error al obtener pisos del edificio ${buildingId}`, e);
      return [];
    }
  }
}
