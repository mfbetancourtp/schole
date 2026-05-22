import axios from '../../../../shared/utils/axios';
import {services} from '../../../../shared/constant/services';
import {AcademicPeriodDto} from '../../../../shared/dto/academicPeriod.dto';
import {StudentCategoryDto} from '../../../../shared/dto/studentCategory.dto';

export interface IGetFiltersDisciplinaryRecordService {
    academicPeriods: AcademicPeriodDto[];
    studentCategories: StudentCategoryDto[];
}

export class GetFiltersDisciplinaryRecordService {
    async run() {
        return axios.get<IGetFiltersDisciplinaryRecordService>(`${services.reports}/filters/related-data-disciplinary-history`).then(response => response.data);
    }
}
