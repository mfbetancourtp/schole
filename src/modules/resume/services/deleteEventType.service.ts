import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class DeleteEventTypeService {
  async run(groupId: number): Promise<void> {
    await axios.delete(`${services.structure}/events-types/${groupId}`);
  }
}
