import { services } from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';

export class DeleteEventByIdService {
  async run(eventId: number): Promise<void> {
    await axios.delete(`${services.configurations}/events/${eventId}`);
  }
}