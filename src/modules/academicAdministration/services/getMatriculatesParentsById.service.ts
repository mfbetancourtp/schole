import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetMatriculatesParentsByIdService {
    run(matriculateId: any) {
        return axios.get(`${services.academic}/academic-administration/matriculate-parents/${matriculateId}`)
            .then(response => response.data);
    }
}