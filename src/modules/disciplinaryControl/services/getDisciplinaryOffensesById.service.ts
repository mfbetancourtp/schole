import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetDisciplinaryOffensesByIdService {
    run(disciplinaryOffenseId: any) {
        return axios.get<any>(`${services.classroom}/disciplinary-control/disciplinary-offenses/${disciplinaryOffenseId}`)
            .then((response) => response.data);
    }
}