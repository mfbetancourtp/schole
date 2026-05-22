import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteEventRolesService {
  async run(groupId: number): Promise<void> {
    await axios.delete(`${services.structure}/events-roles/${groupId}`);
  }
}
