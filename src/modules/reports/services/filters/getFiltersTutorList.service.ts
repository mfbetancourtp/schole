import axios from '../../../../shared/utils/axios';
import {services} from '../../../../shared/constant/services';
import {AcademicPeriodDto} from '../../../../shared/dto/academicPeriod.dto';
import {StudentCategoryDto} from '../../../../shared/dto/studentCategory.dto';

export interface IGetFiltersTutorListService {
    academicPeriods: AcademicPeriodDto[];
    studentCategories: StudentCategoryDto[];
    options: any;
}

export class GetFiltersTutorListService {
    async run() {
        return axios.get<IGetFiltersTutorListService>(`${services.reports}/filters/related-data-list-tutors-by-structure`)
            .then(response => response.data);
    }
}
