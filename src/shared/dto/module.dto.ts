import {TimestampDto} from './timestamp.dto';

export interface ModuleDto extends TimestampDto {
    id: number;
    name: string;
    description?: any;
    route: string;
    icon?: any;
    cssClass?: any;
}