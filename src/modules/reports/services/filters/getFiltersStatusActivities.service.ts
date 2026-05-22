import axios from '../../../../shared/utils/axios';
import {services} from '../../../../shared/constant/services';
import {AcademicPeriodDto} from '../../../../shared/dto/academicPeriod.dto';
import {SubjectCategorieDto} from '../../../academicPrograms/dtos/subjectCategorie.dto';

export interface IGetFiltersStatusActivitiesService {
    academicPeriods: AcademicPeriodDto[];
    subjectCategories: SubjectCategorieDto[];
}

export class GetFiltersStatusActivitiesService {
    async run() {
        return axios.get<IGetFiltersStatusActivitiesService>(`${services.reports}/filters/related-data-status-activities`)
            .then(response => response.data);
    }
}