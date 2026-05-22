import { services } from '../../../shared/constant/services';
import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';

export class CreateOrUpdateLearningOutcomesService extends CreateOrUpdateBaseService<any> {
  url = `${services.academic}/learning-outcomes`;
  isFormData = false;
}
