import { TimestampDto } from "./timestamp.dto";
import { SubjectDto } from "./subject.dto";

export interface AreaDto extends TimestampDto {
    id: number;
    institutionId: number;
    thumbnail?: any;
    name: string;
    abbreviation: string;
    createdAt: string;
    updatedAt: string;
    subjects: SubjectDto[];
}
