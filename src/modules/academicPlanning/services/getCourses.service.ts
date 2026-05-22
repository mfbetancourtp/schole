import axios from '../../../shared/utils/axios';
import {services} from '../../../shared/constant/services';
import { CopyAcademicOfferDto } from '../dtos/copyAcademicOffer.dto';

export class GetCoursesService {
    run(academicPeriodId: any) {
        return axios.get<CopyAcademicOfferDto[]>(`${services.academic}/academic-planning/academic-period-groups-by-academic-period-id/${academicPeriodId}`)
            .then(response => response.data);
    }
}