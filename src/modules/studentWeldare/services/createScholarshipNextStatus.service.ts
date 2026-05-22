import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

interface CreateNextStatusDto {
  scholarshipStatusId: number;
  nextStepId: number;
}

export class CreateScholarshipNextStatusService extends CreateOrUpdateBaseService<CreateNextStatusDto> {
  url = `${services.structure}/scholarship-next-statuses`;
  isFormData = false;
}
