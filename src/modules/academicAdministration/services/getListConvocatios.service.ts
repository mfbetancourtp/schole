import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class GetListConvocationsService {
  run() {
    return axios
      .get(
        `${services.academic}/academic-planning/convocations
        `
      )
      .then((response) => response.data);
  }
}
