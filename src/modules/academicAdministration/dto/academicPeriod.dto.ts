import {TimestampDto} from '../../../shared/dto/timestamp.dto';

export interface AcademicPeriodDto extends TimestampDto{
    id: number;
    institutionId: number;
    name: string;
    curriculumId: number;
    calendarTypeId: number;
    startDate: string;
    endDate: string;
    active: number;
}