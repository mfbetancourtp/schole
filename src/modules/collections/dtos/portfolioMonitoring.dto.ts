import {TimestampDto} from '../../../shared/dto/timestamp.dto';

export interface AcademicPeriodDto extends TimestampDto {
    id: number;
    institutionId: number;
    name: string;
    curriculumId: number;
    calendarTypeId: number;
    startDate: string;
    endDate: string;
    active: number;
}

export interface AcademicPeriodGroupDto extends TimestampDto {
    id: number;
    institutionId: number;
    academicPeriodId: number;
    degreeId: number;
    journeyId: number;
    campusId?: any;
    groupId: number;
    directorPeopleId?: number;
    quota?: number;
    degreeName: string;
    groupName: string;
    journeyName: string;
    director: string;
    userIdDirector?: number;
}        

export interface NotificationDto {
    title: string;
    message: string;
    channel: string;
    dateReceived: string;
    openAt?: any;
}

export interface CallDto extends TimestampDto {
    id: number;
    institutionId: number;
    transmitterUserId: number;
    receiverUserId: number;
    observations: string;
    dateNextContact: string;
}