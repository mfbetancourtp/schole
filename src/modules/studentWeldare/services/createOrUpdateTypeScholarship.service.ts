import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';
import type { ScholarshipTypeDto } from '../dtos/scholarshipType.dto';

export class CreateOrUpdateTypeScholarshipService extends CreateOrUpdateBaseService<ScholarshipTypeDto> {
  url = `${services.structure}/type-scholarships`;
}
