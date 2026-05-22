import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { PhysicalStructureNodeDto } from '../dtos/physicalStructure.dto';

const BASE = services.structure;

export class GetBuildingsByCampusService {
  async run(campusId: number): Promise<PhysicalStructureNodeDto[]> {
    try {
      const r = await axios.get(`${BASE}/buildings`, {
        params: { campusId, noPag: true },
      });
      const data = r.data;
      const list = Array.isArray(data) ? data : data?.data ?? [];
      return list.map((b: any) => ({
        id: b._id ?? b.id,
        code: b.code ?? '',
        name: b.name ?? '',
        levelType: 'Edificio' as const,
        parentId: campusId,
        isActive: b.isActive === 1 || b.isActive === true,
        description: b.description ?? '',
        children: [],
      }));
    } catch (e) {
      console.error(`GetBuildingsByCampusService: error al obtener edificios del campus ${campusId}`, e);
      return [];
    }
  }
}
