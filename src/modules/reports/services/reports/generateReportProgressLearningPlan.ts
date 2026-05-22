import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';
import { CreateOrUpdateBaseService } from '../../../../shared/services/createOrUpdateBase.service';

export class GenerateReportProgressLearningPlanService extends CreateOrUpdateBaseService<any> {
  url = `${services.reports}/learning-plan-report`;
}
