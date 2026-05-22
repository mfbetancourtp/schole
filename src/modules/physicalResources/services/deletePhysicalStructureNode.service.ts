import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

const BASE = services.structure;

export class DeletePhysicalStructureNodeService {
  /**
   * Deletes a building or floor based on the entity type.
   * @param id - entity ID
   * @param levelType - 'Edificio' or 'Piso' (defaults to 'Edificio')
   */
  run(id: number, levelType: string = 'Edificio') {
    const isFloor = levelType === 'Piso';
    const url = isFloor ? `${BASE}/floors/${id}` : `${BASE}/buildings/${id}`;
    return axios.delete(url).then((r) => r.data);
  }
}
