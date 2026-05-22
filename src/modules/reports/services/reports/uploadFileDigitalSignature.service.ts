import { CreateOrUpdateBaseService } from '../../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../../shared/constant/services';

export interface ICreateDigitalSignaturesService {
  digitalSignatureId: number | null;
}

export class UploadFileDigitalSignatureService extends CreateOrUpdateBaseService<ICreateDigitalSignaturesService> {
  url = `${services.reports}/digital-signature/update-logo`;
  isFormData = true;
}
