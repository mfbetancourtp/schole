import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { ParamsPaginationDto } from '../../../shared/dto/paramsPagination.dto';

interface IParams extends ParamsPaginationDto {
    academicPeriodId: number;
    academicPeriodGroupId: number;
}

export class GetBalancesPendingPerStudentService {
    run(params: IParams) {
        return axios.get(`${services.casurid}/payments/balances-pending-per-student`, { params })
            .then((response) => response.data);
    }
}