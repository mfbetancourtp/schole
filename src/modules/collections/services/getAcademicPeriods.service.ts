import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { AcademicPeriodDto } from '../dtos/portfolioMonitoring.dto';

export class GetAcademicPeriodsService {
    run() {
        return axios.get<AcademicPeriodDto[]>(`${services.academic}/academic-planning/academic-periods`)
            .then(response => response.data);
    }
}