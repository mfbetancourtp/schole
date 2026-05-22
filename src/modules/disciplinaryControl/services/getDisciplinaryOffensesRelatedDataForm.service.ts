import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetDisciplinaryOffensesRelatedDataFormService {
  run(params: any) {
    return axios
      .get<any>(
        `${services.classroom}/disciplinary-control/disciplinary-offenses/related-data-form-teacher`,
        { params }
      )
      .then((response) => response.data);
  }
}
