import axios from '../../../../shared/utils/axios';
import {services} from '../../../../shared/constant/services';
import {AcademicPeriodDto} from '../../../../shared/dto/academicPeriod.dto';
import {StudentCategoryDto} from '../../../../shared/dto/studentCategory.dto';

export interface IGetFiltersAnnouncementsReceptionService {
    academicPeriods: AcademicPeriodDto[];
    studentCategories: StudentCategoryDto[];
}

export class GetFiltersAnnouncementsReceptionService {
    async run() {
        return axios.get<IGetFiltersAnnouncementsReceptionService>(`${services.reports}/filters/related-data-receipt-announcements`)
            .then(response => response.data);
    }
}