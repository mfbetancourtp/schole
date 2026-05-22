import {TimestampDto} from '../../../shared/dto/timestamp.dto';

export interface CopyAcademicOfferDto extends TimestampDto {
    id: number | null;
    institutionId: number | null;
    academicPeriodId: number | null;
    degreeId: number | null;
    journeyId: number | null;
    campusId?: any | null;
    groupId: number | null;
    directorPeopleId?: number | null;
    quota?: number | null;
    degreeName: string | null;
    groupName: string | null;
    journeyName: string | null;
    director: string | null;
    userIdDirector?: number | null;
}