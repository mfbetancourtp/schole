import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { VacancyDto } from '../dtos/vacancy.dto';
import { services } from '../../../shared/constant/services';

export class CreateVacancyService extends CreateOrUpdateBaseService<VacancyDto> {
  url = `${services.graduates}/vacancies`;
  isFormData = false;
}
