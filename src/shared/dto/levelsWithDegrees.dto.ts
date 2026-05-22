import { TimestampDto } from './timestamp.dto';

export interface DegreeDto extends TimestampDto {
    id: number;
    institutionId: number;
    thumbnail: string;
    levelId: number;
    name: string;
    abbreviation: string;
}

export interface LevelsWithDegreesDto extends TimestampDto {
    id: number;
    institutionId: number;
    thumbnail: string;
    name: string;
    abbreviation: string;
    levelTypeId?: any;
    facultyId?: any;
    maxQuality?: any;
    approvedQuality?: any;
    minQualityForRetrieval?: any;
    retrievalQuality?: any;
    degrees: DegreeDto[];
}