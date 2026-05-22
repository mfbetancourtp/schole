import {TimestampDto} from '../../../shared/dto/timestamp.dto';

export interface SubjectCategorieDto extends TimestampDto {
    id: number;
    institutionId: number;
    abbreviation: string;
    name: string;
    includeInOfficialReports: number;
    autoAssignUponMatriculate: number;
}