import axios from 'axios';
import { services } from '../../../../shared/constant/services';

export class GetDisciplinaryOffensesOffensesByUsersService {
  run(params: any) {
    return axios
      .get<any>(
        `${services.classroom}/disciplinary-control/disciplinary-offenses-by-user`,
        { params }
      )
      .then((response) => response.data);
  }
}
