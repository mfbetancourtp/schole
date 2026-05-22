import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';
import { UpsertJobVacancyRequest } from '../dtos/vacancy.dto';

export class CreateOrUpdateJobVacancyService extends CreateOrUpdateBaseService<UpsertJobVacancyRequest> {
  url = `${services.graduates}/job-vacancies`;
  isFormData = false;
}
