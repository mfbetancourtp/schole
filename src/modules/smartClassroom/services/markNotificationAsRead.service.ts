import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import type { NotificationDto } from '../dtos';

export class MarkNotificationAsReadService {
  async run(id: string): Promise<NotificationDto> {
    const response = await axios.patch(`${services.smartClassroom}/notifications/${id}/read`);
    return response.data as NotificationDto;
  }
}
