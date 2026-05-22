import { services } from '../../../shared/constant/services';
import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';

export interface ICreateFilesUploadService {
  // name: string;
  file: any;
}

export class CreateFilesUploadService extends CreateOrUpdateBaseService<ICreateFilesUploadService> {
  url = `${services.files}/upload`;
  isFormData = true;
}
