import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { Room } from '../dtos';

export class GetAllRoomsService {
  async run(): Promise<Room[]> {
    const response = await axios.get(`${services.smartClassroom}/rooms`);
    const data = response.data;
    if (Array.isArray(data)) return data as Room[];
    return [];
  }
}
