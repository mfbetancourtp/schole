import {TimestampDto} from '../../../shared/dto/timestamp.dto';

export interface TypesDataDto extends TimestampDto {
    id: number;
    name: string;
}