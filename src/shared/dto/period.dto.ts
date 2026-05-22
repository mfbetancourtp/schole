import {TimestampDto} from './timestamp.dto';

export interface PeriodDto extends TimestampDto {
    id: number;
    institutionId: number;
    academicPeriodId: number;
    name: string;
    abbreviation: string;
    startDate: string;
    endDate: string;
    percent: number;
    percentRepproved?: any;
    order?: any;
    active: number;
}
