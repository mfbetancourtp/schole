import { services } from '../../../shared/constant/services';
import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { CreateAgreementsApplicationDto } from '../dtos/agreementsApplication.dto';

export class CreateOrUpdateAgreementsApplicationService extends CreateOrUpdateBaseService<CreateAgreementsApplicationDto> {
  url = `${services.structure}/agreements-applications`;
}
