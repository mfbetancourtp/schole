// import {ParamsPaginationDto} from '../../../shared/dto/paramsPagination.dto';
import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';

// interface IParams extends ParamsPaginationDto {
interface IParams {
    levelId: number;
    degreeId: number;
}

export class GetContentPlanByInstitutionIdService {
    run(InstitutionId: string, params?: IParams) {
        return axios.get(`${services.casurid}/purchases/admin/${InstitutionId}/product-contents`, {
            params,
        }).then(response => response.data);
    }
}