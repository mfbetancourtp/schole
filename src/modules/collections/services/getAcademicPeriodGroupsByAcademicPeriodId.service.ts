import axios from '../../../shared/utils/axios';
import { services } from '../../../shared/constant/services';
import { AcademicPeriodGroupDto } from '../dtos/portfolioMonitoring.dto';

export class GetAcademicPeriodGroupsByAcademicPeriodIdService {
    run(academicPeriodId: number) {
        return axios.get<AcademicPeriodGroupDto[]>(`${services.academic}/academic-planning/academic-period-groups-by-academic-period-id/${academicPeriodId}`)
            .then(response => response.data);
    }
}