import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';
import { services } from '../../../shared/constant/services';

export interface IParams {
  periodId: number | null;
  name: string | null;
  extendedStartDateTime: string | null;
  extendedEndDateTime: string | null;
  courses: any | null;
}

export class CreateOrUpdateExtraordinaryGradePeriodService extends CreateOrUpdateBaseService<IParams> {
  url = `${services.academic}/academic-planning/extraordinary-grade-periods`;
}
