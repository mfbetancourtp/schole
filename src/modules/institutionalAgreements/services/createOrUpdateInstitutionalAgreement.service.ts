import { services } from '../../../shared/constant/services';
import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { CreateOrUpdateInstitutionalAgreementDto } from '../dtos/institutionalAgreement.dto';

export class CreateOrUpdateInstitutionalAgreementService extends CreateOrUpdateBaseService<CreateOrUpdateInstitutionalAgreementDto> {
  url = `${services.structure}/agreements-institutional`;
}
