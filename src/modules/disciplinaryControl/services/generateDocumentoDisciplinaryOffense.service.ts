import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

interface IParams {
  itemId: number;
}
export class GenerateDocumentoDisciplinaryOffenseService {
  run(offenseDisciplinaryId: number, params?: IParams) {
    return axios.get<any>(`${services.classroom}/disciplinary-control/visualize-disciplinary-offenses/${offenseDisciplinaryId}`, { params }).then((response) => response.data);
  }
}
