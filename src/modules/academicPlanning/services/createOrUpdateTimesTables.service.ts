import { services } from '../../../shared/constant/services';
import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';

// export interface ICreateOrUpdateAcademicPeriodGroupsService {
//     name: string;
//     curriculumId: number;
//     calendarTypeId: number;
//     startDate: string;
//     endDate: string;
//     active: boolean;
// }

export class CreateOrUpdateTimesTablesService extends CreateOrUpdateBaseService<any> {
  url = `${services.classroom}/classroom-implementation/time-tables`;
  isFormData = false;
}
