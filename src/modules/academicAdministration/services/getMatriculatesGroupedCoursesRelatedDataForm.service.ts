import {ParamsPaginationDto} from '../../../shared/dto/paramsPagination.dto';
import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

export class GetMatriculatesGroupedCoursesRelatedDataFormService {
    run() {
        return axios.get(`${services.academic}/academic-administration/matriculates-grouped-courses-related-data-form`)
            .then(response => response.data);
    }
}