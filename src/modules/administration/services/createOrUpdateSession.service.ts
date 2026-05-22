import { services } from '../../../shared/constant/services';
import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';

export interface ICreateOrUpdateSessionService {
  planningWeekId: number | null;
  courseId: number;
  dateSince: string;
  dateUntil: string;
  name: string | null;
  topicIds: any[];
}

export class CreateOrUpdateSessionService extends CreateOrUpdateBaseService<ICreateOrUpdateSessionService> {
  url = `${services.classroom}/classroom-implementation/sessions`;
}
