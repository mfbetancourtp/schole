import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';
import { AcademicPeriodDto } from '../../../shared/dto/academicPeriod.dto';

export class AcademicPeriodsForConvocationsService {
    async run(institutionId: any) {
        return axios.get<AcademicPeriodDto[]>(`${services.academic}/academic-planning/academic-periods-for-convocations?institutionId=${institutionId}`)
            .then(response => response.data);
    }
}