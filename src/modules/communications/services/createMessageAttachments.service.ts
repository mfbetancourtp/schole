import { services } from '../../../shared/constant/services';
import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';

export interface ICreateMessageAttachmentsService {
  messageId: number;
  file: any;
}

export class CreateMessageAttachmentsService extends CreateOrUpdateBaseService<ICreateMessageAttachmentsService> {
  url = `${services.communications}/message-attachments`;
}
