import {TimestampDto} from './timestamp.dto';
import {RoleDto} from './role.dto';

export interface UserRoleDto extends TimestampDto{
    id: number;
    userInstitutionId: number;
    roleId: number;
    role: RoleDto;
}