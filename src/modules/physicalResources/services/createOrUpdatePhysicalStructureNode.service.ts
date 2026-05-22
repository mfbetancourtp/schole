import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

const BASE = services.structure;

export class CreateOrUpdatePhysicalStructureNodeService {
  /**
   * Routes to the correct endpoint based on levelType.
   * - 'Edificio' → /structure/buildings  (requires campusId)
   * - 'Piso'     → /structure/floors     (requires buildingId)
   */
  async run(data: any, id?: number): Promise<any> {
    const levelType = data.levelType ?? 'Edificio';
    const isFloor = levelType === 'Piso';
    const url = isFloor ? `${BASE}/floors` : `${BASE}/buildings`;

    const payload: any = {
      name: data.name,
      code: data.code,
      description: data.description ?? '',
      isActive: data.isActive !== undefined ? data.isActive : true,
    };

    if (isFloor) {
      payload.buildingId = data.parentId ?? data.buildingId ?? null;
    } else {
      // Edificio requires the campusId of its parent Campus (campus = sede)
      payload.campusId = data.parentId ?? data.campusId ?? null;
    }

    if (id !== null && id !== undefined) {
      return axios.put(`${url}/${id}`, payload).then((r) => r.data);
    } else {
      return axios.post(url, payload).then((r) => r.data);
    }
  }
}
