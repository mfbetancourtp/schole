import {TimestampDto} from './timestamp.dto';
import {ProfileDto} from './profile.dto';

export interface RoleDto extends TimestampDto {
    id: number;
    name: string;
    description?: any;
    profileId?: number;
    profile: ProfileDto;
}