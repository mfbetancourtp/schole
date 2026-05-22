import axios from '../../../shared/utils/axios';

import { services } from '../../../shared/constant/services';

import { ParamsGetDirectorObservationsByStudentDto } from '../dtos/observerByUserId.dto';

export class GetDirectorObservationsByStudentUserIdService {
  run(params: ParamsGetDirectorObservationsByStudentDto) {
    return axios.get<any>(`${services.classroom}/classroom-administration/courses/director-observations-by-student-user-id/${params.userId}`, { params }).then((response) => response.data);
  }
}
