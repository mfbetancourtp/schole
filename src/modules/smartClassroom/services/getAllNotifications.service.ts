import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { NotificationDto } from '../dtos';

export class GetAllNotificationsService {
  async run(): Promise<NotificationDto[]> {
    const response = await axios.get(`${services.smartClassroom}/notifications`);
    const data = response.data;
    if (!Array.isArray(data)) return [];
    // Ordenar por fecha más reciente primero
    return (data as NotificationDto[]).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}
