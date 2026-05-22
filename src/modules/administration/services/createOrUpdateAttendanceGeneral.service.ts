import { services } from '../../../shared/constant/services';
import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';

export interface ICreateOrUpdateAttendanceGeneralService {
  planningWeekId: number | null;
  academicPeriodGroupId: number | null;
  dateSince: string;
  dateUntil: string;
  name: string | null;
  isGeneral: number;
}

export class CreateOrUpdateAttendanceGeneralService extends CreateOrUpdateBaseService<ICreateOrUpdateAttendanceGeneralService> {
  url = `${services.classroom}/classroom-implementation/sessions-general-with-attendances`;
}
