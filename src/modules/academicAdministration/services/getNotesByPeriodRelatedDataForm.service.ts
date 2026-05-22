import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetNotesByPeriodRelatedDataFormService {
    run(params: any) {
        return axios.get(`${services.academic}/academic-administration/matriculate-subjects-with-notes-related-data-form`,{params})
            .then(response => response.data);
    }
}