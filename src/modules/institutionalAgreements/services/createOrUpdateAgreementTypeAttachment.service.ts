import { services } from '../../../shared/constant/services';
import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { CreateAgreementTypeAttachmentDto } from '../dtos/agreementTypeAttachment.dto';

export class CreateOrUpdateAgreementTypeAttachmentService extends CreateOrUpdateBaseService<CreateAgreementTypeAttachmentDto> {
  url = `${services.structure}/agreements-types-attachments`;
}
