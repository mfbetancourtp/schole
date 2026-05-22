import { TimestampDto } from '../../../shared/dto/timestamp.dto';
import { CalendarTypeDto } from './calendarType.dto';
import { CurriculumDto } from './curriculum.dto';

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

export interface AcademicPeriodDto extends TimestampDto {
    id: number;
    institutionId: number;
    name: string;
    curriculumId: number;
    calendarTypeId: number;
    startDate: string;
    endDate: string;
    active: number;
    calendarType: CalendarTypeDto;
    curriculum: CurriculumDto;
    periods: PeriodDto[];
}

export interface AcademicPeriodsDto extends TimestampDto {
    academicPeriods: AcademicPeriodDto[];
    calendarTypes: CalendarTypeDto[];
    curriculums: CurriculumDto[];
}