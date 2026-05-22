import { services } from '../../../shared/constant/services';
import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';

export interface CreateOrUpdateAgreementInstitutionalDocumentDto {
  agreementsInstitutionalId: number;
  name: string;
  required: number;
}

export class CreateOrUpdateAgreementInstitutionalDocumentService extends CreateOrUpdateBaseService<CreateOrUpdateAgreementInstitutionalDocumentDto> {
  url = `${services.structure}/agreements-institutional-documents`;
}
