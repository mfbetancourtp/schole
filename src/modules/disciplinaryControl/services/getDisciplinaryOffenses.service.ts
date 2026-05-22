import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetDisciplinaryOffensesService {
    run(params: any) {
        return axios.get<any>(`${services.classroom}/disciplinary-control/disciplinary-offenses`, {params})
            .then((response) => response.data);
    }
}