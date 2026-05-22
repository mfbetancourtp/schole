import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetStudentByIdentificationService {
    run(identification: string) {
        return axios.get(`${services.academic}/academic-administration/matriculates/student-by-identification/${identification}`)
            .then(response => response.data);
    }
}