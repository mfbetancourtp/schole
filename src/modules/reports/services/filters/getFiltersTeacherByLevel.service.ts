import axios from '../../../../shared/utils/axios';
import {services} from '../../../../shared/constant/services';
import {AcademicPeriodDto} from '../../../../shared/dto/academicPeriod.dto';
import {SubjectCategorieDto} from '../../../academicPrograms/dtos/subjectCategorie.dto';

export interface IGetFiltersTeacherByLevelService {
    academicPeriods: AcademicPeriodDto[];
    subjectCategories: SubjectCategorieDto[];
    options: any;
}

export class GetFiltersTeacherByLevelService {
    async run() {
        return axios.get<IGetFiltersTeacherByLevelService>(`${services.reports}/filters/related-data-list-teachers-by-structure`)
            .then(response => response.data);
    }
}
