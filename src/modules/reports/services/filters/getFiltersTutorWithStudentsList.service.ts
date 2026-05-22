import axios from '../../../../shared/utils/axios';
import {services} from '../../../../shared/constant/services';
import {AcademicPeriodDto} from '../../../../shared/dto/academicPeriod.dto';
import {StudentCategoryDto} from '../../../../shared/dto/studentCategory.dto';

export interface IGetFiltersTutorWithStudentsListService {
    academicPeriods: AcademicPeriodDto[];
    studentCategories: StudentCategoryDto[];
    optionsStudent: any;
    optionsTutor: any;
}

export class GetFiltersTutorWithStudentsListService {
    async run() {
        return axios.get<IGetFiltersTutorWithStudentsListService>(`${services.reports}/filters/related-data-list-students-by-structure`)
            .then(response => response.data);
    }
}
