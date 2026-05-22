import {SubjectDto} from './subject.dto';

export interface AreaDto {
    id: number;
    institutionId: number;
    thumbnail?: any;
    name: string;
    abbreviation?: any;
    createdAt?: any;
    updatedAt?: any;
    subjects: SubjectDto[];
}