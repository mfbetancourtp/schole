import {TimestampDto} from '../../../shared/dto/timestamp.dto';

export interface ContentTypeDto extends TimestampDto {
    id: number;
    name: string;
}