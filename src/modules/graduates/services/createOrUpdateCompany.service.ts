import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { CreateOrUpdateCompanyDto } from '../dtos/company.dto';
import { services } from '../../../shared/constant/services';

export class CreateOrUpdateCompanyService extends CreateOrUpdateBaseService<CreateOrUpdateCompanyDto> {
  url = `${services.graduates}/companies`;
  isFormData = false;
}
