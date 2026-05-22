import {TimestampDto} from '../../../shared/dto/timestamp.dto';

export interface AttachmentDto extends TimestampDto {
    id?: number;
    institutionId?: number;
    title: string;
    description?: any;
    urlTemplate?: any;
    file?: any;
}