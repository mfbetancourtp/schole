import {services} from '../../../shared/constant/services';
import {CreateOrUpdateBaseService} from '../../../shared/services/createOrUpdateBase.service';

export interface ICreateOrUpdateScheduleService {
    dayWeek: number,
    startTime: any,
    endTime: any,
    courseId: number | null,
    teacherPeopleId: number,
    academicPeriodGroupId : number,
    change: number,
}

export class CreateOrUpdateScheduleService extends CreateOrUpdateBaseService<ICreateOrUpdateScheduleService> {
    url = `${services.classroom}/classroom-implementation/time-tables`;
}


