import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';
import { CreateOrUpdateBaseService } from '../../../../shared/services/createOrUpdateBase.service';

export class GenerateReportFinalPerformanceEvaluationService extends CreateOrUpdateBaseService<any> {
  url = `${services.reports}/final-performance-evaluation`;
}
