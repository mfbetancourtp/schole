import axios from '../../../../shared/utils/axios';
import {services} from '../../../../shared/constant/services';

export interface IGetFiltersStudentInformationService {
    options: any;
}

export class GetFiltersStudentInformationService {
    async run() {
        return axios.get<IGetFiltersStudentInformationService>(`${services.reports}/filters/related-data-student-information`)
            .then(response => response.data);
    }
}
