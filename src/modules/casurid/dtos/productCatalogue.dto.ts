import {TimestampDto} from '../../../shared/dto/timestamp.dto';

export interface ProductCatalogueDto extends TimestampDto {
    id: number;
    institutionId: number;
    thumbnail?: string;
    title: string;
    levelId: number;
    degreeId: number;
    subjectId: number;
    description?: string;
    index?: string;
    productTypeId: number;
    defaultUnitValue: number;
    validityPeriod: number;
    DegreeName: string;
    subjectName: string;
}