import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class CountParentsSendMailDisciplinaryOffenseService {
    run(disciplinaryOffenseId: number) {
        return axios.get<any>(`${services.classroom}/disciplinary-control/disciplinary-control/count-parents-by-disciplinary-offense-id/${disciplinaryOffenseId}`)
            .then((response) => response.data);
    }
}