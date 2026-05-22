import {TimestampDto} from '../../../shared/dto/timestamp.dto';

export interface QuestionTypeDto extends TimestampDto {
    id: number;
    name: string;
}