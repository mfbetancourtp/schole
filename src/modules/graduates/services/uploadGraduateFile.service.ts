import { services } from '../../../shared/constant/services';
import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';

export interface IUploadGraduateFileService {
  file: File;
  peopleId: number;
}

export class UploadGraduateFileService extends CreateOrUpdateBaseService<IUploadGraduateFileService> {
  url = `${services.graduates}/files`;
  isFormData = true;
}
