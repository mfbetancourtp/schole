import { services } from '../../../shared/constant/services';
import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { ProgramConfigurationDto } from '../dtos/academicPeriodProgram.dto';

export class CreateOrUpdateProgramConfigurationService extends CreateOrUpdateBaseService<ProgramConfigurationDto> {
  url = `${services.academic}/academic-period-programs`;
  isFormData = false;
}
