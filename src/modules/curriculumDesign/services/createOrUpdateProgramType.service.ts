import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';
import { ProgramTypeDto } from '../dtos/ProgramTypeDto';

export class CreateOrUpdateProgramTypeService extends CreateOrUpdateBaseService<ProgramTypeDto> {
  url = `${services.structure}/program-types`;
  isFormData = false;
}
