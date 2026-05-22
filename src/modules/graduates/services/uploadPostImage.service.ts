import { services } from '../../../shared/constant/services';
import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';

export interface UploadPostImageRequest {
  file: File;
}

export class UploadPostImageService extends CreateOrUpdateBaseService<UploadPostImageRequest> {
  url = `${services.graduates}/posts/upload-image`;
  isFormData = true;
}
