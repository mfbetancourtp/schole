import {ParamsPaginationDto} from '../../../shared/dto/paramsPagination.dto';
import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

interface IParams extends ParamsPaginationDto {
    academicPeriodId: number;
}

export class GetMatriculatesGroupedCoursesService {
    run(params: IParams) {
        return axios.get(`${services.academic}/academic-administration/matriculates-grouped-courses`, {
            params,
        }).then(response => response.data);
    }
}