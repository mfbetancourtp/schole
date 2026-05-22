import { services } from '../../../shared/constant/services';
import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';

export interface ICreateTemplatesImagesService {
  certificateTemplateId: number;
  url: string;
  type: string;
}

export class CreateTemplatesImagesService extends CreateOrUpdateBaseService<ICreateTemplatesImagesService> {
  url = `${services.certificates}/templates/images`;
  isFormData = false;
}
