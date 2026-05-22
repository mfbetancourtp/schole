import {TimestampDto} from '../../../shared/dto/timestamp.dto';

export interface LicensesDto extends TimestampDto {
    id: number;
    curriculumProductId: number;
    userId: number;
    registerDate: string;
    active: boolean;
    ownerPeople: string;
}