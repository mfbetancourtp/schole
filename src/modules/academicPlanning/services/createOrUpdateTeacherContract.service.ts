import { services } from '../../../shared/constant/services';
import { CreateOrUpdateBaseService } from '../../../shared/services/createOrUpdateBase.service';

export interface ICreateOrUpdateTeacherContract {
  teacherId: number;
  academicPeriodId: number;
  contractTypeId: number;
}

export class CreateOrUpdateTeacherContractService extends CreateOrUpdateBaseService<ICreateOrUpdateTeacherContract> {
  url = `${services.academic}/planning/teacher-contracts`;
}
