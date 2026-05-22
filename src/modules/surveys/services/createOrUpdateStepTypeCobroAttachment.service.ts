import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

export class CreateOrUpdateStepTypeCobroAttachmentService extends CreateOrUpdateBaseService<any> {
  url = `${services.payments}/web-checkout-and-cash`;
  isFormData = true;
}
