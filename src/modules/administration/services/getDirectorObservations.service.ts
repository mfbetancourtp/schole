import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { ObservationGeneralDto } from '../dtos/observationGeneral.dto';

export interface IParams {
  academicPeriodGroupId: number;
  periodId?: number;
}

export class GetDirectorObservationsService {
  run(params: IParams) {
    return axios
      .get<ObservationGeneralDto>(`${services.classroom}/classroom-administration/courses/directorObservations/getStudents`, {
        params,
      })
      .then((response) => response.data);
  }
}
