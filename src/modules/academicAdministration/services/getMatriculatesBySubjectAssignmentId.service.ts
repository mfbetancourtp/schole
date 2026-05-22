import {ParamsPaginationDto} from '../../../shared/dto/paramsPagination.dto';
import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

interface IParams extends ParamsPaginationDto {
    subjectAssignmentId: number;
}
export class GetMatriculatesBySubjectAssignmentIdService {
    run(params: IParams) {
        return axios.get(`${services.academic}/academic-administration/matriculates/by-subject-assignment`,{
            params,
        })
.then(response => response.data);
    }
}




