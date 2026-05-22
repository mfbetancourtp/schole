import {TimestampDto} from './timestamp.dto';

export interface SubjectsCategoryDto extends TimestampDto {
    id: number;
    name: string;
    abbreviation: string;
    institutionId: number;
    includeInOfficialReports: number;
    autoAssignUponMatriculate: number;
}
