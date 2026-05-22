import axios from 'axios';
import { services } from '../../../../shared/constant/services';

export class GenerateDocumentoDisciplinaryOffenseService {
  run(params: any) {
    return axios
      .post<any>(
        `${services.reports}/visualize-disciplinary-offenses-by-report/${params.offenseDisciplinaryId}`
      )
      .then((response) => response.data);
  }
}
