import { CreateOrUpdateBaseService } from '../../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../../shared/constant/services';
import { CurriculumsDto } from '../../dtos/studyPlan/Curriculums.dto';

export class CreateOrUpdateCurriculumService extends CreateOrUpdateBaseService<CurriculumsDto> {
  url = `${services.academic}/academic-programs/curriculums`;
}
