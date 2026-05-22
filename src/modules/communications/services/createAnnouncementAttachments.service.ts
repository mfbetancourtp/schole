import { services } from '../../../shared/constant/services';
import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';

export interface ICreateAnnouncementAttachmentsService {
  announcementId: number;
  name: string;
  file: any;
}

export class CreateAnnouncementAttachmentsService extends CreateOrUpdateBaseService<ICreateAnnouncementAttachmentsService> {
  url = `${services.communications}/announcement-attachments`;
  isFormData = true;
}
