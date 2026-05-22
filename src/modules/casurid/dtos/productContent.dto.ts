import {TimestampDto} from '../../../shared/dto/timestamp.dto';

export interface ProductContentDto extends TimestampDto {
    id: number;
    levelId: number;
    degreeId: number;
    subjectId: number;
    title: string;
    description: string;
    index?: any;
    contentTypeId: number;
    urlLocation?: any;
    duration: number;
}