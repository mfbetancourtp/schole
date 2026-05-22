import { services } from '../../../shared/constant/services';
import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';

export class CreateOrUpdateLearningOutcomesScoresService extends CreateOrUpdateBaseService<any> {
  url = `${services.classroom}/classroom-administration/learning-outcomes-scores`;
  isFormData = false;
}
