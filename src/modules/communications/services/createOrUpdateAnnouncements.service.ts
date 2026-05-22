import { services } from '../../../shared/constant/services';
import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';

export interface ICreateOrUpdateAnnouncementsService {
  title: string;
  body: string;
}

export class CreateOrUpdateAnnouncementsService extends CreateOrUpdateBaseService<ICreateOrUpdateAnnouncementsService> {
  url = `${services.communications}/announcements`;
}
