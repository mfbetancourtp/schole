import axios from '../../../../shared/utils/axios';
import { services } from '../../../../shared/constant/services';
import { CreateOrUpdateBaseService } from '../../../../shared/services/createOrUpdateBase.service';

export class GenerateReportConsolidateOutcomesService extends CreateOrUpdateBaseService<any> {
  url = `${services.reports}/consolidate-outcomes-report`;
}
