import {DegreeDto} from './degree.dto';

export interface LevelDto {
    id: number;
    institutionId: number;
    thumbnail?: any;
    name: string;
    abbreviation?: any;
    levelTypeId?: any;
    facultyId?: any;
    maxQuality?: any;
    approvedQuality?: any;
    minQualityForRetrieval?: any;
    retrievalQuality?: any;
    createdAt?: any;
    updatedAt?: any;
    degrees: DegreeDto[];
}