import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetFiltersOffensesService {
  run() {
    return axios.get<any>(`${services.classroom}/disciplinary-control/disciplinary-offenses/related-data-form-filter`).then((response) => response.data);
  }
}
