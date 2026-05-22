import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { ParamsPaginationDto } from '../../../shared/dto/paramsPagination.dto';

interface IParams extends ParamsPaginationDto {
  subjectAssignmentId: number;
}

export class GetMatriculateSubjectsWithPaginateAllPeriodNotesService {
  run(params: IParams) {
    return axios.get(`${services.academic}/academic-administration/matriculate-subjects-with-all-period-notes`, { params }).then((response) => response.data.matriculateSubjects);
  }
}
