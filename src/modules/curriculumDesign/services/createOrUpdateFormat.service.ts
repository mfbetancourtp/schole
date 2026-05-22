import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';
import { CurriculumFormatDto } from '../dtos/CurriculumFormatDto';

export class CreateOrUpdateFormatService extends CreateOrUpdateBaseService<CurriculumFormatDto> {
  url = `${services.structure}/annexes`;
  isFormData = false;
}
