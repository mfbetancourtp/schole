import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { PhysicalStructureNodeDto } from '../dtos/physicalStructure.dto';

const BASE = services.structure;

export class GetCampusesService {
  async run(): Promise<PhysicalStructureNodeDto[]> {
    try {
      const r = await axios.get(`${BASE}/campuses`, {
        params: { noPag: true },
      });
      const data = r.data;
      const list = Array.isArray(data) ? data : data?.data ?? [];
      return list.map((c: any) => ({
        id: c._id ?? c.id,
        code: c.code ?? '',
        name: c.name ?? '',
        levelType: 'Campus' as const,
        parentId: null,
        isActive: c.isActive === 1 || c.isActive === true,
        description: c.description ?? '',
        children: [],
      }));
    } catch (e) {
      console.error('GetCampusesService: error al obtener campus', e);
      return [];
    }
  }
}
