import { CreateOrUpdateBaseService } from '../../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../../shared/constant/services';
import { DegreeDto } from '../../dtos/programs/degree.dto';

export class CreateOrUpdateDegreeServices extends CreateOrUpdateBaseService<DegreeDto[]> {
  url = `${services.academic}/academic-programs/degrees-batch`;
}
