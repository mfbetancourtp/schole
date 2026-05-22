import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

export class UploadFileStepDocumentService extends CreateOrUpdateBaseService<any> {
  url = `${services.academic}/academic-planning/convocation-enrol-documents`;
  isFormData = true;
}
