import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

import { RelaDataFormFutureAbsencesDto } from '../dtos/futureAbsences.dto';

export class GetRelaDataFormFutureAbsencesService {
  run(params: { academicPeriodGroupId?: string } = {}) {
    return axios.get<RelaDataFormFutureAbsencesDto>(`${services.classroom}/classroom-implementation/related-data-form-future-absences`, { params }).then((response) => response.data);
  }
}
