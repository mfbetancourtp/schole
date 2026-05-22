import { services } from '../../../shared/constant/services';
import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { AttachmentDto } from '../dtos/message.dto';

export interface ICreateOrUpdateMessagesService {
  notificationType: number;
  sendNotificationToMail: boolean;
  message: {
    parentMessageId: number | null;
    title: string;
    body: string;
    isDraft: boolean;
    typeMessage: null | any;
    matriculateParentsIds: number | null;
    attachments: AttachmentDto[];
  };
  receivers: {
    courses: any[];
    students: any[];
    peoples: any[];
  };
}

export class CreateOrUpdateMessagesService extends CreateOrUpdateBaseService<ICreateOrUpdateMessagesService> {
  url = `${services.communications}/messages`;
}
