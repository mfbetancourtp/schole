import {TimestampDto} from './timestamp.dto';

export interface PermissionDto extends TimestampDto {
    id: number;
    name: string;
    class?: any;
    icon?: any;
    action: string;
    scope: string;
    isPrincipal: number;
}