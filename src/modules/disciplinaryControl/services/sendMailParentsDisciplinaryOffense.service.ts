import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';

export class SendMailParentsDisciplinaryOffenseService {
  run(disciplinaryOffenseId: number) {
    return axios.get<any>(`${services.classroom}/disciplinary-control/view-disciplinary-offenses/${disciplinaryOffenseId}`).then((response) => response.data);
  }
}
