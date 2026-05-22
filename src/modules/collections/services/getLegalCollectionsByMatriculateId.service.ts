import { ParamsPaginationDto } from '../../../shared/dto/paramsPagination.dto';
import { services } from '../../../shared/constant/services';
import axios from '../../../shared/utils/axios';

interface IParams extends ParamsPaginationDto {
    matriculateId: number
}

export class GetLegalCollectionsByMatriculateIdService {
    run(params: IParams) {
        return axios.get(`${services.collections}/matriculate/${params.matriculateId}/legal-collections`, { params })
            .then(response => response.data);
    }
}