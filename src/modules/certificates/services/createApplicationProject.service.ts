import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';
import type { CreateApplicationProjectDto } from '../dtos/applicationProject.dto';

export class CreateApplicationProjectService extends CreateOrUpdateBaseService<CreateApplicationProjectDto> {
  url = `${services.structure}/application-projects`;
  isFormData = false;
}
